# User Status Architecture Guide

## Current Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER STATUS SYSTEM                       │
└─────────────────────────────────────────────────────────────┘

1. STATUS UPDATE (Real-time)
   ├─ WebSocket Connection (notification-service)
   │  └─ ws://notification-service/status
   │     ├─ User connects → updateStatus(userId, 'ONLINE')
   │     └─ User disconnects → updateStatus(userId, 'OFFLINE')
   │
   └─ HTTP API (user-service)
      └─ PATCH /internal/{userId}/status
         └─ Body: { status: 'ONLINE' | 'OFFLINE' | 'IN_GAME' }

2. STATUS RETRIEVAL (With Block Check)
   └─ GET /status/{userId}
      ├─ Requires: Authentication
      ├─ Check: Is requesting user blocked by target?
      ├─ Check: Did requesting user block target?
      └─ Return: { status, isBlocked, message }
```

## Key Considerations

### Block Handling Strategy
```typescript
// If blocked EITHER way:
if (targetBlocked requester OR requester blocked target) {
    return { status: 'OFFLINE', isBlocked: true }
}
// Don't reveal real status when blocked
```

### Real-time Status Analysis

For real-time analysis, you need:

#### Option 1: Pub/Sub Pattern (RECOMMENDED)
```typescript
// When status changes, publish event
statusUpdateEvent: {
  userId: string,
  oldStatus: string,
  newStatus: string,
  timestamp: Date,
  source: 'websocket' | 'http'
}

// Services subscribe and react
- notification-service: Notify friends
- game-service: Handle IN_GAME state
- stats-service: Track online duration
- room-service: Manage available players
```

#### Option 2: Redis Pub/Sub
```typescript
// Real-time status tracking
redis.publish('user:status', {
  userId,
  status,
  timestamp
})

// Track last online time
redis.set(`user:last-online:${userId}`, timestamp)
```

## Implementation Checklist

### ✅ Implemented
- [x] Basic status update (ONLINE/OFFLINE/IN_GAME)
- [x] Block check before returning status
- [x] WebSocket real-time updates
- [x] Error handling

### ⚠️ Needs Improvement
- [ ] Unified status getter with block awareness
- [ ] Status consistency (what if user in DB is ONLINE but WebSocket disconnected?)
- [ ] Real-time event system for status changes
- [ ] Status history/analytics
- [ ] Timeout mechanism (auto-OFFLINE if no heartbeat)

### 🔄 Real-time Implementation

#### Add Status Change Events
```typescript
// user-service/src/utils/statusEventEmitter.ts
import EventEmitter from 'events';

class StatusEventEmitter extends EventEmitter {
  emitStatusChange(userId: string, oldStatus: string, newStatus: string) {
    this.emit('status:changed', {
      userId,
      oldStatus,
      newStatus,
      timestamp: new Date()
    });
  }
}

export const statusEmitter = new StatusEventEmitter();
```

#### Update Status Service to Emit Events
```typescript
// In updateStatus service
await prisma.userProfile.update({
  where: { userId },
  data: { status }
});

// Emit event for other services
statusEmitter.emitStatusChange(userId, oldStatus, status);
```

#### Subscribe in Other Services
```typescript
// notification-service
statusEmitter.on('status:changed', (data) => {
  if (data.newStatus === 'OFFLINE') {
    notifyFriends(data.userId, 'User went offline');
  }
});

// game-service
statusEmitter.on('status:changed', (data) => {
  if (data.newStatus === 'IN_GAME') {
    updateGameLobby(data.userId);
  }
});
```

## Best Practices

1. **Always check blocks before returning status**
   - Don't reveal real status to blocked users
   - Hide presence information

2. **Use WebSocket for real-time updates**
   - Keep connections alive with heartbeats
   - Auto-disconnect after timeout (e.g., 30 seconds)

3. **Track status changes with events**
   - Enable reactive updates across services
   - Maintain consistency

4. **Implement status timeout**
   ```typescript
   // If user doesn't update status in X minutes
   // Auto-set to OFFLINE
   if (Date.now() - lastStatusUpdate > 5 * 60 * 1000) {
     updateStatus(userId, 'OFFLINE');
   }
   ```

5. **Consider edge cases**
   - User closes app unexpectedly
   - Network disconnect
   - Browser tab closed
   - Computer sleep/hibernation

## Database Optimization

Consider adding indices for status queries:
```prisma
model UserProfile {
  // ... existing fields
  status           String       @default("OFFLINE")
  lastStatusUpdate DateTime     @default(now())
  
  @@index([status])  // For fast filtering
}
```

## API Response Format

```typescript
// GET /status/{userId}
{
  status: 'success',
  data: {
    status: 'ONLINE',           // The user's current status
    isBlocked: false,           // Whether they're blocked
    message: null               // Optional message
  },
  message: 'User status retrieved successfully'
}

// If blocked:
{
  status: 'success',
  data: {
    status: 'OFFLINE',          // Fake status
    isBlocked: true,            // Transparency
    message: 'This user is not available'
  },
  message: 'User status retrieved successfully'
}
```
