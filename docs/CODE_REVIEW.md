# Code Review: ft_transcendence

**Date:** 2025-01-27  
**Reviewer:** Auto (AI Code Reviewer)

## Executive Summary

This is a microservices-based application built with Fastify, TypeScript, and Prisma. The architecture includes authentication, user management, game, and notification services. Overall, the codebase demonstrates good structure and security awareness, but there are several critical issues and areas for improvement.

---

## 🔴 Critical Issues

### 1. **Unsafe JSON Parsing in WebSocket Handler**
**Location:** `apps/game-service/src/ws/game.ws.ts:26`

```typescript
ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString()); // ⚠️ No error handling
    // ...
});
```

**Issue:** `JSON.parse` can throw exceptions on malformed input, crashing the WebSocket connection handler.

**Recommendation:**
```typescript
ws.on('message', (msg) => {
    try {
        const data = JSON.parse(msg.toString());
        if (data?.type === "input") {
            // ... existing code
        }
    } catch (error) {
        ws.send(JSON.stringify({ error: 'INVALID_MESSAGE_FORMAT' }));
        return;
    }
});
```

### 2. **Missing Input Validation in WebSocket Messages**
**Location:** `apps/game-service/src/ws/game.ws.ts:28-34`

**Issue:** No validation of `data.direction` before passing to `handleInput`. This could lead to injection or unexpected behavior.

**Recommendation:** Add schema validation for WebSocket messages using Zod or Fastify's validation.

### 3. **Unsafe Error Handling in WebSocket Authentication**
**Location:** `apps/game-service/src/ws/game.ws.ts:6-52`

**Issue:** The `authenticateWs` function can throw, but the error handling assumes `error.code` exists. If a non-AppError is thrown, the switch statement will fail.

**Recommendation:**
```typescript
catch (error) {
    if (error instanceof AppError) {
        switch (error.code) {
            case 'ACCESS_TOKEN_MISSING':
                ws.close(1008, 'ACCESS_TOKEN_MISSING');
                break;
            case 'INVALID_ACCESS_TOKEN':
                ws.close(1008, 'INVALID_ACCESS_TOKEN');
                break;
            default:
                ws.close(1011, 'INTERNAL_SERVER_ERROR');
        }
    } else {
        ws.close(1011, 'INTERNAL_SERVER_ERROR');
    }
}
```

### 4. **Missing Environment Variable Validation for JWT Secrets**
**Location:** `apps/core/src/utils/jwt.ts:11,15,19,33,36,39`

**Issue:** Using `process.env.JWT_SECRET!` with non-null assertion without validation. If the secret is missing, the app will start but fail at runtime.

**Recommendation:** Add JWT secrets to environment validation schemas in each service's `env.ts`.

### 5. **Prisma Client Not Properly Disposed**
**Location:** `apps/*/src/utils/prismaClient.ts`

**Issue:** PrismaClient instances are created but never explicitly disconnected. This can lead to connection leaks, especially during graceful shutdowns.

**Recommendation:**
```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Add graceful shutdown
process.on('beforeExit', async () => {
    await prisma.$disconnect();
});

export default prisma;
```

### 6. **Rate Limiting Applied Globally Instead of Per-Route**
**Location:** `apps/core/src/plugins.ts:68-77`

**Issue:** Rate limiting is applied globally with only 5 requests per minute. This is too restrictive for most endpoints and too lenient for authentication endpoints.

**Recommendation:** Apply rate limiting per-route with different limits:
- Authentication endpoints: 5 requests/minute
- General endpoints: 100 requests/minute
- Public endpoints: 1000 requests/minute

### 7. **Email Verification Bypassed in Production**
**Location:** `apps/auth-service/src/services/basic/registerUser.service.ts:35,65`

**Issue:** `isEmailVerified: true` is hardcoded, and email sending is commented out. This is a security risk.

**Recommendation:** 
- Set `isEmailVerified: false` by default
- Uncomment and properly configure email sending
- Add environment variable to control email verification requirement

---

## 🟡 Security Concerns

### 8. **Missing CORS Configuration**
**Issue:** No CORS middleware found. This could prevent legitimate frontend requests or expose the API to unauthorized origins.

**Recommendation:** Add `@fastify/cors` with appropriate configuration:
```typescript
await app.register(require('@fastify/cors'), {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
});
```

### 9. **Service Token Comparison Using String Equality**
**Location:** `apps/core/src/middlewares/serviceAuth.middleware.ts:11`

**Issue:** Using `===` for token comparison is vulnerable to timing attacks.

**Recommendation:** Use constant-time comparison:
```typescript
import crypto from 'crypto';

const isValid = crypto.timingSafeEqual(
    Buffer.from(serviceToken),
    Buffer.from(expectedToken)
);
```

### 10. **Error Logging Includes Sensitive Data**
**Location:** `apps/core/src/errorHandler.ts:68-69`

**Issue:** Logging `request.body` and `request.headers` may include passwords, tokens, or other sensitive information.

**Recommendation:** Sanitize logs before writing:
```typescript
const sanitizedBody = sanitizeForLogging(request.body);
const sanitizedHeaders = sanitizeForLogging(request.headers);
```

### 11. **No Protection Against SQLite Locking Issues**
**Issue:** Using SQLite in a multi-service environment can lead to database locking issues.

**Recommendation:** 
- Consider PostgreSQL for production
- Add connection pooling configuration
- Implement retry logic for database operations

### 12. **Password Reset Token Not Invalidated After Use**
**Location:** `apps/auth-service/src/services/password/resetPass.service.ts:26`

**Issue:** Token is deleted, but if multiple requests come in simultaneously, the token could be used multiple times.

**Recommendation:** Use database transaction or add a `used` flag checked before deletion.

---

## 🟠 Code Quality Issues

### 13. **Inconsistent Error Handling**
**Location:** Multiple files

**Issue:** Some controllers use try-catch with switch statements, others rely on global error handler. Inconsistent patterns make debugging difficult.

**Recommendation:** Standardize error handling approach across all services.

### 14. **Missing Type Safety in Service Functions**
**Location:** `apps/auth-service/src/services/basic/registerUser.service.ts:10`

**Issue:** Function parameters are untyped:
```typescript
const registerUser = async ({ email, username, password }) => {
```

**Recommendation:** Add proper TypeScript types:
```typescript
interface RegisterUserParams {
    email: string;
    username: string;
    password: string;
}

const registerUser = async ({ email, username, password }: RegisterUserParams) => {
```

### 15. **Hardcoded Values**
**Location:** Multiple files

**Issues:**
- `bcrypt.hash(password, 10)` - salt rounds should be configurable
- `'15m'`, `'7d'`, `'5m'` - JWT expiration times should be configurable
- Password strength threshold `score < 3` is hardcoded

**Recommendation:** Move to environment variables or configuration files.

### 16. **Missing Return Statement in Error Cases**
**Location:** `apps/core/src/middlewares/serviceAuth.middleware.ts:8,12`

**Issue:** `sendError` is called but function doesn't return, allowing execution to continue.

**Recommendation:** Add `return` statements:
```typescript
if (!serviceToken) {
    return sendError(reply, 401, ...);
}
```

### 17. **Incomplete Error Handling in Registration**
**Location:** `apps/auth-service/src/services/basic/registerUser.service.ts:52-63`

**Issue:** If `prisma.authUser.delete` fails, the user remains in auth DB but not in user service, causing data inconsistency.

**Recommendation:** Use database transactions or implement idempotent cleanup.

### 18. **No Request Timeout Configuration**
**Issue:** No timeout configuration for HTTP requests, which could lead to resource exhaustion.

**Recommendation:** Add request timeout in Fastify configuration.

---

## 🔵 Architecture & Best Practices

### 19. **Missing Health Check for Dependencies**
**Issue:** Health check endpoints don't verify database connectivity or external service availability.

**Recommendation:** Add dependency checks to health endpoints:
```typescript
{
    status: 'healthy',
    database: await checkDatabase(),
    userService: await checkUserService(),
}
```

### 20. **No Request ID Tracking**
**Issue:** No correlation IDs in logs, making it difficult to trace requests across services.

**Recommendation:** Add request ID middleware to track requests across services.

### 21. **Inconsistent Naming Conventions**
**Issues:**
- Some files use camelCase (`registerUser.service.ts`)
- Some use kebab-case (routes)
- Service names inconsistent (`SERVICE_NAME` vs service name strings)

**Recommendation:** Establish and document naming conventions.

### 22. **Missing API Versioning Strategy**
**Issue:** API prefix is configurable but no versioning strategy is documented.

**Recommendation:** Document versioning strategy and ensure backward compatibility.

### 23. **No Circuit Breaker for Inter-Service Communication**
**Location:** `apps/auth-service/src/services/basic/registerUser.service.ts:40`

**Issue:** Direct axios calls without circuit breaker can cascade failures.

**Recommendation:** Implement circuit breaker pattern for service-to-service calls.

### 24. **Missing Input Sanitization**
**Issue:** While validation exists, no explicit sanitization (e.g., trimming, HTML escaping) is performed.

**Recommendation:** Add input sanitization layer before validation.

---

## 🟢 Positive Aspects

1. ✅ **Good Security Practices:**
   - Password hashing with bcrypt
   - Password strength checking with zxcvbn
   - JWT token implementation
   - Helmet.js for security headers
   - Rate limiting implemented

2. ✅ **Good Structure:**
   - Clear separation of concerns (controllers, services, routes)
   - Shared core library for common functionality
   - Environment variable validation with Zod

3. ✅ **Good Error Handling Foundation:**
   - Centralized error handler
   - Structured error responses
   - Proper logging

4. ✅ **Type Safety:**
   - TypeScript throughout
   - Prisma for type-safe database access

5. ✅ **Documentation:**
   - Swagger/OpenAPI setup for API documentation

---

## 📋 Priority Recommendations

### Immediate (Before Production):
1. Fix WebSocket JSON parsing error handling
2. Add environment variable validation for JWT secrets
3. Implement proper Prisma client disposal
4. Fix email verification bypass
5. Add CORS configuration
6. Sanitize error logs

### High Priority:
7. Implement per-route rate limiting
8. Add input validation for WebSocket messages
9. Fix service token timing attack vulnerability
10. Add database transaction support

### Medium Priority:
11. Add request ID tracking
12. Implement circuit breaker pattern
13. Add health check for dependencies
14. Standardize error handling patterns
15. Add TypeScript types to all service functions

### Low Priority:
16. Document naming conventions
17. Make hardcoded values configurable
18. Add request timeout configuration
19. Improve code comments and documentation

---

## 📊 Code Metrics

- **Services:** 4 (auth, user, game, notification)
- **Shared Library:** 1 (core)
- **Database:** SQLite (3 databases)
- **Security Score:** 6/10
- **Code Quality Score:** 7/10
- **Architecture Score:** 7/10

---

## 🔧 Quick Wins

1. Add try-catch around JSON.parse in WebSocket handler (5 minutes)
2. Add return statements in serviceAuth middleware (2 minutes)
3. Add JWT secrets to env validation (10 minutes)
4. Add CORS configuration (15 minutes)
5. Add Prisma disconnect on shutdown (5 minutes)

---

## 📝 Notes

- The codebase shows good understanding of microservices architecture
- Security awareness is present but needs refinement
- Error handling is partially implemented but inconsistent
- Consider adding integration tests for critical paths
- Consider adding monitoring and observability (APM, metrics)

---

**End of Code Review**

