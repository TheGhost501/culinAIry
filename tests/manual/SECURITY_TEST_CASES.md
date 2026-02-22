# Security Test Cases

**Module**: Security & Penetration Testing  
**Priority**: P1 (Critical - Blocking Issues)  
**Focus**: Authentication security, authorization, XSS, CSRF, and data protection

---

## 🔴 CRITICAL SECURITY VULNERABILITIES

### TC-SEC-001: Plain-Text Password Storage Verification

**Severity**: 🔴 **CRITICAL** (CVSS 9.8)  
**CWE**: CWE-256 (Plaintext Storage of a Password)  
**Impact**: Complete credential compromise if database/file accessed

**Objective**: Document and verify the critical plain-text password storage vulnerability

**Test Files**: 
- [server/routes/auth.js](../../server/routes/auth.js) - Registration/login logic
- [server/data/users.json](../../server/data/users.json) - User storage

**Test Steps**:
1. Register new user via API:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "security.test@example.com",
       "username": "sectest",
       "password": "MySecretPassword123!",
       "repeatPassword": "MySecretPassword123!"
     }'
   ```
2. Open `server/data/users.json` in text editor
3. Search for user with email `security.test@example.com`
4. Examine `password` field
5. Verify password comparison in [auth.js](../../server/routes/auth.js) line ~93

**Expected Finding**:
- ❌ **CRITICAL**: Password stored as plain text in JSON:
  ```json
  {
    "id": "some-uuid",
    "email": "security.test@example.com",
    "username": "sectest",
    "password": "MySecretPassword123!",  // ← PLAIN TEXT!
    "createdAt": "2026-02-22T12:00:00.000Z"
  }
  ```
- ❌ Login comparison uses direct string equality:
  ```javascript
  if (user.password !== password) {
    return res.status(401).json({error: 'Invalid email or password'});
  }
  ```
- ❌ No hashing library imported (bcrypt, argon2, etc.)

**Remediation Required**:
```javascript
// RECOMMENDED FIX
const bcrypt = require('bcrypt');

// Registration
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);
// Store hashedPassword instead of password

// Login
const match = await bcrypt.compare(inputPassword, user.hashedPassword);
if (!match) {
  return res.status(401).json({error: 'Invalid email or password'});
}
```

**Deployment Decision**: 
- ⚠️ **BLOCK PRODUCTION DEPLOYMENT** until fixed
- ⚠️ Violates OWASP Top 10 (A02:2021 – Cryptographic Failures)
- ⚠️ Non-compliant with industry security standards

**Status**: ⬜ Not Run | ✅ Confirmed | ❌ Not Found

**Notes**: 

---

### TC-SEC-002: Token Expiration Missing

**Severity**: 🔴 **HIGH** (CVSS 8.1)  
**CWE**: CWE-613 (Insufficient Session Expiration)  
**Impact**: Stolen tokens remain valid indefinitely

**Objective**: Verify tokens never expire, creating persistent session vulnerability

**Test Files**: 
- [server/middleware/auth.js](../../server/middleware/auth.js)
- [server/utils/tokenGenerator.js](../../server/utils/tokenGenerator.js)
- [server/data/users.json](../../server/data/users.json) - Sessions array

**Test Steps**:
1. Login via API and capture token:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "gordon@ramsay.com", "password": "gordon#1"}'
   ```
2. Note `token` and session `createdAt` timestamp
3. Open `server/data/users.json`, find session in `sessions` array
4. Manually edit `createdAt` to 30 days ago:
   ```json
   {
     "token": "existing-token-uuid",
     "userId": "gordon-user-id",
     "createdAt": "2026-01-22T12:00:00.000Z"  // 30 days old
   }
   ```
5. Save file
6. Test old token with protected endpoint:
   ```bash
   curl -X GET http://localhost:3000/api/recipes/my-recipes \
     -H "X-Authorization: existing-token-uuid"
   ```
7. Check response

**Expected Finding**:
- ❌ **HIGH RISK**: 30-day-old token still accepted
- ❌ No TTL check in `server/middleware/auth.js`:
  ```javascript
  // CURRENT CODE (no expiration check)
  const session = sessions.find(s => s.token === token);
  if (!session) {
    return res.status(401).json({error: 'Invalid or expired token'});
  }
  // Missing: Check if (Date.now() - session.createdAt > TTL)
  ```
- ❌ Token valid until manual logout

**Remediation Required**:
```javascript
// RECOMMENDED FIX in middleware/auth.js
const session = sessions.find(s => s.token === token);
if (!session) {
  return res.status(401).json({error: 'Invalid or expired token'});
}

const TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const sessionAge = Date.now() - new Date(session.createdAt).getTime();

if (sessionAge > TTL) {
  // Remove expired session
  data.sessions = data.sessions.filter(s => s.token !== token);
  await writeJSON(usersFilePath, data);
  return res.status(401).json({error: 'Session expired. Please login again.'});
}

req.userId = session.userId;
next();
```

**Best Practice**: 
- Implement sliding window (refresh token on activity)
- Add "Remember Me" option (7-day vs 24-hour TTL)

**Status**: ⬜ Not Run | ✅ Confirmed | ❌ Not Found

**Notes**: 

---

### TC-SEC-003: No Rate Limiting (Brute-Force Attack)

**Severity**: 🔴 **HIGH** (CVSS 7.5)  
**CWE**: CWE-307 (Improper Restriction of Excessive Authentication Attempts)  
**Impact**: Unlimited password guessing attempts

**Objective**: Demonstrate brute-force attack feasibility without rate limiting

**Test Files**: 
- [server/routes/auth.js](../../server/routes/auth.js) - Login endpoint
- [server/server.js](../../server/server.js) - Middleware configuration

**Test Steps**:
1. Create brute-force test script `bruteforce_test.js`:
   ```javascript
   const fetch = require('node-fetch');
   
   async function bruteForce() {
     const attempts = [];
     for (let i = 0; i < 100; i++) {
       const start = Date.now();
       const response = await fetch('http://localhost:3000/api/auth/login', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({
           email: 'gordon@ramsay.com',
           password: `attempt${i}`
         })
       });
       const elapsed = Date.now() - start;
       attempts.push({attempt: i, status: response.status, time: elapsed});
     }
     console.log(`Completed ${attempts.length} attempts`);
     console.log(`All attempts processed: ${attempts.every(a => a.status === 401)}`);
     console.log(`Average response time: ${attempts.reduce((sum, a) => sum + a.time, 0) / attempts.length}ms`);
   }
   
   bruteForce();
   ```
2. Run: `node bruteforce_test.js`
3. Observe if any attempt is blocked or throttled
4. Check `server.js` for rate-limiting middleware

**Expected Finding**:
- ❌ **HIGH RISK**: All 100 attempts processed without throttling
- ❌ No rate-limiting middleware found in [server.js](../../server/server.js)
- ❌ No IP-based blocking
- ❌ No CAPTCHA after failed attempts
- ❌ Consistent response time (no exponential backoff)

**Attack Simulation Results**:
- Attempts processed: ___/100
- Response time range: ___ms - ___ms
- Blocked attempts: ___
- Server errors: ___

**Remediation Required**:
```javascript
// RECOMMENDED FIX in server.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', rateLimit({windowMs: 60 * 60 * 1000, max: 3}));
```

**Additional Protection**:
- Implement account lockout after 5 failed attempts
- Add CAPTCHA after 3 failed attempts
- Log suspicious activity (multiple IPs attacking same account)

**Status**: ⬜ Not Run | ✅ Confirmed | ❌ Not Found

**Notes**: 

---

## XSS & Injection Attacks

### TC-SEC-004: XSS Injection in Recipe Fields

**Severity**: 🟡 **MEDIUM** (CVSS 6.5)  
**CWE**: CWE-79 (Cross-Site Scripting)  
**Impact**: Potential session hijacking or malicious script execution

**Objective**: Verify HTML escaping prevents XSS attacks in user-generated content

**Test Files**: 
- [client/js/views/recipeDetailsView.js](../../client/js/views/recipeDetailsView.js)
- [client/js/views/createRecipeView.js](../../client/js/views/createRecipeView.js)
- All view files using `escapeHtml()` function

**Test Steps**:
1. Login and create recipe with malicious payloads:
   ```
   Title: <script>alert('XSS_TITLE')</script>
   Description: <img src=x onerror="alert('XSS_IMG')">
   Ingredient name: <b onmouseover="alert('XSS_HOVER')">Bold Hack</b>
   Instruction: <iframe src="https://malicious.com"></iframe>
   ```
2. Submit recipe
3. Navigate to recipe details page
4. Open browser DevTools → Elements tab
5. Inspect rendered HTML for title, description, ingredients, instructions
6. Check if scripts execute (alert dialogs appear)
7. Check if HTML tags render or are escaped

**Expected Results**:
- ✅ **PASS**: All HTML entities escaped:
  ```html
  &lt;script&gt;alert('XSS_TITLE')&lt;/script&gt;
  ```
- ✅ No script execution (no alert dialogs)
- ✅ HTML displays as text, not rendered tags
- ✅ `escapeHtml()` function applied to all user input
- ✅ Bold, italic, or other formatting tags not rendered

**If XSS Succeeds (FAIL)**:
- ❌ **CRITICAL**: Alert dialogs appear
- ❌ HTML tags render (bold text, iframes, etc.)
- ❌ Potential for session token theft via `localStorage` access
- ❌ Remediation: Implement DOMPurify or validate all escapeHtml() usage

**escapeHtml Implementation to Verify**:
```javascript
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
```

**Test Payloads**:
- ⬜ `<script>alert('XSS')</script>`
- ⬜ `<img src=x onerror="alert('XSS')">`
- ⬜ `<svg/onload=alert('XSS')>`
- ⬜ `javascript:alert('XSS')`
- ⬜ `<iframe src="https://evil.com">`
- ⬜ `<a href="javascript:alert('XSS')">Click</a>`

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes**: 

---

### TC-SEC-005: SQL Injection (Not Applicable)

**Status**: ⬜ N/A (Application uses JSON file storage, not SQL database)

**Notes**: 
- Application uses `server/data/*.json` files for persistence
- No SQL queries executed
- JSON parsing vulnerabilities tested separately
- SQL injection testing not required for this architecture

---

### TC-SEC-006: JSON Injection / File Corruption

**Severity**: 🟡 **MEDIUM** (CVSS 5.5)  
**Impact**: Data corruption or injection of malicious JSON structures

**Objective**: Test if malicious JSON characters can corrupt data files

**Test Steps**:
1. Create recipe with JSON-breaking characters:
   ```
   Title: Recipe with "quotes" and \backslashes\
   Description: Line1\nLine2\rLine3
   Ingredient: Ingredient with {"nested": "json"}
   ```
2. Submit and verify saved correctly in `recipes.json`
3. Attempt to inject JSON closing brackets:
   ```
   Title: } ] "malicious": "injection
   ```
4. Check if `JSON.stringify()` properly escapes

**Expected Results**:
- ✅ All special characters properly escaped by `JSON.stringify()`
- ✅ File remains valid JSON after write
- ✅ No ability to inject additional JSON properties
- ✅ Quotes escaped as `\"`
- ✅ Newlines escaped as `\n`

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes**: 

---

## Authorization & Access Control

### TC-SEC-007: Authorization Bypass via Direct API Call

**Severity**: 🔴 **HIGH** (CVSS 7.3)  
**CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key)  
**Impact**: Unauthorized modification of other users' recipes

**Objective**: Verify backend properly validates ownership before allowing modifications

**Test Files**: 
- [server/routes/recipes.js](../../server/routes/recipes.js) - Update/Delete endpoints

**Test Steps**:
1. Get User A's recipe ID (Gordon's recipe): `gordon-recipe-id`
2. Get User B's token (QA Test User): `qa-test-token`
3. Attempt unauthorized edit via curl/Postman:
   ```bash
   curl -X PUT http://localhost:3000/api/recipes/gordon-recipe-id \
     -H "Content-Type: application/json" \
     -H "X-Authorization: qa-test-token" \
     -d '{"title": "UNAUTHORIZED EDIT ATTEMPT"}'
   ```
4. Check response status and message
5. Verify recipe title in `recipes.json` unchanged
6. Test DELETE endpoint similarly:
   ```bash
   curl -X DELETE http://localhost:3000/api/recipes/gordon-recipe-id \
     -H "X-Authorization: qa-test-token"
   ```

**Expected Results**:
- ✅ **PASS**: PUT returns HTTP 403 Forbidden
- ✅ Error message: "You are not authorized to edit this recipe"
- ✅ Recipe title unchanged in database
- ✅ DELETE also returns 403 Forbidden
- ✅ Recipe not deleted from database
- ✅ Authorization check at [recipes.js](../../server/routes/recipes.js) line ~148:
  ```javascript
  if (recipe.ownerId !== userId) {
    return res.status(403).json({error: 'You are not authorized...'});
  }
  ```

**If Authorization Bypassed (FAIL)**:
- ❌ **CRITICAL**: Status 200, recipe modified
- ❌ Any user can edit/delete any recipe
- ❌ Ownership check missing or flawed

**Additional Tests**:
- ⬜ Missing token → 401 Unauthorized (not 403)
- ⬜ Invalid token → 401 Unauthorized
- ⬜ Expired token → 401 Unauthorized
- ⬜ Token of different user → 403 Forbidden

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes**: 

---

### TC-SEC-008: CORS Policy Validation

**Severity**: 🟡 **MEDIUM** (CVSS 5.8)  
**Impact**: CSRF attacks from unauthorized origins

**Objective**: Verify CORS whitelist properly restricts cross-origin requests

**Test Files**: 
- [server/server.js](../../server/server.js) - CORS configuration

**Test Steps**:
1. Check CORS whitelist in [server.js](../../server/server.js):
   ```javascript
   origin: ['http://localhost:8080', 'http://localhost:5500', 'http://127.0.0.1:8080', 'http://127.0.0.1:5500']
   ```
2. From external website (e.g., codepen.io, jsfiddle.net), attempt API call:
   ```javascript
   fetch('http://localhost:3000/api/recipes', {
     method: 'POST',
     credentials: 'include',
     headers: {
       'Content-Type': 'application/json',
       'X-Authorization': 'stolen-token'
     },
     body: JSON.stringify({title: 'CSRF Test'})
   }).then(r => console.log(r)).catch(e => console.error(e));
   ```
3. Check browser console for CORS error
4. Test from allowed origin (localhost:5500) → Should succeed
5. Test from disallowed origin (differentdomain.com) → Should fail

**Expected Results**:
- ✅ **PASS**: Request from external origin blocked with CORS error:
  ```
  Access to fetch at 'http://localhost:3000/api/recipes' from origin 'https://codepen.io'
  has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
  ```
- ✅ Requests from whitelisted origins succeed
- ✅ `credentials: true` allows cookies/auth headers from allowed origins
- ✅ Preflight OPTIONS requests handled correctly

**Potential Issues**:
- ⚠️ Whitelist includes both `localhost` and `127.0.0.1` (redundant but safe)
- ⚠️ No HTTPS origins in whitelist (development only)
- ⚠️ Wildcard `*` not used (good - prevents all origins)

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes**: 

---

## Data Protection & Privacy

### TC-SEC-009: Sensitive Data Exposure in Responses

**Severity**: 🟡 **LOW** (CVSS 4.3)  
**Impact**: User passwords or sensitive data leaked in API responses

**Objective**: Verify passwords are never returned in API responses

**Test Steps**:
1. Login and capture response:
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "gordon@ramsay.com", "password": "gordon#1"}'
   ```
2. Check response body for `password` field
3. Test `/api/auth/me` endpoint:
   ```bash
   curl -X GET http://localhost:3000/api/auth/me \
     -H "X-Authorization: user-token"
   ```
4. Verify password not in user profile response

**Expected Results**:
- ✅ Login response includes: `{data: {token, userId, username, email}}`
- ✅ **No** `password` field in response
- ✅ `/api/auth/me` returns user data without password
- ✅ Backend uses projection: `{id, email, username}` (excludes password)

**If Password Exposed (FAIL)**:
- ❌ **HIGH RISK**: Plain-text password visible in response
- ❌ Compounds password storage vulnerability

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes**: 

---

### TC-SEC-010: File Path Traversal

**Severity**: 🟢 **LOW** (CVSS 4.0)  
**Impact**: Potential arbitrary file access if exploitable

**Objective**: Verify file paths cannot be manipulated to access system files

**Test Files**: 
- [server/utils/fileHandler.js](../../server/utils/fileHandler.js)

**Test Steps**:
1. Review `fileHandler.js` for path construction
2. Note that file paths are hardcoded:
   ```javascript
   const usersFilePath = path.join(__dirname, '../data/users.json');
   const recipesFilePath = path.join(__dirname, '../data/recipes.json');
   ```
3. Verify no user input used in file path construction
4. Check if any endpoints accept file paths as parameters

**Expected Results**:
- ✅ **PASS**: File paths hardcoded, not user-controlled
- ✅ No endpoints accept file path parameters
- ✅ No risk of `../../etc/passwd` style attacks
- ✅ `path.join()` normalizes paths (prevents escaping data directory)

**Potential Enhancement**:
- Add explicit path validation:
  ```javascript
  if (!filepath.startsWith(path.join(__dirname, '../data'))) {
    throw new Error('Invalid file path');
  }
  ```

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail

**Notes**: 

---

## Test Summary

**Total Security Tests**: 10 (3 critical findings expected)  
**Estimated Time**: 6-8 hours  
**Priority**: P1 (Must document before release)

**Confirmed Critical Vulnerabilities**:
1. 🔴 **Plain-text password storage** (CVSS 9.8) - BLOCKER
2. 🔴 **No token expiration** (CVSS 8.1) - HIGH PRIORITY
3. 🔴 **No rate limiting** (CVSS 7.5) - HIGH PRIORITY

**Security Compliance**:
- ❌ **OWASP Top 10**: A02:2021 – Cryptographic Failures (passwords)
- ❌ **OWASP Top 10**: A07:2021 – Identification and Authentication Failures (tokens)
- ⚠️ **SANS Top 25**: CWE-256 (Plaintext passwords)

**Deployment Recommendation**: 
**🛑 DO NOT DEPLOY TO PRODUCTION** until critical vulnerabilities (TC-SEC-001, TC-SEC-002, TC-SEC-003) are resolved with bcrypt hashing, token expiration, and rate limiting.

**Related Documentation**: 
- [SECURITY_ASSESSMENT.md](../SECURITY_ASSESSMENT.md) - Full vulnerability report with remediation timeline
- [AUTOMATION_ROADMAP.md](../AUTOMATION_ROADMAP.md) - Automated security testing with OWASP ZAP
