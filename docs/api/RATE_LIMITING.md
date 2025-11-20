# Rate Limiting Documentation

**Sprint 1 - Day 6: Rate Limiting Implementation**
**Date**: 2025-11-10
**Status**: ✅ Completed

---

## 📋 Overview

This document describes the rate limiting implementation for the MindFlow API. Rate limiting protects the API from abuse by limiting the number of requests per IP address within specific time windows.

### Security Benefits

- ✅ Prevents brute force password attacks
- ✅ Prevents account enumeration
- ✅ Prevents spam registrations
- ✅ Prevents API abuse and DDoS attacks
- ✅ Protects backend resources
- ✅ Ensures fair usage across all clients

---

## 🎯 Rate Limit Tiers

### 1. Auth Rate Limiter (Brute Force Protection)
**Endpoints**: `/api/auth/login`, `/api/auth/change-password`
**Limit**: 5 requests per 15 minutes per IP

```typescript
// Prevents password guessing attacks
authRateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many authentication attempts. Please try again in 15 minutes.'
}
```

### 2. Registration Rate Limiter (Spam Protection)
**Endpoints**: `/api/auth/register`
**Limit**: 3 requests per 1 hour per IP

```typescript
// Prevents spam account creation
registrationRateLimiter = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations
  message: 'Too many registration attempts. Please try again in an hour.'
}
```

### 3. Password Reset Rate Limiter
**Endpoints**: `/api/auth/reset-password` (future)
**Limit**: 3 requests per 1 hour per IP

```typescript
// Prevents password reset abuse
passwordResetRateLimiter = {
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: 'Too many password reset requests. Please try again in an hour.'
}
```

### 4. General API Rate Limiter
**Endpoints**: All `/api/*` routes
**Limit**: 100 requests per 15 minutes per IP

```typescript
// Protects general API from abuse
apiRateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many API requests. Please try again later.'
}
```

### 5. Admin API Rate Limiter (Higher Limits)
**Endpoints**: Admin routes (future)
**Limit**: 200 requests per 15 minutes per IP

```typescript
// Higher limits for admin operations
adminRateLimiter = {
  windowMs: 15 * 60 * 1000,
  max: 200, // Double the general API limit
}
```

---

## 📊 Rate Limit Summary Table

| Limiter | Window | Max Requests | Endpoints | Purpose |
|---------|--------|--------------|-----------|---------|
| Auth | 15 min | 5 | `/api/auth/login`, `/api/auth/change-password` | Brute force protection |
| Registration | 1 hour | 3 | `/api/auth/register` | Spam prevention |
| Password Reset | 1 hour | 3 | `/api/auth/reset-password` | Abuse prevention |
| General API | 15 min | 100 | `/api/*` | API abuse protection |
| Admin API | 15 min | 200 | `/api/admin/*` | Admin operations |

---

## 🏗️ Implementation Details

### File Structure

```
backend/src/middleware/
  └── rateLimiter.ts          # All rate limiters defined here

backend/src/routes/
  └── auth.ts                 # Rate limiters applied to routes

backend/src/
  └── index.ts                # Global API rate limiter
```

### Integration

#### Auth Routes (backend/src/routes/auth.ts)
```typescript
import {
  authRateLimiter,
  registrationRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/rateLimiter';

// Apply to specific routes
router.post('/login', authRateLimiter, loginHandler);
router.post('/register', registrationRateLimiter, registerHandler);
router.post('/change-password', authenticateToken, authRateLimiter, changePasswordHandler);
```

#### Global API Protection (backend/src/index.ts)
```typescript
import { apiRateLimiter } from './middleware/rateLimiter';

// Apply to all API routes
app.use('/api', apiRateLimiter);
```

---

## 🔒 Response Headers

When a request is made, the following headers are returned:

### Standard Headers (RFC 7231)
```http
RateLimit-Limit: 5              # Maximum requests allowed in window
RateLimit-Remaining: 3           # Requests remaining in current window
RateLimit-Reset: 1699560000      # Unix timestamp when window resets
```

### Example Response (Within Limit)
```http
HTTP/1.1 200 OK
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1699560000
Content-Type: application/json

{
  "success": true,
  "data": { ... }
}
```

### Example Response (Rate Limit Exceeded)
```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 5
RateLimit-Remaining: 0
RateLimit-Reset: 1699560000
Retry-After: 900
Content-Type: application/json

{
  "success": false,
  "error": "Too many requests",
  "message": "Too many authentication attempts from this IP. Please try again later.",
  "retryAfter": 900,
  "retryAfterMinutes": 15
}
```

---

## 🧪 Testing Guide

### Manual Testing

#### Test 1: Normal Request (Should Succeed)
```bash
curl -i http://localhost:3001/api/auth/me

# Expected: 200 or 401 with rate limit headers
# RateLimit-Limit: 100
# RateLimit-Remaining: 99
```

#### Test 2: Exceed Login Rate Limit
```bash
# Try logging in 6 times with wrong password
for i in {1..6}; do
  echo "Attempt $i:"
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}' \
    http://localhost:3001/api/auth/login | jq .
  sleep 1
done

# Expected on 6th attempt:
# HTTP 429 Too Many Requests
# {
#   "success": false,
#   "error": "Too many requests",
#   "message": "Too many authentication attempts...",
#   "retryAfter": 900
# }
```

#### Test 3: Check Rate Limit Headers
```bash
curl -I http://localhost:3001/api/customers

# Look for:
# RateLimit-Limit: 100
# RateLimit-Remaining: 99
# RateLimit-Reset: <timestamp>
```

#### Test 4: Test Registration Rate Limit
```bash
# Try registering 4 times
for i in {1..4}; do
  echo "Registration attempt $i:"
  curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"user$i@test.com\",\"password\":\"Test123!\"}" \
    http://localhost:3001/api/auth/register | jq .
  sleep 1
done

# Expected on 4th attempt: HTTP 429
```

### Using Test Script
```bash
cd backend
chmod +x test-rate-limiting.sh
./test-rate-limiting.sh
```

### Backend Console Logs

When rate limit is exceeded, you'll see:
```
🚫 [rate-limit]: Auth rate limit exceeded - IP: 127.0.0.1
🚫 [rate-limit]: Registration rate limit exceeded - IP: ::1
🚫 [rate-limit]: API rate limit exceeded - IP: 192.168.1.100 - Path: /api/customers
```

---

## 🎯 How It Works

### Request Flow

1. **Request arrives** → Express receives request
2. **Rate limiter checks**:
   - Extract IP address from request
   - Check request count for this IP in current window
   - If count < max: Allow request, increment count
   - If count >= max: Block request, return 429

3. **Response sent**:
   - If allowed: Process request normally + rate limit headers
   - If blocked: Return 429 error + retry information

### IP Address Extraction

```typescript
// Handles proxied requests correctly
const ip = req.headers['x-forwarded-for'] ||
           req.headers['x-real-ip'] ||
           req.ip
```

Supports:
- Direct connections
- Nginx proxy (`X-Forwarded-For`)
- Load balancers (`X-Real-IP`)

---

## 🔧 Configuration

### Adjusting Limits

To change rate limits, edit `backend/src/middleware/rateLimiter.ts`:

```typescript
// Increase auth limit to 10
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // Changed from 5 to 10
  // ...
});

// Decrease window to 5 minutes
export const authRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // Changed from 15 to 5
  max: 5,
  // ...
});
```

### Skip Specific IPs (Whitelist)

```typescript
export const apiRateLimiter = rateLimit({
  // ... other config
  skip: (req) => {
    // Don't rate limit health check
    if (req.path === '/health') return true;

    // Don't rate limit specific IPs (internal services)
    const trustedIPs = ['192.168.1.100', '10.0.0.1'];
    if (trustedIPs.includes(req.ip || '')) return true;

    return false;
  },
});
```

---

## ⚠️ Important Considerations

### Production Deployment

1. **Behind Proxy/Load Balancer**:
   ```typescript
   // In index.ts, before middleware
   app.set('trust proxy', 1); // Trust first proxy
   ```

2. **Multiple Servers**:
   - Default: In-memory store (per server)
   - For multiple servers: Use Redis store
   ```bash
   npm install rate-limit-redis redis
   ```
   ```typescript
   import RedisStore from 'rate-limit-redis';
   import { createClient } from 'redis';

   const client = createClient({ url: process.env.REDIS_URL });

   export const authRateLimiter = rateLimit({
     store: new RedisStore({
       client: client,
       prefix: 'rl:auth:',
     }),
     // ... other config
   });
   ```

3. **IPv6 Considerations**:
   - IPv6 addresses can be longer
   - Rate limiter handles both IPv4 and IPv6

### Frontend Handling

Frontend should handle 429 responses gracefully:

```typescript
// Frontend API client
async function login(email: string, password: string) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.status === 429) {
      const data = await response.json();
      const minutes = data.retryAfterMinutes || 15;
      throw new Error(`Too many attempts. Please try again in ${minutes} minutes.`);
    }

    return await response.json();
  } catch (error) {
    // Handle error
  }
}
```

---

## 🚨 Troubleshooting

### Issue: Rate Limit Triggered Too Quickly

**Symptom**: Legitimate users getting rate limited

**Solutions**:
1. Increase limits in `rateLimiter.ts`
2. Check if multiple users share same IP (corporate network)
3. Consider IP whitelisting for trusted networks

### Issue: Rate Limits Not Working

**Symptom**: Can make unlimited requests

**Debug**:
1. Check if rate limiter is imported
2. Check if applied to route
3. Restart server (code changes require restart)
4. Check console for `✅ [rate-limit]: API rate limiting enabled`

### Issue: Different Servers Have Different Limits

**Symptom**: Limit resets when request goes to different server

**Solution**: Use Redis store for shared rate limiting across servers

### Issue: Rate Limit Headers Not Showing

**Symptom**: No `RateLimit-*` headers in response

**Check**:
1. Ensure `standardHeaders: true` in rate limiter config
2. Check if response is from rate-limited endpoint

---

## 📊 Monitoring

### Query Rate Limit Events

Check backend logs for:
```bash
# Grep for rate limit warnings
grep "rate-limit" logs/backend.log

# Expected output:
# 🚫 [rate-limit]: Auth rate limit exceeded - IP: 192.168.1.100
# 🚫 [rate-limit]: API rate limit exceeded - IP: ::1 - Path: /api/customers
```

### Security Monitoring

Watch for suspicious patterns:
- Same IP hitting rate limit repeatedly (potential attack)
- Multiple IPs hitting rate limit (distributed attack)
- Unusual spike in rate limit triggers

---

## 🚀 Future Enhancements

### Phase 2+ Improvements

1. **Redis Integration** (for multi-server setups)
2. **Dynamic Rate Limiting** (adjust based on user tier)
3. **Whitelist Management** (admin interface)
4. **Rate Limit Analytics Dashboard**
5. **Automated IP Blocking** (after X rate limit violations)
6. **User-Based Rate Limiting** (not just IP)

---

## ✅ Compliance & Standards

This implementation follows:
- **RFC 7231** - HTTP/1.1 Semantics (429 status code)
- **OWASP API Security Top 10** - API4:2023 Unrestricted Resource Consumption
- **CIS Controls** - Control 13: Network Monitoring and Defense
- **Industry Best Practices** - NIST Cybersecurity Framework

---

## 📚 Related Documentation

- [CORS Hardening](./CORS_HARDENING.md)
- [Audit Logging](./AUDIT_LOGGING.md)
- [Security Headers](../backend/src/middleware/securityHeaders.ts)
- [Sprint 1 Plan](./sprints/sprint-01/PLAN.md)

---

**Last Updated**: 2025-11-10
**Author**: Claude (AI Assistant)
**Sprint**: Sprint 1 - Day 6
**Status**: ✅ Production Ready
