# CulinAIry Pre-Release Testing & Validation Plan

**Version**: 1.0  
**Date**: February 22, 2026  
**Timeline**: 2 weeks  
**Approach**: Functionality-first with critical security validation  
**Test Environment**: Development (localhost:3000 backend, localhost:5500 frontend)

## Executive Summary

This plan validates CulinAIry's core functionality and addresses 3 critical security vulnerabilities discovered during codebase analysis:
- **CRITICAL**: Plain-text password storage
- **HIGH**: No token expiration
- **HIGH**: No rate limiting on authentication endpoints

**Testing Strategy**: Manual test cases (Week 1), Security penetration testing (Week 2), with automated test framework recommendations for ongoing QA.

## Test Objectives

1. **Functional Validation**: Verify all 8 user flows (auth, recipe CRUD, ingredient scaler)
2. **Security Assessment**: Document critical vulnerabilities and validate authorization
3. **UI/UX Validation**: Cross-browser compatibility, responsive design, accessibility
4. **Error Handling**: Verify graceful degradation and user feedback
5. **Data Integrity**: Test concurrent operations and persistence

## Scope

### In Scope
- Authentication flows (register, login, logout)
- Recipe CRUD operations (create, read, update, delete)
- Ingredient scaler component with unit conversions
- Authorization and ownership validation
- Security penetration tests (XSS, CSRF, brute-force)
- Browser compatibility (Chrome, Firefox, Edge)
- Responsive design validation (mobile, tablet, desktop)

### Out of Scope
- Performance/load testing with 100+ concurrent users
- Database migration (using existing JSON file storage)
- Third-party API integrations (none exist)
- Mobile app testing (web-only application)

## Test Environment

### Backend Setup
```bash
cd server
npm install
node server.js  # Runs on http://localhost:3000
```

### Frontend Setup
```bash
# Option 1: VS Code Live Server (recommended)
# Right-click client/index.html → "Open with Live Server"

# Option 2: Python HTTP server
cd client
python -m http.server 5500

# Option 3: Node.js serve
npx serve client -p 5500
```

### Test Data
- **Demo User**: gordon@ramsay.com / gordon#1 (existing in users.json)
- **Sample Recipes**: 5+ recipes in recipes.json with various ingredient types
- **Clean State**: Clear browser localStorage before each test session

### Tools Required
- Browser DevTools (Network tab, Console, Application/Storage)
- Text editor for viewing/editing JSON data files
- curl or Postman for API testing
- Screenshots tool for bug documentation

## Test Schedule

### Week 1: Functional Validation (40 hours)
- **Day 1-2**: Environment setup, Authentication test suite (8 test cases)
- **Day 3-4**: Recipe CRUD test suite (9 test cases)
- **Day 4-5**: Ingredient scaler test suite (7 test cases)
- **Day 5**: UI/UX validation (6 test cases), Error handling (5 test cases)

### Week 2: Security & Documentation (40 hours)
- **Day 6-7**: Security penetration testing (8 test cases)
- **Day 8**: Accessibility audit (2 test cases)
- **Day 9**: Data persistence & concurrency testing (3 test cases)
- **Day 10**: Test report compilation, bug documentation, automation recommendations

## Test Categories

### Priority 1 (Blockers)
- Authentication flows
- Recipe CRUD operations
- Security vulnerabilities

### Priority 2 (Critical)
- Ingredient scaler functionality
- UI/UX validation
- Authorization checks

### Priority 3 (Important)
- Error handling edge cases
- Accessibility
- Data concurrency

## Entry Criteria
- ✅ Backend server starts without errors
- ✅ Frontend loads in browser
- ✅ Demo user exists in users.json
- ✅ Sample recipes exist in recipes.json
- ✅ DevTools accessible in test browsers

## Exit Criteria
- All 50+ test cases executed and documented
- Security vulnerabilities logged with severity ratings
- Test execution report completed
- Bug tickets created for all failures
- Automation roadmap documented

## Deliverables

1. **Test Execution Report** (`TEST_EXECUTION_REPORT.md`)
   - Test case results (Pass/Fail/Blocked)
   - Screenshots for visual bugs
   - Notes and observations

2. **Bug Report** (`BUG_REPORT.md`)
   - Defect list with severity, priority, steps to reproduce
   - Expected vs actual behavior
   - Links to screenshots/recordings

3. **Security Assessment** (`SECURITY_ASSESSMENT.md`)
   - Vulnerability details with CVSS scores
   - Proof of concept exploits
   - Remediation recommendations

4. **Automation Roadmap** (`AUTOMATION_ROADMAP.md`)
   - Framework setup instructions (Jest, Playwright)
   - Priority test cases for automation
   - CI/CD integration plan

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Security vulnerabilities block release | HIGH | Document findings immediately, recommend deployment hold |
| Test data corruption during concurrent tests | MEDIUM | Backup users.json and recipes.json before testing |
| Browser compatibility issues | MEDIUM | Test in all target browsers, document workarounds |
| Time constraint (2 weeks) | MEDIUM | Focus on Priority 1-2 tests, defer P3 if needed |

## Success Metrics

- **Test Coverage**: >80% of identified user flows tested
- **Critical Bugs**: 0 unresolved blockers at release
- **Security**: All critical vulnerabilities documented with fix recommendations
- **Automation**: Framework setup guide ready for dev team

## Sign-Off

**QA Lead**: _________________  
**Development Lead**: _________________  
**Product Owner**: _________________  
**Date**: _________________

---

**Next Steps**: Proceed to [Manual Test Cases](manual/README.md) for detailed test case documentation.
