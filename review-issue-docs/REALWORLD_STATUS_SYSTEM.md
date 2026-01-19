# Real-World Production Status System Guide

## Overview

This document explains how major companies (Discord, Slack, Teams) handle user presence/status in production environments.

---

## 1. Multi-State Status Model

### Status Levels
```typescript
enum UserStatus {
  ONLINE = "online",        // Active right now
  IDLE = "idle",            // Online but no activity (5+ mins)
  DO_NOT_DISTURB = "dnd",   // Manual setting
  AWAY = "away",            // Away (15-30+ mins no activity)
  OFFLINE = "offline"       // Not connected
}
```

### Status Transitions
```
         ┌─────────────────┐
         │    OFFLINE      │
         └────────┬────────┘
                  │ WS Connect
                  ↓
    ┌──────────────────────────┐
    │       ONLINE             │
    │  (Active, has heartbeat) │
    └──────┬───────────┬───────┘
           │ 5 mins    │ User sets
           │ inactivity│
           ↓           ↓
        ┌──────┐  ┌──────────┐
        │ IDLE │  │    DND   │
        └──┬───┘  └──────────┘
           │ 30 mins
           ↓
        ┌──────┐
        │ AWAY │
        └──────┘
```

---

## 2. Real-time Tracking with Heartbeat

### Connection Lifecycle

```
CLIENT SIDE                          SERVER SIDE

1. User opens app
   │                                 
   ├─ WS Connect ────────────────→ Accept connection
   │                                 └─ Set status = ONLINE
   │                                 └─ Store in Redis
   │                                 └─ Broadcast event
   │
2. Every 30 seconds
   │
   ├─ Send Heartbeat/Ping ────────→ Receive ping
   │                                 └─ Update TTL in Redis (2 mins)
   │                                 └─ Mark lastSeen = now
   │
3. User inactive (5 mins)
   │
   ├─ Still connected ────────────→ Check Redis TTL
   │                                 └─ No recent heartbeat
   │                                 └─ Set status = IDLE
   │                                 └─ Broadcast event
   │
4. User closes app
   │
   ├─ WS Close ──────────────────→ Connection closed
   │                                 └─ Immediately set = OFFLINE
   │                                 └─ Broadcast event
   │
5. If network dies (crash)
   │
   ├─ (no heartbeat)              └─ Redis TTL expires
   │                                 └─ Key auto-deleted
   │                                 └─ Set = OFFLINE
```

---

## 3. Presence Data Structure

### What Gets Stored in Redis

```typescript
// Key: presence:user:{userId}
// TTL: 2 minutes (auto-expire if no heartbeat)
{
  userId: "550e8400-e29b-41d4-a716-446655440000",
  status: "online",
  lastSeen: "2025-01-19T10:35:22.123Z",      // Last activity
  lastHeartbeat: "2025-01-19T10:35:22.123Z", // Last alive signal
  deviceType: "web",                          // web/mobile/desktop
  platform: "chrome",                         // Browser or app type
  connectionId: "ws-conn-abc123def456",      // For message routing
  serverId: "server-2"                        // Which server handles this user
}
```

### What Gets Stored in Database

```typescript
// UserProfile Table
{
  userId: "550e8400-e29b-41d4-a716-446655440000",
  username: "john_doe",
  status: "online",                    // Cached from Redis
  lastSeen: "2025-01-19T10:35:22Z",   // Last known activity
  lastStatusChange: "2025-01-19T10:00:00Z"
}

// Activity Log Table (optional, for analytics)
{
  id: "log-001",
  userId: "550e8400-e29b-41d4-a716-446655440000",
  statusFrom: "offline",
  statusTo: "online",
  timestamp: "2025-01-19T10:00:00Z"
}
```

---

## 4. Cache Strategy with Redis

### Why Redis?

```
Query Pattern: "Is user online?" happens CONSTANTLY
- Friends list loads: Check 100+ friends' status
- Chat open: Check status every message
- Search: Show online indicator next to results

Database Performance:
  SQL Query → Disk I/O → 5-10ms minimum
  
Redis Performance:
  In-Memory Lookup → <1ms
  
Difference: 5000x faster!
```

### Redis Architecture

```
┌──────────────────────────────────────────────────────┐
│                    REDIS CACHE                       │
├──────────────────────────────────────────────────────┤
│ presence:user:123  → { status: "online", ... }      │
│ presence:user:456  → { status: "idle", ... }        │
│ presence:user:789  → { status: "offline", ... }     │
│                                                      │
│ TTL: 2 minutes (auto-expire)                        │
│ Cluster: Redis Cluster for HA                       │
└──────────────────────────────────────────────────────┘
```

### Cache Invalidation

```typescript
// TTL-based (simplest)
SET presence:user:123 {...} EX 120  // 2 minute expiry

// Event-based (most accurate)
When status changes:
  1. Update Redis
  2. Publish to Message Queue (Kafka/RabbitMQ)
  3. All services get notified
  4. Update their local caches
```

---

## 5. Distributed System Pattern

### Multi-Server Setup

```
                    Load Balancer
                         │
         ┌───────────────┼───────────────┐
         │               │               │
      Server 1        Server 2        Server 3
    (10 users)      (15 users)      (12 users)
         │               │               │
         └───────────────┼───────────────┘
                         │
                    ┌────────────────┐
                    │   Redis Cache  │
                    │ (Single Source │
                    │   of Truth)    │
                    └────────────────┘
                         │
                    ┌────────────────┐
                    │   PostgreSQL   │
                    │   (Persistent) │
                    └────────────────┘
```

### Status Lookup Flow

```typescript
function getUserStatus(userId: string) {
  // 1. Check Redis first (instant)
  const cached = redis.get(`presence:user:${userId}`);
  
  if (cached) {
    return cached;  // <1ms
  }
  
  // 2. If not in cache, check database
  const dbStatus = db.query(`SELECT status FROM UserProfile WHERE userId = ?`);
  
  // 3. Update cache for next time
  redis.set(`presence:user:${userId}`, dbStatus, EX 120);
  
  return dbStatus;
}
```

---

## 6. Block/Privacy Handling

### Block Logic in Production

```typescript
function getUserStatus(targetUserId: string, requestingUserId: string) {
  
  // Check if target blocked requester
  const blockedByTarget = await db.isBlocked(targetUserId, requestingUserId);
  if (blockedByTarget) {
    return "offline";  // Lie - don't reveal real status
  }
  
  // Check if requester blocked target
  const requestorBlocked = await db.isBlocked(requestingUserId, targetUserId);
  if (requestorBlocked) {
    // Requester chose to block, they can see status
    // but target won't see when requester is online
    return getActualStatus(targetUserId);
  }
  
  // Neither blocked
  return getActualStatus(targetUserId);
}
```

### Privacy Matrix

```
Scenario                              | Show Real Status?
──────────────────────────────────────┼─────────────────
A and B are friends                   | YES
A blocked B                           | NO (show offline)
B blocked A                           | NO (hide from A)
Neither knows each other              | YES
A and B are enemies (game)            | NO (depends on game setting)
```

---

## 7. Event Broadcasting

### When Status Changes

```
User A goes OFFLINE
         │
         ├─ Update Redis
         │  presence:user:A → { status: "offline" }
         │
         ├─ Publish Event
         │  Topic: "user.status.changed"
         │  Message: { userId: "A", status: "offline", timestamp: ... }
         │
         ├─ Notification Service subscribes
         │  ├─ Get all of A's friends
         │  └─ Send WS message to each friend's client
         │
         ├─ Game Service subscribes
         │  ├─ If A was IN_GAME: cancel game
         │  └─ Notify other players
         │
         └─ Analytics Service subscribes
            └─ Record session duration
```

### Message Queue Example (Using Kafka)

```typescript
// Producer (user-service)
await kafka.publish('user.status.changed', {
  userId: 'A',
  oldStatus: 'online',
  newStatus: 'offline',
  timestamp: new Date(),
  reason: 'ws_disconnect'
});

// Consumer 1 (notification-service)
kafka.subscribe('user.status.changed', async (msg) => {
  if (msg.newStatus === 'offline') {
    notifyFriends(msg.userId, 'User went offline');
  }
});

// Consumer 2 (stats-service)
kafka.subscribe('user.status.changed', async (msg) => {
  recordStatusChange(msg);
  calculateSessionDuration(msg.userId);
});

// Consumer 3 (game-service)
kafka.subscribe('user.status.changed', async (msg) => {
  if (msg.newStatus === 'offline') {
    removeFromActiveGames(msg.userId);
  }
});
```

---

## 8. Consistency Pattern (Eventual Consistency)

### The Challenge

```
User closes app at 10:00:00
Client: WS closes immediately
Server: Needs to process close event
       Also has Redis TTL expiring

Issue: Small delay (100-500ms) where status might show ONLINE
       but user is actually offline
```

### The Solution: Eventual Consistency

```
Accept: User might show online for few seconds after logout
Reason: Network packets can be delayed
Result: Much more reliable, fewer false positives

Implementation:
1. On WS close → Immediately set OFFLINE
2. Also set Redis TTL → Backup mechanism
3. Trust the most recent timestamp
4. Clients refresh status every 10-30 seconds
```

### Consistency Code

```typescript
// When getting status, check timestamp
function getStatus(userId: string) {
  const presence = redis.get(`presence:user:${userId}`);
  
  if (!presence) {
    return "offline";  // Redis expired or not set
  }
  
  // Check if heartbeat is too old
  const timeSinceHeartbeat = Date.now() - presence.lastHeartbeat;
  
  if (timeSinceHeartbeat > 5 * 60 * 1000) {
    // 5 minutes no heartbeat = force offline
    redis.delete(`presence:user:${userId}`);
    return "offline";
  }
  
  return presence.status;
}
```

---

## 9. Common Production Implementations

### Company Stack Comparison

| Company | Tech Stack | Scale |
|---------|-----------|-------|
| **Discord** | WebSocket + Redis + PostgreSQL | 150M+ DAU |
| **Slack** | WebSocket + Redis Cluster + DynamoDB | 20M+ DAU |
| **Microsoft Teams** | SignalR + Azure Redis | 300M+ DAU |
| **Telegram** | Custom Protocol + Cassandra | 500M+ DAU |
| **Facebook Messenger** | HTTP Long-polling + Memcached | 1B+ DAU |

### Simple Stack (For smaller apps)
```
Client ←→ WebSocket ←→ Node.js
                         ├─ Redis (cache)
                         └─ PostgreSQL (DB)
```

### Enterprise Stack (For scale)
```
Client ←→ WebSocket ←→ Load Balancer
                         ├─ Server Pool (20+)
                         │   ├─ Redis Cluster (HA)
                         │   ├─ Message Queue (Kafka)
                         │   └─ PostgreSQL Replica Set
```

---

## 10. Implementation Checklist

### Phase 1: Basic (What you have now)
- [x] Status stored in DB (ONLINE/OFFLINE/IN_GAME)
- [x] HTTP endpoint to get status
- [x] Block check before returning status
- [x] Error handling

### Phase 2: Real-time (Add WebSocket)
- [ ] WebSocket for status updates
- [ ] Heartbeat mechanism (30s ping)
- [ ] Auto-OFFLINE on disconnect
- [ ] Event broadcasting to friends

### Phase 3: Production-Ready
- [ ] Redis cache for status
- [ ] Redis TTL auto-expiry
- [ ] Message Queue for events
- [ ] Distributed session handling
- [ ] Status history/logging
- [ ] Analytics (session duration)
- [ ] Monitoring & alerts

### Phase 4: Scale (If needed)
- [ ] Redis Cluster
- [ ] Database replication
- [ ] Load balancing
- [ ] Service mesh (Kubernetes)

---

## 11. Key Metrics to Track

```typescript
Metrics to Monitor:

1. Status Accuracy
   - How many users show online but are actually offline?
   - Goal: <1% error rate

2. Latency
   - Time to update friend's status (end-to-end)
   - Goal: <500ms

3. Cache Hit Rate
   - How often Redis has the status?
   - Goal: >95%

4. WebSocket Connection Count
   - Connected clients right now
   - Alert if drops unexpectedly

5. Heartbeat Timeout Rate
   - How many users lose connection
   - Detect network issues

Example monitoring:
gauge('online_users', 12500)
gauge('cache_hit_rate', 0.97)
timing('status_lookup_ms', 0.8)
counter('heartbeat_misses', 45)
```

---

## 12. Common Pitfalls to Avoid

```
❌ WRONG:
1. Query database for every status check
   → Will cause database overload
   
2. Show real status when blocked
   → Privacy violation
   
3. No heartbeat mechanism
   → Users stuck ONLINE forever after disconnect
   
4. Single Redis instance
   → One failure = all status goes down
   
5. No event broadcasting
   → Friends don't see status updates in real-time
   
6. Trust only last database write
   → Doesn't account for network delays

✅ RIGHT:
1. Cache in Redis (TTL-based)
2. Return OFFLINE when blocked
3. Heartbeat + WebSocket close handler
4. Redis Cluster/Replication
5. Publish events on status change
6. Use timestamps + eventual consistency
```

---

## Conclusion

**For your project:**

- If this is for learning/small project: Keep it simple (Phase 1-2)
- If this is production: Implement Phase 2-3
- If you need massive scale: Plan Phase 4 from start

Next step: Decide your project scale and requirements!
