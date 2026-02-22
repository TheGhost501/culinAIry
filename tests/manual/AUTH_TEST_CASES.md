# Authentication Test Cases

**Module**: Authentication  
**Priority**: P1 (Blocker)  
**Test Files**: 
- Frontend: [client/js/views/loginView.js](../../client/js/views/loginView.js), [client/js/views/registerView.js](../../client/js/views/registerView.js)
- Backend: [server/routes/auth.js](../../server/routes/auth.js)
- Middleware: [server/middleware/auth.js](../../server/middleware/auth.js)

---

## TC-AUTH-001: Successful User Registration

**Objective**: Verify new users can register with valid credentials

**Preconditions**: 
- Backend running on port 3000
- Frontend accessible on port 5500
- Browser localStorage cleared

**Test Steps**:
1. Navigate to `http://localhost:5500/#/register`
2. Verify registration form displays with fields: Email, Username, Password, Repeat Password
3. Fill form with test data:
   - Email: `qa.test.user@example.com`
   - Username: `qatestuser`
   - Password: `TestPassword123!`
   - Repeat Password: `TestPassword123!`
4. Click "Create Account" button
5. Observe button text changes to "Creating account..."
6. Wait for response

**Expected Results**:
- ✅ Success message displays: "Registration successful!" or similar
- ✅ User redirected to `#/recipes` view
- ✅ New user entry created in `server/data/users.json` with:
  - Unique UUID as `id`
  - Email: `qa.test.user@example.com`
  - Username: `qatestuser`
  - `createdAt` timestamp in ISO format
  - **⚠️ PASSWORD STORED AS PLAIN TEXT** (security issue - document)
- ✅ No auth token stored in localStorage (user must login separately)

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Screenshots**:

---

## TC-AUTH-002: Duplicate Email Prevention

**Objective**: Verify system rejects registration with already-registered email

**Preconditions**: 
- Demo user `gordon@ramsay.com` exists in users.json
- On registration page `#/register`

**Test Steps**:
1. Fill registration form with:
   - Email: `gordon@ramsay.com` (existing user)
   - Username: `anothergordon`
   - Password: `password123`
   - Repeat Password: `password123`
2. Click "Create Account"
3. Observe response

**Expected Results**:
- ❌ Registration fails with error message
- ❌ Error displays: "Email already registered" or "User already exists"
- ❌ HTTP 400 Bad Request returned from backend
- ❌ No new user created in users.json
- ❌ No redirect occurs (user remains on registration page)
- ✅ Form values remain filled (don't clear on error)

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Edge Cases to Test**:
- Case sensitivity: Try `GORDON@RAMSAY.COM` (should also be rejected if emails are case-insensitive)
- Whitespace: Try ` gordon@ramsay.com ` (with spaces)

---

## TC-AUTH-003: Password Mismatch Validation

**Objective**: Verify frontend prevents submission when passwords don't match

**Preconditions**: 
- On registration page `#/register`

**Test Steps**:
1. Fill registration form with:
   - Email: `test@example.com`
   - Username: `testuser`
   - Password: `password123`
   - Repeat Password: `password456` (different)
2. Click "Create Account"
3. Observe validation

**Expected Results**:
- ❌ Frontend validation triggers before API call
- ❌ Error message displays: "Passwords do not match" or similar
- ❌ No HTTP request sent to backend (verify in Network tab)
- ❌ Form not submitted
- ✅ Error message styled with `.error` class (red text)

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Validation to Check**:
- ⬜ Error appears immediately on button click (not on blur)
- ⬜ Error clears when user corrects passwords
- ⬜ Submit button remains enabled (allows retry)

---

## TC-AUTH-004: Invalid Email Format

**Objective**: Verify backend rejects invalid email formats

**Preconditions**: 
- On registration page `#/register`

**Test Steps**:
1. Test multiple invalid email formats:
   - `notanemail` (no @ symbol)
   - `missing@domain` (no TLD)
   - `@nodomain.com` (no local part)
   - `spaces in@email.com` (spaces)
   - `double@@at.com` (double @)
2. For each, fill form and submit
3. Observe backend response

**Expected Results**:
- ❌ Backend returns HTTP 400 Bad Request
- ❌ Error message: "Invalid email format"
- ❌ No user created in users.json
- ✅ Frontend displays error message to user

**Actual Results**: 
- `notanemail`: [result]
- `missing@domain`: [result]
- `@nodomain.com`: [result]
- `spaces in@email.com`: [result]
- `double@@at.com`: [result]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Backend Validation Reference**: 
Email regex in [server/routes/auth.js](../../server/routes/auth.js): `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`

---

## TC-AUTH-005: Successful Login

**Objective**: Verify registered users can login with correct credentials

**Preconditions**: 
- Demo user exists: `gordon@ramsay.com` / `gordon#1`
- Browser localStorage cleared
- User logged out

**Test Steps**:
1. Navigate to `http://localhost:5500/#/login`
2. Verify login form displays with Email and Password fields
3. Fill form:
   - Email: `gordon@ramsay.com`
   - Password: `gordon#1`
4. Click "Login" button
5. Observe button text changes to "Logging in..."
6. Wait for response
7. Open browser DevTools → Application → Local Storage → Check stored values

**Expected Results**:
- ✅ Success response from backend with user data
- ✅ Token stored in localStorage as key `culinairy_token`
- ✅ User ID stored in localStorage as key `culinairy_user_id`
- ✅ New session entry added to `server/data/users.json` in `sessions` array:
  ```json
  {
    "token": "uuid-v4-string",
    "userId": "gordon-userId",
    "createdAt": "2026-02-22T12:00:00.000Z"
  }
  ```
- ✅ Navbar updates to show: "My Recipes", "Create Recipe", "Logout" links
- ✅ Login/Register links hidden in navbar
- ✅ User redirected to `#/recipes` view
- ✅ `authChange` custom event dispatched (check in console event listeners)

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Verification Steps**:
- ⬜ Check Network tab: POST request to `/api/auth/login` returns 200
- ⬜ Response body contains: `{data: {token, userId, username, email}}`
- ⬜ Navbar component re-renders after login

---

## TC-AUTH-006: Invalid Credentials

**Objective**: Verify login fails with incorrect password

**Preconditions**: 
- On login page `#/login`

**Test Steps**:
1. Attempt login with valid email but wrong password:
   - Email: `gordon@ramsay.com`
   - Password: `wrongpassword123`
2. Click "Login"
3. Observe response

**Expected Results**:
- ❌ Backend returns HTTP 401 Unauthorized
- ❌ Error message displays: "Invalid email or password"
- ❌ No token stored in localStorage
- ❌ No redirect occurs
- ❌ Navbar remains in logged-out state
- ✅ Form remains visible for retry

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Test Variants**:
- ⬜ Non-existent email: `nobody@example.com` → Same error message (don't leak user existence)
- ⬜ Empty password: `""` → Backend validation error
- ⬜ Empty email: `""` → Backend validation error

**Notes**: 

---

## TC-AUTH-007: Protected Route Access Without Auth

**Objective**: Verify unauthenticated users cannot access protected routes

**Preconditions**: 
- User logged out (localStorage cleared)
- Backend running

**Test Steps**:
1. Directly navigate to protected routes:
   - `http://localhost:5500/#/create-recipe`
   - `http://localhost:5500/#/edit-recipe/any-id`
   - `http://localhost:5500/#/my-recipes`
2. Observe router behavior for each route

**Expected Results**:
- ❌ Protected view does NOT render
- ✅ Router redirects to `#/login` automatically
- ✅ Login form displays
- ✅ No error messages displayed (silent redirect)
- ✅ After login, user can manually navigate back to protected routes

**Actual Results**: 
- `/create-recipe`: [result]
- `/edit-recipe/:id`: [result]
- `/my-recipes`: [result]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Router Logic Reference**: 
Check [client/js/router.js](../../client/js/router.js) line ~64 for protected route logic

**⚠️ Potential Enhancement**: 
Save attempted URL and redirect user there after successful login (currently not implemented)

---

## TC-AUTH-008: Logout Flow

**Objective**: Verify logout properly invalidates session and clears local state

**Preconditions**: 
- User logged in as `gordon@ramsay.com`
- On any page (e.g., `#/recipes`)

**Test Steps**:
1. Locate "Logout" button in navbar (styled as red danger button)
2. Click "Logout"
3. Observe button text changes to "Logging out..."
4. Wait for logout completion
5. Check localStorage in DevTools
6. Open `server/data/users.json` and verify `sessions` array
7. Attempt to navigate to `#/my-recipes`

**Expected Results**:
- ✅ POST request sent to `/api/auth/logout` with token in `X-Authorization` header
- ✅ Backend removes session from `sessions` array in users.json
- ✅ Token removed from localStorage (`culinairy_token` deleted)
- ✅ User ID removed from localStorage (`culinairy_user_id` deleted)
- ✅ Navbar updates to show: "Login", "Register" links
- ✅ Protected links hidden: "My Recipes", "Create Recipe" removed
- ✅ User redirected to `#/` (home page)
- ✅ Attempting to access `#/my-recipes` redirects to `#/login`

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Additional Validation**:
- ⬜ After logout, trying to use old token in API request returns 401 Unauthorized
- ⬜ Multiple logouts don't cause errors (button disabled after first click)
- ⬜ Logout from different page (e.g., recipe details) still works correctly

**Known Issue**: 
If multiple tabs are open, logging out in one tab doesn't sync to other tabs (localStorage doesn't broadcast changes). Document this behavior.

---

## Test Summary

**Total Test Cases**: 8  
**Estimated Time**: 4-6 hours  
**Priority**: P1 (Must pass before release)

**Dependencies**: 
- Backend: [server/routes/auth.js](../../server/routes/auth.js)
- Frontend: [client/js/views/loginView.js](../../client/js/views/loginView.js), [client/js/views/registerView.js](../../client/js/views/registerView.js)
- Middleware: [server/middleware/auth.js](../../server/middleware/auth.js)
- State: [client/js/auth.js](../../client/js/auth.js)

**Critical Findings Expected**:
- ⚠️ **SECURITY**: Plain-text password storage (will be documented in every registration/login test)
- ⚠️ **SECURITY**: No token expiration (tokens valid indefinitely)
- ⚠️ **UX**: No "remember me" vs "temporary session" options

**Related Test Suites**: 
- [SECURITY_TEST_CASES.md](SECURITY_TEST_CASES.md) - Security-focused auth testing
- [RECIPE_TEST_CASES.md](RECIPE_TEST_CASES.md) - Authorization checks for recipe ownership
