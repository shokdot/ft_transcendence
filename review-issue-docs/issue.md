# Deep Security & Bug Analysis Report

This document outlines critical issues, security vulnerabilities, and architectural problems discovered in the integration between `room-service`, `game-service`, and `user-service`.

## 1. Security Vulnerabilities

### 1.1 Service Token Risks (High)
- **Problem**: Internal service communication relies on a static `SERVICE_TOKEN` passed in headers (`x-service-token`).
- **Risk**: If this token is leaked, an attacker can:
  - Forge game results (`/finish` endpoint).
  - Forcefully remove players from any room (`/leave-internal`).
  - Broadcast fake system notifications.
- **Recommendation**: Implement temporary, short-lived JWE/JWT tokens for service-to-service auth or use mutual TLS (mTLS) if running in a cluster.

### 1.2 WebSocket Authentication Persistence (Medium)
- **Problem**: `authenticateWs` is only called during the initial handshake.
- **Risk**: If a user's session is revoked or expires during a 20-minute game, they remain connected and can continue playing.
- **Recommendation**: Periodically re-verify the session or use a global session-revocation broadcast that the `game-service` listens to.

### 1.3 Exposure of Internal Endpoints (Medium)
- **Problem**: Endpoints like `/:roomId/leave-internal` are part of the public API surface area, protected only by a token.
- **Risk**: Increases the attack surface. 
- **Recommendation**: Move internal-only endpoints to a separate port or a private network segment not accessible via the main Load Balancer/Nginx.

---

## 2. Logic & Synchronization Bugs

### 2.1 The "Abandoned Game" Memory Leak (High)
- **Problem**: `GameManager` only cleans up a game when `players.size === 0`. 
- **Scenario**: If a user loses internet connection without the socket sending a "close" frame (e.g., computer crash), the `Player` object might stay in the `Set` indefinitely.
- **Risk**: Memory leak and "Room Full" errors for new players trying to join that specific room ID.
- **Recommendation**: Implement a heartbeat/ping-pong mechanism for WebSockets and a "Game Timeout" if no input is received for X minutes.

### 2.2 Status Inconsistency (Medium)
- **Problem**: `GameManager.updateUserStatus` fails silently with `console.error`.
- **Scenario**: If `user-service` is down when a game ends, users stay with `status: 'IN_GAME'` permanently.
- **Risk**: Users cannot join new rooms if there's a "must be ONLINE to join" check, or their profile looks wrong forever.
- **Recommendation**: Implement a retry queue for status updates or a "repair" script that checks current active games against user statuses.

### 2.3 Distributed State "Split-Brain" (High)
- **Problem**: `game-service` state is strictly in-memory.
- **Scenario**: If `game-service` restarts (crash/deploy), all active games in `GameManager` are wiped. However, `room-service` still has these rooms marked as `status: 'playing'`.
- **Risk**: Players cannot rejoin, and those rooms are "stuck" in the database/memory of `room-service` until a manual restart.
- **Recommendation**: Persist "Game Record" in a shared Redis instance or have `game-service` broadcast its "Clean Slate" on startup so `room-service` can reset affected rooms.

---

## 3. Reliability & Performance

### 3.1 Unbounded Tick Rates (Medium)
- **Problem**: Every `GameInstance` starts a `setInterval`.
- **Risk**: If 1,000 games start simultaneously, the Node.js event loop will be heavily congested by 1,000 independent timers firing every 16ms.
- **Recommendation**: Use a single global "Game Loop" that updates all active games in batches to reduce timer overhead.

### 3.2 Missing Results Pipe (Incomplete Feature)
- **Problem**: `GameManager.endGame` calls `notifyRoomService(roomId, '', 'finish')` with no data.
- **Risk**: Scores and winners are never saved. The `finishRoom` service in `room-service` just deletes the room.
- **Recommendation**: Update the `finish` endpoint to accept `winnerId`, `scoreA`, and `scoreB`.

### 3.3 Race Condition on Re-join (Low)
- **Problem**: If a player refreshes and joins a room too quickly before the old WS connection is cleaned up, they might be rejected with `ALREADY_IN_ROOM` or `GAME_ALREADY_EXISTS`.
- **Recommendation**: If a player joins a room they are already "in", force-close the old connection and allow the new one.

---

## 4. Input Validation

### 4.1 Game Logic Sanitization (Low)
- **Problem**: `GameInstance.handleInput` trusts the `direction` from the DTO.
- **Observation**: While `isValidWsInput` checks for `-1 | 0 | 1`, there's no check for frequency. A user could spam 1,000 "move" messages per second.
- **Recommendation**: Implement rate-limiting per WebSocket connection.
