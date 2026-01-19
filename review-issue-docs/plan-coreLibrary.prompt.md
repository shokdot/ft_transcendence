### **Critical Issues Identified**

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


Root cause: **Middleware signatures don't match Fastify's type expectations**. `src/middlewares/authenticate.middleware.ts` is not typed as `FastifyHookAsyncCallback`.


#### **8. Error Handler Validation Logic Fragile**
`src/errorHandler.ts` - Makes assumptions about error structure:
```typescript
const firstError = valError.validation[0];
const field = firstError.instancePath?.replace(/^\//, '') // Could be undefined
	|| firstError.params?.missingProperty
	|| 'unknown';
```

No null checks for validation array emptiness.


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

### **Recommendations Summary**

**Immediate actions (Week 1):**
3. Unify error handling in `AppError` class
4. Extract error code constants

**Short-term (Week 2-3):**
2. Create error handler utilities

**Ongoing:**
1. Add integration tests for middleware
2. Document export API for services
3. Set up lint rule to prevent `as any` usage
4. Consider creating `@core/errors` subpackage with all error definitions

---

## Implementation Strategy

### Phase 1: Foundation (Days 1-2)
- Enhance `AppError` class with full context
- Create error code constants file
- Define proper type signatures for middleware

### Phase 2: Core Refactoring (Days 3-5)
- Update JWT utilities to throw properly
- Fix middleware implementations
- Update all service imports


### Phase 4: Service Updates (Days 8+)
- Update all 6 services to use new types
- Verify no regressions