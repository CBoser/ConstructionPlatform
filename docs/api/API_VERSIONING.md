# API Versioning Strategy

**Sprint**: Sprint 1 Day 9
**Date**: 2025-11-12
**Status**: ✅ Implemented

---

## Overview

MindFlow API uses URL-based versioning to ensure backward compatibility and smooth transitions between API versions.

**Current Version**: v1

---

## URL Structure

All API endpoints are versioned under `/api/v{version}/`

### Version 1 Routes

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/change-password
GET    /api/v1/customers
```

### Non-Versioned Routes

These routes are NOT versioned (system-level):
```
GET    /health          - Health check endpoint
GET    /                - API information
```

---

## Version Detection

### Response Headers

All versioned API responses include an `X-API-Version` header:

```http
GET /api/v1/customers
```

Response:
```http
HTTP/1.1 200 OK
X-API-Version: v1
Content-Type: application/json
...
```

### Root Endpoint

Query `/` to discover available versions:

```bash
curl http://localhost:3001/
```

Response:
```json
{
  "message": "Welcome to MindFlow API",
  "version": "1.0.0",
  "apiVersion": "v1",
  "description": "Construction Management Platform - Foundation Layer",
  "endpoints": {
    "health": "/health",
    "auth": "/api/v1/auth",
    "customers": "/api/v1/customers",
    "docs": "/api-docs (coming soon)"
  },
  "versioning": {
    "current": "v1",
    "available": ["v1"],
    "header": "X-API-Version"
  }
}
```

---

## Implementation Details

### Version Middleware

Location: `backend/src/middleware/apiVersion.ts`

```typescript
import { v1VersionHeader } from './middleware/apiVersion';

router.use(v1VersionHeader); // Adds X-API-Version: v1 header
```

### Version Router

Location: `backend/src/routes/v1/index.ts`

The v1 router aggregates all version 1 routes:

```typescript
import v1Router from './routes/v1';

app.use('/api/v1', v1Router);
```

---

## Migration Guide

### For Frontend Developers

**Current (Sprint 1)**:
```typescript
// Update all API calls to use /api/v1
const response = await fetch('http://localhost:3001/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

**Legacy Support** (optional):

If you need to support clients during transition, uncomment legacy routes in `backend/src/index.ts`:

```typescript
// Legacy routes redirect to v1 (for backward compatibility)
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
```

---

## Version Lifecycle

### Version 1 (Current)
- **Status**: Active
- **Introduced**: Sprint 1 Day 9 (2025-11-12)
- **Deprecation**: TBD
- **Sunset**: TBD

### Future Versions

When v2 is introduced:

1. Create `backend/src/routes/v2/index.ts`
2. Create `v2VersionHeader` middleware
3. Register v2 router: `app.use('/api/v2', v2Router)`
4. Update root endpoint to list both v1 and v2
5. Announce v1 deprecation timeline
6. Maintain v1 for deprecation period (e.g., 6 months)
7. Remove v1 after sunset date

---

## Best Practices

### For Backend Developers

1. **Never break v1 routes**: Any changes to v1 must be backward compatible
2. **Add fields, don't remove**: New optional fields are OK, removing fields requires new version
3. **Document breaking changes**: If you need to make breaking changes, create v2
4. **Test version headers**: Ensure all v1 responses include `X-API-Version: v1`

### For Frontend Developers

1. **Check version header**: Validate `X-API-Version` in responses matches expected version
2. **Plan for migration**: When v2 is announced, plan migration timeline
3. **Don't hardcode URLs**: Use environment variables for API base URL
4. **Handle version errors**: Implement graceful fallback if version is deprecated

---

## Testing

### Manual Testing

Test version header:
```bash
curl -i http://localhost:3001/api/v1/customers \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Verify response includes:
```
X-API-Version: v1
```

### Automated Testing

Add to test suite:
```typescript
describe('API Versioning', () => {
  it('should include X-API-Version header in all v1 responses', async () => {
    const response = await request(app).get('/api/v1/customers');
    expect(response.headers['x-api-version']).toBe('v1');
  });
});
```

---

## Troubleshooting

### Issue: Missing X-API-Version header

**Cause**: Route registered outside v1Router
**Fix**: Ensure route is imported in `backend/src/routes/v1/index.ts`

### Issue: 404 on /api/v1/* routes

**Cause**: v1Router not registered in main app
**Fix**: Verify `app.use('/api/v1', v1Router)` exists in `backend/src/index.ts`

### Issue: Legacy routes (/api/auth) still work

**Cause**: Legacy compatibility routes enabled
**Fix**: Comment out legacy route registrations in `backend/src/index.ts`

---

## References

- [API Versioning Best Practices](https://www.troyhunt.com/your-api-versioning-is-wrong-which-is/)
- [Sprint 1 Plan](./sprints/sprint-01/PLAN.md)
- [Implementation PR](#) - TBD

---

**Last Updated**: 2025-11-12
**Next Review**: Sprint 2 (before any API changes)
