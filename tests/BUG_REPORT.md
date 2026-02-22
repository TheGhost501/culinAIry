# Bug Report

**Project**: CulinAIry  
**Report Date**: [Date]  
**Reported By**: QA Team  
**Test Cycle**: Pre-Release Validation

---

## Bug Summary

| Severity | Count | % of Total |
|----------|-------|------------|
| 🔴 Blocker | 3 | ___% |
| 🔴 Critical | 0 | ___% |
| 🟡 Major | ___ | ___% |
| 🟢 Minor | ___ | ___% |
| **TOTAL** | **___** | **100%** |

---

## 🔴 BLOCKER BUGS (Release Blockers)

### BUG-001: Plain-Text Password Storage

**Severity**: 🔴 Blocker (CVSS 9.8)  
**Priority**: P0 - Must fix before any deployment  
**Status**: Open  
**Found In**: TC-SEC-001

**Description**:
User passwords are stored as plain text in `server/data/users.json` without any encryption or hashing. This is a critical security vulnerability that violates OWASP Top 10 standards and industry best practices.

**Steps to Reproduce**:
1. Register a new user via `/api/auth/register` with password: `MySecretPassword123!`
2. Open `server/data/users.json` in text editor
3. Search for newly created user
4. **BUG**: Password visible as plain text: `"password": "MySecretPassword123!"`

**Expected Behavior**:
- Passwords should be hashed using bcrypt (or similar) with 10+ salt rounds
- Password field should contain hash: `"password": "$2b$10$abcdefg..."`
- Login comparison should use `bcrypt.compare(inputPassword, hashedPassword)`

**Actual Behavior**:
- Password stored as plain text in JSON file
- Direct string comparison in [server/routes/auth.js](../server/routes/auth.js) line 93:
  ```javascript
  if (user.password !== password) { // Direct comparison
  ```

**Impact**:
- **HIGH**: Complete credential compromise if `users.json` accessed by unauthorized party
- **Compliance Risk**: Violates data protection regulations (GDPR, CCPA)
- **Reputation Risk**: Users expect basic security standards
- **Attack Surface**: Database backup, server breach, or file access exposes all passwords

**Affected Files**:
- `server/routes/auth.js` - Registration (line 48), Login (line 93)
- `server/data/users.json` - All user records

**Environment**:
- All environments (development, staging, production)

**Fix Recommendation**:
```javascript
// Install bcrypt
npm install bcrypt

// In server/routes/auth.js
const bcrypt = require('bcrypt');

// Registration
const hashedPassword = await bcrypt.hash(password, 10);
// Store hashedPassword instead of password

// Login
const match = await bcrypt.compare(inputPassword, user.password);
if (!match) {
  return res.status(401).json({error: 'Invalid email or password'});
}
```

**Estimated Fix Time**: 4-8 hours (implementation + testing + regression)

**Attachments**:
- Screenshot: [users.json with plain-text passwords]
- Code reference: [auth.js lines 48, 93]

**Related Bugs**: N/A

---

### BUG-002: No Token Expiration

**Severity**: 🔴 Critical (CVSS 8.1)  
**Priority**: P0 - Must fix before deployment  
**Status**: Open  
**Found In**: TC-SEC-002

**Description**:
Authentication tokens never expire. Once a user logs in, their token remains valid until manual logout. Stolen tokens can be used indefinitely.

**Steps to Reproduce**:
1. Login via API: POST `/api/auth/login`
2. Capture token from response
3. Open `server/data/users.json`, find session in `sessions` array
4. Manually change `createdAt` to 30 days ago
5. Make API request with old token: GET `/api/recipes/my-recipes` with `X-Authorization: <token>`
6. **BUG**: Request succeeds despite 30-day-old session

**Expected Behavior**:
- Tokens should expire after reasonable TTL (24 hours recommended)
- Expired token requests should return 401 with "Session expired" message
- Sessions should be cleaned up from storage periodically

**Actual Behavior**:
- Tokens valid forever until logout
- No TTL check in [server/middleware/auth.js](../server/middleware/auth.js)
- `createdAt` timestamp stored but never validated

**Impact**:
- **HIGH**: Stolen tokens remain valid indefinitely
- Session hijacking risk if token leaks through:
  - XSS vulnerability
  - Network interception (no HTTPS)
  - Browser history/cache
  - Shared computer
- Users who forget to logout remain authenticated forever

**Affected Files**:
- `server/middleware/auth.js` - Token validation logic
- `server/utils/tokenGenerator.js` - Token creation (has createdAt but no expiry)
- `server/data/users.json` - Sessions array

**Fix Recommendation**:
```javascript
// In server/middleware/auth.js
const session = sessions.find(s => s.token === token);
if (!session) {
  return res.status(401).json({error: 'Invalid or expired token'});
}

const TTL = 24 * 60 * 60 * 1000; // 24 hours
const sessionAge = Date.now() - new Date(session.createdAt).getTime();

if (sessionAge > TTL) {
  data.sessions = data.sessions.filter(s => s.token !== token);
  await writeJSON(usersFilePath, data);
  return res.status(401).json({error: 'Session expired. Please login again.'});
}
```

**Estimated Fix Time**: 2-4 hours

**Workaround**: Manual session cleanup by editing `users.json`

**Attachments**:
- Screenshot: [30-day-old session still working]

**Related Bugs**: N/A

---

### BUG-003: No Rate Limiting on Authentication Endpoints

**Severity**: 🔴 Critical (CVSS 7.5)  
**Priority**: P0 - Must fix before deployment  
**Status**: Open  
**Found In**: TC-SEC-003

**Description**:
Login endpoint has no rate limiting. Attackers can make unlimited password guessing attempts without any throttling or account lockout.

**Steps to Reproduce**:
1. Run brute-force script (see test case TC-SEC-003):
   ```javascript
   for (let i = 0; i < 100; i++) {
     await fetch('http://localhost:3000/api/auth/login', {
       method: 'POST',
       body: JSON.stringify({email: 'gordon@ramsay.com', password: `attempt${i}`})
     });
   }
   ```
2. **BUG**: All 100 attempts processed without throttling
3. No IP-based blocking
4. No account lockout after failed attempts

**Expected Behavior**:
- Maximum 5 login attempts per 15 minutes per IP
- HTTP 429 "Too Many Requests" after limit reached
- Account lockout after 5 failed attempts (optional)
- CAPTCHA after 3 failed attempts (optional)

**Actual Behavior**:
- Unlimited requests accepted
- No rate-limiting middleware in [server/server.js](../server/server.js)
- Response time consistent (no exponential backoff)

**Impact**:
- **HIGH**: Brute-force password guessing feasible
- Estimated time to crack 8-character password: ~1-2 days (depending on complexity)
- Credential stuffing attacks possible (leaked password databases)
- Server resources consumed by attack attempts

**Affected Files**:
- `server/server.js` - Missing rate-limit middleware
- `server/routes/auth.js` - Login endpoint

**Fix Recommendation**:
```javascript
// Install express-rate-limit
npm install express-rate-limit

// In server/server.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', rateLimit({windowMs: 60*60*1000, max: 3}));
```

**Estimated Fix Time**: 1-2 hours

**Test Results**:
- 100 attempts in 12 seconds: All processed
- No errors or throttling detected

**Attachments**:
- Brute-force test script output
- Network timing logs

**Related Bugs**: N/A

---

## 🔴 CRITICAL BUGS

_(No critical bugs found - all critical issues classified as blockers above)_

---

## 🟡 MAJOR BUGS

### BUG-004: [Example - Replace with actual bugs found]

**Severity**: 🟡 Major  
**Priority**: P1  
**Status**: Open  
**Found In**: [Test Case ID]

**Description**:
[Brief description of the bug]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. **BUG**: [What went wrong]

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Impact**:
[How this affects users or system]

**Workaround**:
[Temporary solution if available]

**Estimated Fix Time**: [Hours/Days]

---

## 🟢 MINOR BUGS

### BUG-00X: [Example Minor Bug]

**Severity**: 🟢 Minor  
**Priority**: P2  
**Status**: Open  
**Found In**: [Test Case ID]

**Description**:
[Description]

_(Use above template for each minor bug found)_

---

## Bug Metrics

### Bugs by Source
- Security Testing: 3
- Functional Testing: ___
- UI/UX Testing: ___
- Integration Testing: ___
- Regression Testing: ___

### Bugs by Component
- Authentication: 3
- Recipe CRUD: ___
- Ingredient Scaler: ___
- Frontend UI: ___
- Backend API: 3

### Resolution Status
- Open: ___
- In Progress: ___
- Fixed (Pending Verification): ___
- Closed (Verified): ___
- Won't Fix: ___
- Duplicate: ___

---

## Known Issues Log

| Bug ID | Title | Severity | Status | Assigned | Target Fix Date |
|--------|-------|----------|--------|----------|-----------------|
| BUG-001 | Plain-text passwords | 🔴 Blocker | Open | Dev Team | ASAP |
| BUG-002 | No token expiration | 🔴 Critical | Open | Dev Team | ASAP |
| BUG-003 | No rate limiting | 🔴 Critical | Open | Dev Team | ASAP |
| BUG-004 | [Title] | 🟡 Major | | | |
| BUG-005 | [Title] | 🟡 Major | | | |

---

## Recommended Actions

### Immediate (Before Any Deployment)
1. ✅ Implement bcrypt password hashing (BUG-001)
2. ✅ Add token expiration with 24h TTL (BUG-002)
3. ✅ Add rate limiting to auth endpoints (BUG-003)
4. ✅ Regression test all authentication flows
5. ✅ Security re-assessment after fixes

### Short Term (Next Sprint)
- [Additional bugs to fix]

### Long Term (Future Releases)
- [Nice-to-have improvements]

---

## Bug Report History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | [Date] | Initial report - 3 blocker bugs identified | QA Team |
| 1.1 | [Date] | [Updated with fixes/new bugs] | QA Team |

---

**Report Maintained By**: QA Team  
**Last Updated**: [Date]  
**Contact**: [Email]
