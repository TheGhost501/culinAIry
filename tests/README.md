# Automated Test Setup Instructions

This directory contains automated test suites for CulinAIry. Tests are organized into:
- **Backend API Tests** (Jest + Supertest)
- **End-to-End Tests** (Playwright)
- **Manual Test Cases** (Documentation only)

---

## Quick Start

### 1. Install Dependencies

```bash
cd tests
npm install
```

This installs:
- `jest` - JavaScript testing framework
- `supertest` - HTTP assertion library for API testing
- `@playwright/test` - E2E testing framework
- `node-fetch` - HTTP client for security tests

### 2. Run Tests

```bash
# Run all backend API tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI (visual test runner)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed
```

---

## Test Structure

```
tests/
├── package.json                 # Test dependencies and scripts
├── playwright.config.js         # Playwright E2E configuration
├── automated/                   # Automated test files
│   ├── backend/                 # Jest + Supertest API tests
│   │   ├── auth.test.js         # Authentication tests
│   │   ├── recipes.test.js      # Recipe CRUD tests
│   │   └── security.test.js     # Automated security checks
│   └── e2e/                     # Playwright E2E tests
│       ├── auth.spec.js         # Auth flow E2E tests
│       ├── recipes.spec.js      # Recipe CRUD E2E tests
│       └── scaler.spec.js       # Ingredient scaler E2E tests
└── manual/                      # Manual test documentation
    ├── AUTH_TEST_CASES.md
    ├── RECIPE_TEST_CASES.md
    ├── INGREDIENT_SCALER_TEST_CASES.md
    └── SECURITY_TEST_CASES.md
```

---

## Backend API Tests (Jest)

### Test Files

- **auth.test.js**: Authentication API endpoints (register, login, logout)
- **recipes.test.js**: Recipe CRUD operations and authorization
- **security.test.js**: Security validation (password hashing, rate limiting checks)

### Running Backend Tests

```bash
# Run all backend tests
npm test

# Run specific test file
npx jest automated/backend/auth.test.js

# Run with coverage report
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

### Example Test Output

```
PASS  automated/backend/auth.test.js
  Authentication API
    ✓ POST /api/auth/register - creates new user (234ms)
    ✓ POST /api/auth/register - rejects duplicate email (145ms)
    ✓ POST /api/auth/login - returns token for valid credentials (198ms)
    ✓ POST /api/auth/login - rejects invalid password (123ms)
    ✓ POST /api/auth/logout - invalidates token (167ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Time:        2.345s
```

---

## End-to-End Tests (Playwright)

### Test Files

- **auth.spec.js**: Complete authentication user flows
- **recipes.spec.js**: Recipe creation, editing, deletion flows
- **scaler.spec.js**: Ingredient scaler interaction tests

### Running E2E Tests

```bash
# Headless mode (CI/CD)
npm run test:e2e

# UI mode (visual test runner with time travel)
npm run test:e2e:ui

# Headed mode (see browser actions)
npm run test:e2e:headed

# Run specific test file
npx playwright test automated/e2e/auth.spec.js

# Run with specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
```

### Example E2E Test Output

```
Running 8 tests using 4 workers

  ✓  [chromium] › auth.spec.js:5:5 › user registration flow (3.2s)
  ✓  [chromium] › auth.spec.js:25:5 › user login flow (2.8s)
  ✓  [chromium] › recipes.spec.js:10:5 › create recipe (4.1s)
  ✓  [chromium] › scaler.spec.js:8:5 › scale recipe servings (2.3s)

  8 passed (12.4s)
```

---

## Prerequisites

### Backend Server Must Be Running

Before running tests, ensure the backend is started:

```bash
cd ../server
node server.js
# Server running on http://localhost:3000
```

### Frontend Server (E2E Tests Only)

For E2E tests, frontend must be accessible:

```bash
# Option 1: VS Code Live Server on port 5500
# Right-click client/index.html → "Open with Live Server"

# Option 2: Python HTTP server
cd ../client
python -m http.server 5500
```

### Test Data

Tests use existing demo data:
- **Demo user**: gordon@ramsay.com / gordon#1
- **Sample recipes**: Existing recipes in `server/data/recipes.json`

**⚠️ Warning**: Some tests create/modify data. Consider backing up data files before running tests.

---

## Configuration

### Jest Configuration

See `package.json` for Jest config:
```json
{
  "jest": {
    "testEnvironment": "node",
    "coverageDirectory": "./coverage",
    "testTimeout": 10000
  }
}
```

### Playwright Configuration

See `playwright.config.js` for Playwright settings:
- Base URL: `http://localhost:5500`
- Browsers: Chromium, Firefox, WebKit
- Screenshots on failure
- Video recording for failed tests

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install server dependencies
        run: cd server && npm install
      
      - name: Start backend
        run: cd server && node server.js &
      
      - name: Install test dependencies
        run: cd tests && npm install
      
      - name: Run backend tests
        run: cd tests && npm test
      
      - name: Install Playwright browsers
        run: cd tests && npx playwright install
      
      - name: Run E2E tests
        run: cd tests && npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: tests/test-results/
```

---

## Writing New Tests

### Backend API Test Template

```javascript
import request from 'supertest';
import app from '../../../server/server.js';

describe('Your Feature API', () => {
  test('should perform action', async () => {
    const response = await request(app)
      .post('/api/your-endpoint')
      .send({data: 'test'});
    
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

### E2E Test Template

```javascript
import { test, expect } from '@playwright/test';

test('user can perform action', async ({ page }) => {
  await page.goto('http://localhost:5500/#/page');
  await page.fill('input[name="field"]', 'value');
  await page.click('button[type="submit"]');
  await expect(page.locator('.success')).toBeVisible();
});
```

---

## Troubleshooting

### Tests Fail with "ECONNREFUSED"

**Problem**: Backend server not running  
**Solution**: Start server with `cd server && node server.js`

### E2E Tests Timeout

**Problem**: Frontend not accessible or slow  
**Solution**: Verify frontend on http://localhost:5500, increase timeout in `playwright.config.js`

### Jest Cannot Find Modules

**Problem**: ES6 modules not resolving  
**Solution**: Ensure `"type": "module"` in server/package.json

### Playwright Browser Not Found

**Problem**: Browsers not installed  
**Solution**: Run `npx playwright install`

---

## Coverage Reports

After running `npm test`, view coverage report:

```bash
# Open HTML coverage report
open coverage/lcov-report/index.html

# Or view in terminal
cat coverage/coverage-summary.json
```

---

## Next Steps

1. **Run initial test suite**: `npm test && npm run test:e2e`
2. **Review failures**: Check test output for failures, compare with manual test cases
3. **Expand coverage**: Add tests for edge cases documented in manual test cases
4. **Integrate with CI**: Set up GitHub Actions or similar for automated testing on commits
5. **Security testing**: Run manual security tests from `manual/SECURITY_TEST_CASES.md`

---

**For detailed test case documentation, see:**
- [Manual Test Cases](manual/)
- [Test Execution Report Template](TEST_EXECUTION_REPORT.md)
- [Bug Report Template](BUG_REPORT.md)
