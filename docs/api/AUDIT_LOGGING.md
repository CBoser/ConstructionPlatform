# Audit Logging Documentation

**Sprint 1 - Day 5: Audit Logging Foundation**
**Date**: 2025-11-10
**Status**: ✅ Completed

---

## 📋 Overview

This document describes the audit logging implementation for the MindFlow API. Audit logging tracks all authentication and authorization events for security monitoring, compliance, and forensic analysis.

---

## 🎯 Features

### Security Monitoring
- ✅ Tracks all login attempts (successful and failed)
- ✅ Logs logout events
- ✅ Records user registrations
- ✅ Monitors password changes
- ✅ Captures token refresh events

### Forensic Capabilities
- ✅ IP address tracking for all events
- ✅ User agent logging (browser/device identification)
- ✅ Timestamp for each event
- ✅ Before/after change tracking
- ✅ Reason logging for failed operations

### Compliance
- ✅ Immutable audit trail
- ✅ User attribution for all actions
- ✅ Queryable audit history
- ✅ Statistical reporting capabilities

---

## 🏗️ Implementation Details

### 1. Database Schema

**AuditLog Model** (backend/prisma/schema.prisma):

```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String?

  // Action
  action      String              // "USER_LOGIN", "FAILED_LOGIN", etc.
  entityType  String              // "User", "Job", "Material", etc.
  entityId    String

  // Changes
  changes     Json                // Before/after snapshot

  // Context
  ipAddress   String?
  userAgent   String?

  createdAt   DateTime @default(now())

  user User? @relation(fields: [userId], references: [id])

  @@index([userId])
  @@index([entityType, entityId])
  @@index([createdAt])
}
```

**Indexes:**
- `userId` - Fast queries by user
- `entityType, entityId` - Fast queries by entity
- `createdAt` - Fast time-based queries

### 2. Audit Service

**File**: `backend/src/services/auditLog.ts`

#### Audit Action Types

```typescript
export const AuditAction = {
  // Successful Operations
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
  USER_REGISTER: 'USER_REGISTER',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  TOKEN_REFRESH: 'TOKEN_REFRESH',

  // Failed Operations
  FAILED_LOGIN: 'FAILED_LOGIN',
  FAILED_REGISTRATION: 'FAILED_REGISTRATION',
  FAILED_PASSWORD_CHANGE: 'FAILED_PASSWORD_CHANGE',

  // Account Management
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED',
  ACCOUNT_ENABLED: 'ACCOUNT_ENABLED',
} as const;
```

#### Key Methods

##### createAuditLog(data: AuditLogData)
Base method for creating audit log entries. Automatically extracts IP and user agent from request.

##### logLogin(userId, email, req)
Logs successful login attempts.

##### logFailedLogin(email, reason, req)
Logs failed login attempts (no userId, uses email as identifier).

##### logLogout(userId, email, req)
Logs logout events.

##### logRegistration(userId, email, role, req)
Logs new user registrations.

##### logPasswordChange(userId, email, req)
Logs password change events (never logs actual passwords).

##### Query Methods:
- `getAuditLogsByUser(userId, limit)` - Get logs for specific user
- `getAuditLogsByAction(action, limit)` - Get logs by action type
- `getRecentAuditLogs(limit)` - Get most recent logs
- `getFailedLoginAttempts(hours, limit)` - Security monitoring
- `getAuditStats(hours)` - Statistical reporting

### 3. Integration with Auth Routes

**File**: `backend/src/routes/auth.ts`

#### POST /api/auth/register
```typescript
// Success: Log registration
await auditLogService.logRegistration(
  result.user.id,
  result.user.email,
  result.user.role,
  req
);

// Failure: Log failed registration
await auditLogService.logFailedRegistration(
  req.body.email,
  error.message,
  req
);
```

#### POST /api/auth/login
```typescript
// Success: Log login
await auditLogService.logLogin(
  result.user.id,
  result.user.email,
  req
);

// Failure: Log failed login attempt
await auditLogService.logFailedLogin(
  req.body.email,
  error.message,
  req
);
```

#### POST /api/auth/logout
```typescript
// Log logout event
await auditLogService.logLogout(
  req.user.userId,
  req.user.email,
  req
);
```

#### POST /api/auth/change-password
```typescript
// Success: Log password change
await auditLogService.logPasswordChange(
  req.user.userId,
  req.user.email,
  req
);

// Failure: Log failed password change
await auditLogService.logFailedPasswordChange(
  req.user.userId,
  error.message,
  req
);
```

#### POST /api/auth/refresh
```typescript
// Log token refresh
await auditLogService.logTokenRefresh(
  payload.userId,
  payload.email,
  req
);
```

---

## 🧪 Testing Guide

### Manual Testing

#### Test 1: Login Event
```bash
# Login from your frontend or use curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mindflow.com","password":"DevPassword123!"}'

# Check backend logs for:
# 📝 [audit]: USER_LOGIN - User: <user-id> - IP: <ip-address>
```

#### Test 2: Failed Login
```bash
# Attempt login with wrong password
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@mindflow.com","password":"wrongpassword"}'

# Check backend logs for:
# 📝 [audit]: FAILED_LOGIN - User: anonymous - IP: <ip-address>
```

#### Test 3: Registration
```bash
# Register new user from frontend

# Check backend logs for:
# 📝 [audit]: USER_REGISTER - User: <user-id> - IP: <ip-address>
```

#### Test 4: Logout
```bash
# Logout from your frontend

# Check backend logs for:
# 📝 [audit]: USER_LOGOUT - User: <user-id> - IP: <ip-address>
```

### Database Verification

#### Query Recent Audit Logs
```sql
-- Get last 20 audit logs
SELECT
  id,
  action,
  "userId",
  "ipAddress",
  "createdAt"
FROM "audit_logs"
ORDER BY "createdAt" DESC
LIMIT 20;
```

#### Query Failed Login Attempts
```sql
-- Get failed login attempts in last 24 hours
SELECT
  action,
  "entityId" as email,
  "ipAddress",
  changes,
  "createdAt"
FROM "audit_logs"
WHERE action = 'FAILED_LOGIN'
  AND "createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;
```

#### Get Audit Statistics
```sql
-- Count by action type
SELECT
  action,
  COUNT(*) as count
FROM "audit_logs"
GROUP BY action
ORDER BY count DESC;
```

#### User Activity Timeline
```sql
-- Get all activity for a specific user
SELECT
  action,
  "ipAddress",
  changes,
  "createdAt"
FROM "audit_logs"
WHERE "userId" = '<user-id>'
ORDER BY "createdAt" DESC
LIMIT 50;
```

### Using Test Script

```bash
# Run the audit logging test script
cd backend
node test-audit-logging.js

# Expected output:
# ✅ Test audit log created
# ✅ Query recent logs working
# ✅ Statistics generation working
```

---

## 📊 Monitoring & Analytics

### Security Alerts

#### Multiple Failed Login Attempts
```typescript
// Query failed logins for a specific email
const failedAttempts = await auditLogService.getAuditLogsByAction(
  AuditAction.FAILED_LOGIN,
  100
);

// Filter by email and time window
const suspiciousActivity = failedAttempts.filter(log => {
  const logData = log.changes as any;
  return logData.email === targetEmail &&
         log.createdAt > oneDayAgo;
});

// Alert if > 5 failed attempts
if (suspiciousActivity.length > 5) {
  console.warn('🚨 Potential brute force attack detected');
}
```

#### IP Address Monitoring
```typescript
// Get all actions from a specific IP
const logsByIp = await db.auditLog.findMany({
  where: { ipAddress: targetIp },
  orderBy: { createdAt: 'desc' },
  take: 100,
});

// Analyze for suspicious patterns
```

### Usage Statistics

#### Daily Active Users
```typescript
const stats = await auditLogService.getAuditStats(24);
console.log('Last 24 hours:', stats);

// Output:
// {
//   period: 'Last 24 hours',
//   totalEvents: 156,
//   byAction: {
//     USER_LOGIN: 45,
//     USER_LOGOUT: 42,
//     TOKEN_REFRESH: 38,
//     FAILED_LOGIN: 8,
//     PASSWORD_CHANGE: 3
//   }
// }
```

#### Peak Usage Times
```sql
-- Get hourly login distribution
SELECT
  DATE_TRUNC('hour', "createdAt") as hour,
  COUNT(*) as logins
FROM "audit_logs"
WHERE action = 'USER_LOGIN'
  AND "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour DESC;
```

---

## 🔒 Security Considerations

### What is Logged
- ✅ User ID (for authenticated actions)
- ✅ Email address
- ✅ IP address
- ✅ User agent (browser/device)
- ✅ Timestamp
- ✅ Action type
- ✅ Success/failure status

### What is NOT Logged
- ❌ Passwords (never logged, even encrypted)
- ❌ Authentication tokens (JWT)
- ❌ Session data
- ❌ Personally sensitive information beyond email

### Data Retention
- Audit logs are **immutable** (cannot be modified or deleted by application)
- Retention policy should be defined based on:
  - Regulatory requirements (GDPR, HIPAA, SOX, etc.)
  - Storage capacity
  - Typical: 90 days for active logs, 1-7 years for archival

### Access Control
- Audit logs should only be accessible by:
  - System administrators
  - Security team
  - Compliance officers
- Regular users should NOT have access to audit logs

---

## 🚀 Future Enhancements

### Phase 2+ Improvements

1. **Real-time Alerting**
   - Webhook integration for security events
   - Email alerts for suspicious activity
   - Slack/Teams notifications

2. **Advanced Analytics**
   - Anomaly detection (unusual login times, locations)
   - User behavior profiling
   - Risk scoring

3. **Compliance Features**
   - GDPR export capabilities
   - Data anonymization for deleted users
   - Audit log signing/verification

4. **Performance Optimizations**
   - Async audit logging (non-blocking)
   - Batch inserts for high-volume events
   - Time-series database integration

5. **Extended Coverage**
   - Job creation/modification
   - Material pricing changes
   - Purchase order approvals
   - Document access
   - Export operations

---

## 📋 Troubleshooting

### Issue: No Audit Logs Created

**Check:**
1. Database connection working
2. AuditLog table exists
3. Service properly imported in routes
4. No errors in server logs

**Debug:**
```typescript
// Add temporary logging
console.log('Creating audit log:', data);
await auditLogService.createAuditLog(data);
console.log('Audit log created successfully');
```

### Issue: Missing IP Address

**Cause**: Running behind a proxy without proper headers

**Solution**: Configure proxy to forward headers
```typescript
// nginx config
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Real-IP $remote_addr;
```

### Issue: Performance Degradation

**Symptoms**: Slow auth operations

**Solution**:
1. Ensure database indexes exist
2. Consider async audit logging
3. Monitor audit log table size

---

## 📝 Example Audit Log Entries

### Successful Login
```json
{
  "id": "uuid",
  "userId": "user-123",
  "action": "USER_LOGIN",
  "entityType": "User",
  "entityId": "user-123",
  "changes": {
    "email": "admin@mindflow.com",
    "timestamp": "2025-11-10T12:54:00Z",
    "success": true
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "createdAt": "2025-11-10T12:54:00Z"
}
```

### Failed Login
```json
{
  "id": "uuid",
  "userId": null,
  "action": "FAILED_LOGIN",
  "entityType": "User",
  "entityId": "admin@mindflow.com",
  "changes": {
    "email": "admin@mindflow.com",
    "reason": "Invalid email or password",
    "timestamp": "2025-11-10T12:55:00Z",
    "success": false
  },
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2025-11-10T12:55:00Z"
}
```

---

## ✅ Compliance & Standards

This implementation follows:
- **OWASP Logging Cheat Sheet**
- **CIS Controls v8** - Control 8: Audit Log Management
- **PCI DSS** - Requirement 10: Track and monitor all access
- **SOC 2** - CC7.2: System logging
- **GDPR** - Article 30: Records of processing activities

---

## 📚 Related Documentation

- [Auth Testing Guide](./AUTH_TESTING_GUIDE.md)
- [Security Headers](../backend/src/middleware/securityHeaders.ts)
- [CORS Hardening](./CORS_HARDENING.md)
- [Sprint 1 Plan](./sprints/sprint-01/PLAN.md)

---

**Last Updated**: 2025-11-10
**Author**: Claude (AI Assistant)
**Sprint**: Sprint 1 - Day 5
**Status**: ✅ Production Ready
