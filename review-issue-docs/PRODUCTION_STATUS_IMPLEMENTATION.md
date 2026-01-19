# Production-Ready Status System Implementation

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│            3-STATE PRODUCTION STATUS SYSTEM                 │
│                (ONLINE / IN_GAME / OFFLINE)                 │
└─────────────────────────────────────────────────────────────┘

with Real-time Updates + Block Awareness
```

---

## 1. Status States & Transitions

### Valid States
```typescript
enum UserStatus {
  ONLINE = "ONLINE",      // Connected and active
  IN_GAME = "IN_GAME",    // Playing a game
  OFFLINE = "OFFLINE"     // Not connected
}

// Transitions
OFFLINE → ONLINE    (User connects via WebSocket)
ONLINE  → IN_GAME   (User joins game)
IN_GAME → ONLINE    (User finishes game)
ONLINE  → OFFLINE   (User disconnects/closes app)
IN_GAME → OFFLINE   (Network crash while gaming)
```

---

## 2. Database Schema (Updated)

```prisma
model UserProfile {
  id               String    @id @default(uuid())
  userId           String    @unique
  username         String    @unique
  avatarUrl        String?
  status           String    @default("OFFLINE")  // ONLINE, IN_GAME, OFFLINE
  lastSeen         DateTime  @default(now())      // Last activity timestamp
  lastHeartbeat    DateTime  @default(now())      // Last heartbeat from WS
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  sentRequests     Friendship[] @relation("sentRequests")
  receivedRequests Friendship[] @relation("receivedRequests")
  blocks           Block[]      @relation("blocks")
  blockedBy        Block[]      @relation("blockedBy")

  @@index([status])         // For filtering online users
  @@index([lastHeartbeat])  // For timeout queries
}

model Block {
  id        String      @id @default(uuid())
  blocker   UserProfile @relation("blocks", fields: [blockerId], references: [userId])
  blockerId String
  blocked   UserProfile @relation("blockedBy", fields: [blockedId], references: [userId])
  blockedId String
  createdAt DateTime    @default(now())

  @@unique([blockerId, blockedId])
}
```

---

## 3. Backend Implementation

### 3.1 Status Manager Service

**File:** `user-service/src/services/status/statusManager.service.ts`

```typescript
import prisma from "src/utils/prismaClient.js";
import { AppError } from "@core/utils/AppError.js";
import { UserStatus } from "src/types/userStatus.js";
import { statusEmitter } from "src/utils/statusEventEmitter.js";

class StatusManager {
  /**
   * Update user status (internal use - from other services)
   * @param userId - User ID
   * @param newStatus - New status (ONLINE, IN_GAME, OFFLINE)
   */
  async updateStatus(userId: string, newStatus: UserStatus): Promise<void> {
    if (!Object.values(UserStatus).includes(newStatus)) {
      throw new AppError('INVALID_STATUS');
    }

    try {
      const user = await prisma.userProfile.findUnique({
        where: { userId },
        select: { status: true }
      });

      if (!user) {
        throw new AppError('USER_NOT_FOUND');
      }

      const oldStatus = user.status;

      // Update database
      await prisma.userProfile.update({
        where: { userId },
        data: {
          status: newStatus,
          lastSeen: new Date(),
          lastHeartbeat: new Date()
        }
      });

      // Emit event for real-time broadcasting
      statusEmitter.emitStatusChange(userId, oldStatus, newStatus);

    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('USER_NOT_FOUND');
      }
      throw error;
    }
  }

  /**
   * Update heartbeat (called every 30 seconds from WebSocket)
   * @param userId - User ID
   */
  async updateHeartbeat(userId: string): Promise<void> {
    try {
      await prisma.userProfile.update({
        where: { userId },
        data: { lastHeartbeat: new Date() }
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new AppError('USER_NOT_FOUND');
      }
      throw error;
    }
  }

  /**
   * Get user status with block awareness
   * @param targetUserId - The user whose status we want
   * @param requestingUserId - The user requesting the status
   * @returns { status, isBlocked }
   */
  async getUserStatus(
    targetUserId: string,
    requestingUserId: string
  ): Promise<{ status: UserStatus; isBlocked: boolean }> {
    
    // Get target user
    const targetUser = await prisma.userProfile.findUnique({
      where: { userId: targetUserId },
      select: { status: true }
    });

    if (!targetUser) {
      throw new AppError('USER_NOT_FOUND');
    }

    // Check if either user blocked the other
    const block = await prisma.block.findFirst({
      where: {
        OR: [
          { blockerId: targetUserId, blockedId: requestingUserId },    // Target blocked requester
          { blockerId: requestingUserId, blockedId: targetUserId }     // Requester blocked target
        ]
      }
    });

    // If blocked, return OFFLINE (hide real status)
    if (block) {
      return {
        status: 'OFFLINE' as UserStatus,
        isBlocked: true
      };
    }

    return {
      status: targetUser.status as UserStatus,
      isBlocked: false
    };
  }

  /**
   * Get multiple users' statuses efficiently
   * @param targetUserIds - Array of user IDs to check
   * @param requestingUserId - The user requesting the statuses
   */
  async getUsersStatuses(
    targetUserIds: string[],
    requestingUserId: string
  ): Promise<Record<string, { status: UserStatus; isBlocked: boolean }>> {
    
    const results: Record<string, { status: UserStatus; isBlocked: boolean }> = {};

    // Get all target users
    const users = await prisma.userProfile.findMany({
      where: { userId: { in: targetUserIds } },
      select: { userId: true, status: true }
    });

    // Get all blocks (both directions)
    const blocks = await prisma.block.findMany({
      where: {
        OR: [
          { blockedId: requestingUserId },
          { blockerId: requestingUserId }
        ]
      },
      select: { blockerId: true, blockedId: true }
    });

    const blockedSet = new Set(
      blocks.flatMap(b => [b.blockerId, b.blockedId])
    );

    for (const user of users) {
      const isBlocked = blockedSet.has(user.userId) || blockedSet.has(requestingUserId);
      results[user.userId] = {
        status: isBlocked ? 'OFFLINE' : (user.status as UserStatus),
        isBlocked
      };
    }

    return results;
  }

  /**
   * Auto-set users to OFFLINE if no heartbeat for 2 minutes
   * Run this as a cron job every minute
   */
  async cleanupOfflineUsers(): Promise<void> {
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    const offlineUsers = await prisma.userProfile.updateMany({
      where: {
        AND: [
          { status: { not: 'OFFLINE' } },
          { lastHeartbeat: { lt: twoMinutesAgo } }
        ]
      },
      data: { status: 'OFFLINE' }
    });

    console.log(`Auto-offline: ${offlineUsers.count} users`);
  }
}

export const statusManager = new StatusManager();
```

### 3.2 Status Event Emitter

**File:** `user-service/src/utils/statusEventEmitter.ts`

```typescript
import EventEmitter from 'events';
import { UserStatus } from 'src/types/userStatus.js';

interface StatusChangeEvent {
  userId: string;
  oldStatus: UserStatus;
  newStatus: UserStatus;
  timestamp: Date;
}

class StatusEventEmitter extends EventEmitter {
  emitStatusChange(userId: string, oldStatus: string, newStatus: string): void {
    const event: StatusChangeEvent = {
      userId,
      oldStatus: oldStatus as UserStatus,
      newStatus: newStatus as UserStatus,
      timestamp: new Date()
    };

    this.emit('status:changed', event);
    console.log(`Status changed: ${userId} ${oldStatus} → ${newStatus}`);
  }

  onStatusChanged(callback: (event: StatusChangeEvent) => void): void {
    this.on('status:changed', callback);
  }
}

export const statusEmitter = new StatusEventEmitter();
```

### 3.3 Updated getUserStatus Service

**File:** `user-service/src/services/basic/getUserStatus.service.ts`

```typescript
import { statusManager } from "../status/statusManager.service.js";

const getUserStatus = async (targetUserId: string, requestingUserId: string) => {
  return await statusManager.getUserStatus(targetUserId, requestingUserId);
};

export default getUserStatus;
```

### 3.4 Updated getUserStatus Controller

**File:** `user-service/src/controllers/basic/getUserStatus.controller.ts`

```typescript
import { FastifyReply } from "fastify";
import { AuthRequest } from '@core/types/authRequest.js';
import { getUserStatus } from '@services/basic/index.js';
import { userByIdDTO } from "src/dto/user-by-id.dto.js";
import sendError from "@core/utils/sendError.js";

const getUserStatusHandler = async (
  request: AuthRequest<undefined, undefined, userByIdDTO>,
  reply: FastifyReply
) => {
  try {
    const requestingUserId = request.userId;
    const { userId: targetUserId } = request.params;

    const data = await getUserStatus(targetUserId, requestingUserId);

    reply.status(200).send({
      status: 'success',
      data,
      message: 'User status retrieved successfully'
    });

  } catch (error: any) {
    switch (error.code) {
      case 'USER_NOT_FOUND':
        return sendError(reply, 404, error.code, 'The requested user does not exist.');

      default:
        return sendError(reply, 500, 'INTERNAL_SERVER_ERROR', 'Internal server error');
    }
  }
};

export default getUserStatusHandler;
```

### 3.5 WebSocket Handler (Real-time Updates)

**File:** `notification-service/src/ws/statusWebSocket.handler.ts`

```typescript
import { FastifyRequest } from "fastify";
import { WebSocket } from "ws";
import authenticateWs from '@core/utils/authenticate.ws.js';
import { AppError } from "@core/utils/AppError.js";
import { statusManager } from "@services/status/statusManager.service.js";
import { statusEmitter } from "@utils/statusEventEmitter.js";

const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds
const HEARTBEAT_TIMEOUT = 2 * 60 * 1000; // 2 minutes

interface ClientConnection {
  userId: string;
  ws: WebSocket;
  heartbeatTimer: NodeJS.Timeout;
}

// Store active connections
const activeConnections = new Map<string, ClientConnection>();

const wsStatusHandler = async (ws: WebSocket, request: FastifyRequest) => {
  let userId: string;

  try {
    // Authenticate user
    const authResult = authenticateWs(request.headers['authorization'], ws);
    userId = authResult.userId;

    // Update status to ONLINE
    await statusManager.updateStatus(userId, 'ONLINE');

    // Store connection
    const heartbeatTimer = setInterval(async () => {
      // Send ping to client
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
        // Update heartbeat in DB
        await statusManager.updateHeartbeat(userId);
      }
    }, HEARTBEAT_INTERVAL);

    activeConnections.set(userId, { userId, ws, heartbeatTimer });

    console.log(`User ${userId} connected - Status: ONLINE`);

    // Handle incoming messages from client
    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);

        if (message.type === 'status-update') {
          // User manually changed status (ONLINE or IN_GAME)
          await statusManager.updateStatus(userId, message.status);
        } else if (message.type === 'pong') {
          // Client responded to our ping
          await statusManager.updateHeartbeat(userId);
        }
      } catch (error) {
        console.error('Error handling WS message:', error);
      }
    });

    // Handle disconnect
    ws.on('close', async () => {
      clearInterval(heartbeatTimer);
      activeConnections.delete(userId);

      // Update status to OFFLINE
      await statusManager.updateStatus(userId, 'OFFLINE');

      console.log(`User ${userId} disconnected - Status: OFFLINE`);
    });

    // Handle errors
    ws.on('error', async (error) => {
      console.error(`WS error for user ${userId}:`, error);
      clearInterval(heartbeatTimer);
      activeConnections.delete(userId);
      await statusManager.updateStatus(userId, 'OFFLINE');
    });

  } catch (error) {
    if (error instanceof AppError) {
      ws.close(1008, error.code);
    } else {
      ws.close(1011, "INTERNAL_SERVER_ERROR");
    }
  }
};

export default wsStatusHandler;
export { activeConnections };
```

### 3.6 Status Change Event Listener

**File:** `notification-service/src/listeners/statusChange.listener.ts`

```typescript
import { statusEmitter } from "@utils/statusEventEmitter.js";
import { activeConnections } from "@ws/statusWebSocket.handler.js";
import prisma from "@utils/prismaClient.js";

// Listen for status changes and notify friends
statusEmitter.onStatusChanged(async (event) => {
  try {
    const { userId, newStatus } = event;

    // Get user's friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderUserId: userId, status: 'accepted' },
          { receiverUserId: userId, status: 'accepted' }
        ]
      },
      select: {
        senderUserId: true,
        receiverUserId: true
      }
    });

    // Notify each friend
    for (const friendship of friendships) {
      const friendId = friendship.senderUserId === userId 
        ? friendship.receiverUserId 
        : friendship.senderUserId;

      const friendConnection = activeConnections.get(friendId);

      if (friendConnection && friendConnection.ws.readyState === WebSocket.OPEN) {
        // Send real-time notification to friend
        friendConnection.ws.send(JSON.stringify({
          type: 'friend-status-changed',
          data: {
            userId,
            status: newStatus,
            timestamp: event.timestamp
          }
        }));
      }
    }

  } catch (error) {
    console.error('Error notifying friends:', error);
  }
});
```

---

## 4. Frontend Implementation

### 4.1 WebSocket Connection & Status Management

**File:** `frontend/src/services/statusService.ts`

```typescript
class StatusService {
  private ws: WebSocket | null = null;
  private userId: string = '';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Set<(status: UserStatus) => void> = new Set();

  /**
   * Connect to status WebSocket
   */
  connect(userId: string, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.userId = userId;
        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsUrl = `${protocol}://${window.location.host}/api/status`;

        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Status WS connected');
          this.reconnectAttempts = 0;
          
          // Send auth token
          this.ws?.send(JSON.stringify({
            type: 'auth',
            token
          }));

          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('Status WS error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('Status WS closed');
          this.attemptReconnect(token);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);

      switch (message.type) {
        case 'friend-status-changed':
          // Friend's status changed in real-time
          console.log(`Friend ${message.data.userId} is now ${message.data.status}`);
          this.notifyListeners(message.data);
          break;

        case 'ping':
          // Respond to server ping with pong
          this.ws?.send(JSON.stringify({ type: 'pong' }));
          break;
      }
    } catch (error) {
      console.error('Error handling WS message:', error);
    }
  }

  /**
   * Update current user's status
   */
  updateStatus(status: 'ONLINE' | 'IN_GAME'): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'status-update',
        status
      }));
    }
  }

  /**
   * Get user status (HTTP call for initial load)
   */
  async getUserStatus(userId: string): Promise<UserStatusResponse> {
    const response = await fetch(`/api/users/status/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to get status');
    const data = await response.json();
    return data.data;
  }

  /**
   * Get multiple users' statuses
   */
  async getUsersStatuses(userIds: string[]): Promise<Record<string, UserStatusResponse>> {
    const response = await fetch(`/api/users/statuses?ids=${userIds.join(',')}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) throw new Error('Failed to get statuses');
    const data = await response.json();
    return data.data;
  }

  /**
   * Subscribe to status updates
   */
  onStatusChanged(callback: (data: any) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of status change
   */
  private notifyListeners(data: any): void {
    this.listeners.forEach(listener => listener(data));
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(token: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);
      console.log(`Reconnecting in ${delay}ms...`);
      
      setTimeout(() => {
        this.connect(this.userId, token);
      }, delay);
    }
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const statusService = new StatusService();

export interface UserStatusResponse {
  status: 'ONLINE' | 'IN_GAME' | 'OFFLINE';
  isBlocked: boolean;
}
```

### 4.2 React Component - Status Indicator

**File:** `frontend/src/components/UserStatusIndicator.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { statusService, UserStatusResponse } from '@services/statusService';
import './StatusIndicator.css';

interface Props {
  userId: string;
}

export const UserStatusIndicator: React.FC<Props> = ({ userId }) => {
  const [status, setStatus] = useState<UserStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial status load
    statusService.getUserStatus(userId)
      .then(setStatus)
      .catch(err => console.error('Failed to load status:', err))
      .finally(() => setLoading(false));

    // Subscribe to real-time updates
    const unsubscribe = statusService.onStatusChanged((data) => {
      if (data.userId === userId) {
        setStatus({
          status: data.status,
          isBlocked: false
        });
      }
    });

    return unsubscribe;
  }, [userId]);

  if (loading) return <div className="status-skeleton" />;
  if (!status) return <span>Unknown</span>;

  const getStatusColor = () => {
    if (status.isBlocked) return 'blocked';
    switch (status.status) {
      case 'ONLINE': return 'online';
      case 'IN_GAME': return 'in-game';
      case 'OFFLINE': return 'offline';
    }
  };

  const getStatusText = () => {
    if (status.isBlocked) return 'Blocked';
    switch (status.status) {
      case 'ONLINE': return 'Online';
      case 'IN_GAME': return 'In Game';
      case 'OFFLINE': return 'Offline';
    }
  };

  return (
    <div className={`status-indicator status-${getStatusColor()}`}>
      <span className="status-dot" />
      <span className="status-text">{getStatusText()}</span>
    </div>
  );
};
```

### 4.3 React Component - Status Updater

**File:** `frontend/src/components/StatusUpdater.tsx`

```typescript
import React from 'react';
import { statusService } from '@services/statusService';

export const StatusUpdater: React.FC = () => {
  const handleJoinGame = () => {
    console.log('Joining game...');
    statusService.updateStatus('IN_GAME');
  };

  const handleLeaveGame = () => {
    console.log('Leaving game...');
    statusService.updateStatus('ONLINE');
  };

  return (
    <div className="status-updater">
      <button 
        onClick={handleJoinGame}
        className="btn-primary"
      >
        Join Game
      </button>
      <button 
        onClick={handleLeaveGame}
        className="btn-secondary"
      >
        Back to Online
      </button>
    </div>
  );
};
```

### 4.4 CSS for Status Indicator

**File:** `frontend/src/components/StatusIndicator.css`

```css
.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-online .status-dot {
  background-color: #10b981;
}

.status-in-game .status-dot {
  background-color: #f59e0b;
}

.status-offline .status-dot {
  background-color: #6b7280;
}

.status-blocked .status-dot {
  background-color: #ef4444;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-skeleton {
  height: 24px;
  width: 100px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

---

## 5. Usage in Frontend

### 5.1 Initialize in App Component

```typescript
// App.tsx
import { useEffect } from 'react';
import { statusService } from '@services/statusService';

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (token && userId) {
      statusService.connect(userId, token)
        .then(() => console.log('Status service connected'))
        .catch(err => console.error('Failed to connect:', err));
    }

    return () => {
      statusService.disconnect();
    };
  }, []);

  return (
    // Your app components
  );
}

export default App;
```

### 5.2 Show Friend Status in Friends List

```typescript
// FriendsList.tsx
import { UserStatusIndicator } from '@components/UserStatusIndicator';

interface Friend {
  userId: string;
  username: string;
}

export const FriendsList: React.FC<{ friends: Friend[] }> = ({ friends }) => {
  return (
    <ul className="friends-list">
      {friends.map(friend => (
        <li key={friend.userId} className="friend-item">
          <span>{friend.username}</span>
          <UserStatusIndicator userId={friend.userId} />
        </li>
      ))}
    </ul>
  );
};
```

### 5.3 Show Status in User Profile

```typescript
// UserProfile.tsx
import { UserStatusIndicator } from '@components/UserStatusIndicator';

export const UserProfile: React.FC<{ userId: string }> = ({ userId }) => {
  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>User Profile</h2>
        <UserStatusIndicator userId={userId} />
      </div>
      {/* Rest of profile */}
    </div>
  );
};
```

### 5.4 Update Status During Gameplay

```typescript
// GamePage.tsx
import { StatusUpdater } from '@components/StatusUpdater';

export const GamePage: React.FC = () => {
  return (
    <div className="game-container">
      <StatusUpdater />
      {/* Game board */}
    </div>
  );
};
```

---

## 6. API Endpoints

### Get User Status
```
GET /api/users/status/:userId
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "status": "ONLINE",  // ONLINE, IN_GAME, OFFLINE
    "isBlocked": false
  },
  "message": "User status retrieved successfully"
}
```

### Get Multiple Statuses
```
GET /api/users/statuses?ids=user1,user2,user3
Authorization: Bearer {token}

Response:
{
  "status": "success",
  "data": {
    "user1": { "status": "ONLINE", "isBlocked": false },
    "user2": { "status": "IN_GAME", "isBlocked": false },
    "user3": { "status": "OFFLINE", "isBlocked": true }
  }
}
```

### WebSocket Connection
```
ws://localhost:3000/api/status
wss://localhost:3000/api/status (secure)

Messages:
1. Auth: { "type": "auth", "token": "jwt" }
2. Status Update: { "type": "status-update", "status": "IN_GAME" }
3. Ping/Pong: { "type": "pong" }

Incoming:
1. Status Change: { 
     "type": "friend-status-changed",
     "data": { 
       "userId": "123", 
       "status": "ONLINE", 
       "timestamp": "..." 
     } 
   }
```

---

## 7. Status Behavior Summary

### State Transitions
```
User Action → Status Update → DB Update → Event Emitted → Friends Notified

OFFLINE (not connected)
  ↓
User opens app → WS connects
  ↓
ONLINE (connected, set status on connect)
  ↓
User joins game → sends status-update message
  ↓
IN_GAME (user is playing)
  ↓
User finishes game → sends status-update to ONLINE
  ↓
ONLINE
  ↓
User closes app / WS disconnects OR no heartbeat for 2 mins
  ↓
OFFLINE
```

### Block Behavior
```
When User A requests User B's status:

If B blocked A:
  └─ Return { status: "OFFLINE", isBlocked: true }

If A blocked B:
  └─ Return { status: B's real status, isBlocked: true }
  
If neither blocked:
  └─ Return { status: B's real status, isBlocked: false }

Note: Frontend shows "Blocked" but still returns OFFLINE status for privacy
```

---

## 8. Implementation Checklist

- [ ] Update UserProfile schema with `lastHeartbeat`
- [ ] Create StatusManager service
- [ ] Create StatusEventEmitter
- [ ] Create/Update WebSocket handler
- [ ] Create StatusChange listener
- [ ] Fix getUserStatus service
- [ ] Update getUserStatus controller
- [ ] Add statusManager.getUsersStatuses() endpoint
- [ ] Add heartbeat cleanup cron job
- [ ] Create frontend StatusService
- [ ] Create UserStatusIndicator component
- [ ] Create StatusUpdater component
- [ ] Initialize status service in App.tsx
- [ ] Add status indicators to Friends list
- [ ] Add status indicators to User profiles
- [ ] Test real-time updates
- [ ] Test block scenarios
- [ ] Test disconnect/reconnect

---

## 9. Key Points

✅ **Three states**: ONLINE, IN_GAME, OFFLINE
✅ **Real-time**: WebSocket for instant updates
✅ **Heartbeat**: Auto-OFFLINE after 2 mins no heartbeat
✅ **Block aware**: Returns OFFLINE when blocked
✅ **Event driven**: Status changes trigger notifications
✅ **Frontend ready**: Easy React integration

Now ready to implement! Tell me which file to start with.
