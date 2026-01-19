# Core Library Refactoring Plan

## Comprehensive Analysis of Core Library

Based on thorough analysis of `/Users/hen/Desktop/ft_transcendence/apps/core/`, here's the detailed assessment:

---

### **Current State of Code Organization**

The core library serves as a **shared infrastructure layer** for all microservices in the ft_transcendence system. It provides:
- **Fastify app initialization** with logging, plugins, and error handling
- **JWT token utilities** for authentication (access, refresh, 2FA tokens)
- **Middleware components** for API authentication and service-to-service auth
- **Environment configuration** management
- **Error handling standardization** with ELK-compatible logging
- **WebSocket utilities** for real-time features

**Key Observations:**
- ✅ Well-scoped responsibilities around server bootstrapping and auth
- ⚠️ Mixed concerns across utils (JWT, HTTP, WebSocket auth, error handling)
- ⚠️ Some utilities lack proper type safety and error context

---

### **Critical Issues Identified**

#### **1. Missing Type Safety in JWT Utilities** 
`src/utils/jwt.ts` - returns `any` type, suppressing errors:
```typescript
export function verifyJwt(token: string, type: JwtType): any {
	try {
		// ...
		return jwt.verify(token, secret);
	} catch (err) {
		return null;  // Silent failure - error lost
	}
}
```
**Issues:**
- Consumer code can't distinguish between missing tokens and invalid signatures
- Stack traces and error details are lost
- Inconsistent with rest of codebase that throws

#### **2. Inconsistent Error Handling Patterns**

Files use different approaches:
- `src/utils/decodeToken.ts` - Throws
- `src/utils/extractToken.ts` - Throws
- `src/utils/jwt.ts` - Returns null silently
- `src/middlewares/authenticate.middleware.ts` - Catches and switches on error codes
- `src/middlewares/serviceAuth.middleware.ts` - Direct sendError calls

**Problem:** Middleware consumers must manually map errors, creating duplication across services.

#### **3. AppError Class Lacks Context**
`src/utils/AppError.ts` - Simple wrapper without structured error metadata:
```typescript
export class AppError extends Error {
	code: string;
	constructor(code: string) {
		super(code);
		this.code = code;
		this.name = 'AppError';
	}
}
```
**Missing:**
- HTTP status code
- Error details/context
- Stack trace preservation
- Distinction between client errors (4xx) and server errors (5xx)

#### **4. WebSocket and HTTP Auth Duplication**

- `src/utils/authenticate.ws.ts` - Extracts & decodes token
- `src/middlewares/authenticate.middleware.ts` - Same logic for HTTP

Code is duplicated; only difference is response mechanism.

#### **5. Type Casting Issues Across Codebase**

In service implementations:
```typescript
// room-service/src/routes/public.routes.ts
app.get('/', { preHandler: authenticate as any }, getRoomsHandler as any);
// user-service/src/routes/internal.routes.ts
preHandler: [serviceAuth as any],
```

Root cause: **Middleware signatures don't match Fastify's type expectations**. `src/middlewares/authenticate.middleware.ts` is not typed as `FastifyHookAsyncCallback`.

#### **6. Environment Validation Issues**
`src/env.ts` - Missing SERVICE_TOKEN in schema but used in `serviceAuth.middleware.ts`:
```typescript
const expectedToken = process.env.SERVICE_TOKEN  // Not validated!
```

#### **7. Middleware Return Values Inconsistent**
`src/middlewares/serviceAuth.middleware.ts`:
```typescript
const serviceAuth = async (request: FastifyRequest, reply: FastifyReply) => {
	if (!serviceToken) {
		return sendError(...);  // Returns reply object
	}
	return true;  // Returns boolean?
}
```

Fastify expects undefined return on success, not `true`.

#### **8. Error Handler Validation Logic Fragile**
`src/errorHandler.ts` - Makes assumptions about error structure:
```typescript
const firstError = valError.validation[0];
const field = firstError.instancePath?.replace(/^\//, '') // Could be undefined
	|| firstError.params?.missingProperty
	|| 'unknown';
```

No null checks for validation array emptiness.

#### **9. Health Route Lacks Context**
`src/routes/health.routes.ts` - No database/dependency checks, doesn't reflect actual service health.

---

### **Code Quality Issues**

| Issue | Location | Impact |
|-------|----------|--------|
| **Unused rate-limit code** | `src/plugins.ts#L49-L56` | Dead code, confusing future devs |
| **CORS too permissive** | `src/plugins.ts#L87` | `*` compromises security |
| **Magic strings** | Throughout (e.g., 'access', 'refresh', 'twoFA') | Should use constants |
| **No request logging in some paths** | Routes don't log explicitly | Harder to trace issues |
| **Helmet CSP too permissive** | `src/plugins.ts#L66-L77` | `unsafe-inline` defeats CSP |

---

### **Dependency & Coupling Analysis**

**Direct imports across services (30+ usages):**
- `AppError` - 30+ files
- Middleware - 15+ files
- JWT utils - 12+ files
- Error codes, Constants - 8+ files
- Token extraction - 10+ files

**Tight coupling risks:**
- Changing middleware signature requires updates across 6 services
- Any change to token verification logic affects all services
- Error code strings ('ACCESS_TOKEN_MISSING', 'INVALID_ACCESS_TOKEN') hardcoded everywhere

---

### **Type Safety Issues**

1. **Generic type parameters unused**: `authRequest.ts` - TBody, TQuery, etc. defined but never validated
2. **ErrorHandler's ValidationError interface too loose** - Relies on optional properties
3. **JwtType enum should export values** - Currently must manually check strings
4. **No validation of decoded JWT payload structure** - Returns `any`

---

### **Refactoring Opportunities (Prioritized)**

#### **PRIORITY 1 - Critical (Security/Stability)**

1. **Unify error handling with rich AppError**
   - Add `statusCode`, `details`, `originalError` to `AppError`
   - Make `verifyJwt()` throw instead of returning null
   - Update middleware error mappers to preserve context
   - **Impact:** Fixes error context loss, type safety
   - **Effort:** 2-3 hours

2. **Fix middleware type signatures**
   - Create `AuthMiddleware` type extending `FastifyHookAsyncCallback`
   - Update `authenticate.middleware.ts` and `serviceAuth.middleware.ts` signatures
   - Remove `as any` casts from 20+ service files
   - **Impact:** Eliminates type errors, better IDE support
   - **Effort:** 1-2 hours

3. **Validate SERVICE_TOKEN in env schema**
   - Add SERVICE_TOKEN to `src/env.ts` zod schema
   - **Impact:** Prevents runtime errors at startup
   - **Effort:** 15 minutes

#### **PRIORITY 2 - High (DRY, Maintainability)**

4. **Consolidate WebSocket and HTTP auth**
   - Create reusable `parseAuthToken()` function
   - Export authentication error handler factory
   - Reduce `authenticate.ws.ts` and middleware duplication
   - **Impact:** Single source of truth for token parsing
   - **Effort:** 1 hour

5. **Create error code constants file**
   - Extract magic strings: 'ACCESS_TOKEN_MISSING', 'INVALID_ACCESS_TOKEN', 'SERVICE_TOKEN_MISSING', etc.
   - Export from core package
   - Update all 30+ usages
   - **Impact:** Changes one place instead of 30
   - **Effort:** 1.5 hours

6. **Extract middleware helpers**
   - Create `createAuthMiddleware()` factory
   - Create `createServiceAuthMiddleware()` for service-to-service
   - Remove duplication in error switching logic
   - **Impact:** Reusable, testable middleware
   - **Effort:** 1-2 hours

#### **PRIORITY 3 - Medium (Code Quality)**

7. **Remove dead code**
   - Delete commented rate-limit code in `plugins.ts`
   - **Effort:** 15 minutes

8. **Fix security issues**
   - Change CORS to specific origins
   - Remove `unsafe-inline` from CSP
   - Add rate-limiting (uncomment and configure)
   - **Effort:** 30 minutes

9. **Enhance health check**
   - Make it extensible for services to register health checks
   - Add database/dependency status
   - Create `registerHealthCheck(name, checker)` function
   - **Impact:** Better production monitoring
   - **Effort:** 1 hour

10. **Improve error handler validation**
    - Add null checks for validation array
    - Better field extraction logic
    - Extract to `extractValidationError()` function
    - **Effort:** 30 minutes

#### **PRIORITY 4 - Nice-to-Have (Type Safety)**

11. **Create JWT payload type**
    - Define `JwtPayload` interface with strict structure
    - Update `verifyJwt()` to return `JwtPayload | null`
    - **Impact:** Type-safe token handling
    - **Effort:** 1 hour

12. **Extract response schemas**
    - Create `successResponse`, `errorResponse` schema types
    - Standardize response structure across services
    - **Effort:** 1-2 hours

---

### **Patterns Inconsistent with Codebase**

1. **Middleware return values**: Some return reply object, others boolean - no standard
2. **Error throwing vs returning**: Mix of throw and return patterns
3. **Type casting**: Heavy use of `as any` to suppress type errors
4. **Token verification**: Silent failures (null) vs exceptions

---

### **Recommendations Summary**

**Immediate actions (Week 1):**
1. Add SERVICE_TOKEN to env validation
2. Fix middleware type signatures (eliminate `as any` usage)
3. Unify error handling in `AppError` class
4. Extract error code constants

**Short-term (Week 2-3):**
1. Consolidate WebSocket/HTTP auth logic
2. Create error handler utilities
3. Fix security configuration (CORS, CSP, rate-limiting)

**Ongoing:**
1. Add integration tests for middleware
2. Document export API for services
3. Set up lint rule to prevent `as any` usage
4. Consider creating `@core/errors` subpackage with all error definitions

---

## Implementation Strategy

### Phase 1: Foundation (Days 1-2)
- Enhance `AppError` class with full context
- Add SERVICE_TOKEN to env validation
- Create error code constants file
- Define proper type signatures for middleware

### Phase 2: Core Refactoring (Days 3-5)
- Update JWT utilities to throw properly
- Fix middleware implementations
- Consolidate auth logic
- Update all service imports

### Phase 3: Polish & Security (Days 6-7)
- Fix security issues (CORS, CSP, rate-limiting)
- Enhance health checks
- Remove dead code
- Add comprehensive tests

### Phase 4: Service Updates (Days 8+)
- Update all 6 services to use new types
- Remove `as any` casts
- Verify no regressions

---

**Overall Assessment:** The core library has good foundational structure but suffers from **error handling inconsistencies**, **type safety gaps**, and **code duplication** that create maintenance burden across 6 services. The recommended refactoring will significantly improve reliability and developer experience.
