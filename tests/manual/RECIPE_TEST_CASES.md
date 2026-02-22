# Recipe CRUD Test Cases

**Module**: Recipe Management  
**Priority**: P1 (Blocker)  
**Test Files**: 
- Frontend: [client/js/views/recipesView.js](../../client/js/views/recipesView.js), [client/js/views/recipeDetailsView.js](../../client/js/views/recipeDetailsView.js), [client/js/views/createRecipeView.js](../../client/js/views/createRecipeView.js), [client/js/views/editRecipeView.js](../../client/js/views/editRecipeView.js), [client/js/views/myRecipesView.js](../../client/js/views/myRecipesView.js)
- Backend: [server/routes/recipes.js](../../server/routes/recipes.js)

---

## TC-RECIPE-001: View All Recipes (Public Access)

**Objective**: Verify unauthenticated users can browse all public recipes

**Preconditions**: 
- Backend running with sample recipes in `recipes.json`
- User logged out
- At least 3-5 recipes exist in database

**Test Steps**:
1. Navigate to `http://localhost:5500/#/recipes`
2. Wait for recipes to load
3. Count displayed recipe cards
4. Observe recipe card content structure
5. Check for Edit/Delete buttons on any card

**Expected Results**:
- ✅ All recipes from `server/data/recipes.json` displayed in grid layout
- ✅ Each recipe card shows:
  - Recipe image (or placeholder if no image)
  - Recipe title
  - Recipe description (truncated if long)
  - Ingredients count or preview
- ✅ Recipe cards are clickable (cursor changes to pointer)
- ✅ Grid layout is responsive (check at different widths)
- ✅ No Edit/Delete buttons visible (user not authenticated)
- ✅ Loading state displays briefly if network slow

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Metrics to Record**:
- Total recipes displayed: ___
- Load time: ___ ms
- Missing images: ___

---

## TC-RECIPE-002: View Recipe Details (Public Access)

**Objective**: Verify recipe details page displays complete recipe information with ingredient scaler

**Preconditions**: 
- On recipes browse page `#/recipes`
- User logged out (or logged in as non-owner)

**Test Steps**:
1. Click any recipe card
2. Verify navigation to `#/recipes/:id` where `:id` is recipe UUID
3. Wait for recipe details to load
4. Observe all displayed sections
5. Check ownership controls visibility

**Expected Results**:
- ✅ Recipe hero section displays:
  - Large recipe image (max-height: 400px, object-fit: cover)
  - Recipe title (escaped HTML)
  - Recipe description
  - Servings count
- ✅ Ingredient scaler component renders:
  - Current servings input field
  - +/- buttons
  - Quick select buttons (1, 2, 4, 6, 8, 10, 12)
  - Reset button
- ✅ Ingredients list shows:
  - Each ingredient with name, quantity, unit
  - Properly formatted (one per line)
- ✅ Instructions section displays:
  - Numbered list of steps
  - One instruction per line
- ✅ "Back to recipes" link visible at top
- ✅ If not owner: Edit/Delete buttons **NOT visible**
- ✅ If owner (logged in as Gordon for his recipe): Edit/Delete buttons **ARE visible**

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Edge Cases**:
- ⬜ Recipe with missing image URL → Check if placeholder or broken image
- ⬜ Recipe with very long title → Check if wraps properly
- ⬜ Recipe with 20+ ingredients → Check if scrollable

---

## TC-RECIPE-003: Create Recipe (Success Path)

**Objective**: Verify authenticated users can create new recipes with valid data

**Preconditions**: 
- User logged in as `gordon@ramsay.com`
- On create recipe page `#/create-recipe`
- Note current recipe count in `recipes.json`

**Test Steps**:
1. Navigate to `#/create-recipe` (via navbar "Create Recipe" link)
2. Verify form displays with all required fields
3. Fill form with test data:
   ```
   Title: QA Test Recipe - Chocolate Chip Cookies
   Description: A delicious test recipe created during QA validation
   Image URL: https://via.placeholder.com/600x400/FF6B6B/FFFFFF?text=Test+Recipe
   Servings: 24
   Ingredients (one per line):
   All-purpose flour | 2.25 | cups
   Baking soda | 1 | tsp
   Salt | 1 | tsp
   Butter | 1 | cup
   Sugar | 0.75 | cup
   Brown sugar | 0.75 | cup
   Vanilla extract | 2 | tsp
   Eggs | 2 | large
   Chocolate chips | 2 | cups
   
   Instructions (one per line):
   Preheat oven to 375°F
   Mix flour, baking soda, and salt in bowl
   Beat butter and sugars until creamy
   Add vanilla and eggs
   Gradually blend in flour mixture
   Stir in chocolate chips
   Drop by rounded tablespoon onto ungreased baking sheets
   Bake 9-11 minutes until golden brown
   Cool on baking sheet for 2 minutes
   ```
4. Click "Create Recipe" button
5. Wait for submission
6. Check `server/data/recipes.json` for new entry

**Expected Results**:
- ✅ Button text changes to "Creating..." during submission
- ✅ Success message displays (or redirect without error)
- ✅ User redirected to `#/my-recipes` view
- ✅ New recipe appears in "My Recipes" list
- ✅ Recipe created in `recipes.json` with:
  - Unique UUID as `id`
  - All form fields stored correctly
  - `ownerId` set to Gordon's userId
  - `ingredients` parsed as array of objects: `[{name, quantity, unit}, ...]`
  - `instructions` parsed as array of strings
  - `createdAt` timestamp in ISO format
  - `updatedAt` same as `createdAt` initially
- ✅ Recipe accessible via `#/recipes/:newId`

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Ingredient Parsing Validation**:
Check that `Butter | 1 | cup` is stored as:
```json
{"name": "Butter", "quantity": 1, "unit": "cup"}
```

---

## TC-RECIPE-004: Create Recipe (Validation Failures)

**Objective**: Verify backend properly validates recipe creation requests

**Preconditions**: 
- User logged in
- On create recipe page `#/create-recipe`

**Test Steps**:
Test each validation scenario separately:

1. **Empty Title**:
   - Leave title blank, fill all other fields
   - Submit → Expected: 400 "Title is required"

2. **Empty Description**:
   - Leave description blank
   - Submit → Expected: 400 error

3. **Invalid Servings**:
   - Set servings to `0`
   - Submit → Expected: Backend validates (or accepts - document behavior)
   - Set servings to `-5`
   - Submit → Expected: Should reject negative values

4. **Empty Ingredients**:
   - Leave ingredients textarea blank
   - Submit → Expected: 400 "Ingredients required" or similar

5. **Empty Instructions**:
   - Leave instructions textarea blank
   - Submit → Expected: 400 error

6. **Malformed Ingredient Format**:
   - Enter `Flour 2 cups` (missing pipe separators)
   - Submit → Check if parsing fails gracefully or creates malformed data

7. **Extremely Long Fields**:
   - Title: 1000 characters
   - Description: 10,000 characters
   - Submit → Check for length validation or database limits

**Expected Results**:
For each invalid input:
- ❌ Backend returns 400 Bad Request
- ❌ Error message displays in UI
- ❌ No recipe created in `recipes.json`
- ❌ User not redirected (stays on form)
- ✅ Form data preserved (user can correct and retry)

**Actual Results**: 
1. Empty Title: [result]
2. Empty Description: [result]
3. Invalid Servings (0): [result]
4. Invalid Servings (-5): [result]
5. Empty Ingredients: [result]
6. Empty Instructions: [result]
7. Malformed Ingredients: [result]
8. Extremely Long Fields: [result]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Expected Findings**:
- ⚠️ Servings validation may be missing (no min/max enforced on backend)
- ⚠️ No max length validation (potential database/storage issues)

---

## TC-RECIPE-005: Edit Recipe (Owner Authorization)

**Objective**: Verify recipe owners can successfully update their recipes

**Preconditions**: 
- User logged in as `gordon@ramsay.com`
- Gordon owns at least one recipe
- On recipe details page for Gordon's recipe

**Test Steps**:
1. Navigate to one of Gordon's recipes
2. Verify "Edit Recipe" button is visible
3. Click "Edit Recipe"
4. Verify navigation to `#/edit-recipe/:id`
5. Verify form is pre-populated with current recipe data:
   - Title field contains current title
   - Description contains current description
   - Servings shows current value
   - Ingredients formatted as `name | quantity | unit` (one per line)
   - Instructions listed one per line
6. Modify recipe:
   - Change title to: `[Original Title] - EDITED`
   - Change servings from `4` to `6`
   - Add new ingredient: `Garnish | 1 | handful`
7. Click "Update Recipe"
8. Wait for submission
9. Navigate back to recipe details

**Expected Results**:
- ✅ Edit form pre-populates correctly
- ✅ Button text changes to "Updating..." during submission
- ✅ Success message or redirect on completion
- ✅ Recipe updated in `recipes.json`:
  - Title shows new value with " - EDITED"
  - Servings changed to `6`
  - New ingredient added to array
  - `updatedAt` timestamp updated to current time
  - `createdAt` remains unchanged
  - `ownerId` remains unchanged
- ✅ Changes visible immediately on recipe details page
- ✅ Other users see updated recipe

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

---

## TC-RECIPE-006: Edit Recipe (Authorization Failure)

**Objective**: Verify users cannot edit recipes they don't own

**Preconditions**: 
- Two users exist: Gordon (gordon@ramsay.com) and QA Test User (qa.test.user@example.com)
- Gordon owns test recipe with ID `gordon-recipe-id`
- Logged in as QA Test User

**Test Steps**:
1. Get Gordon's recipe ID from `recipes.json`
2. Manually navigate to `http://localhost:5500/#/edit-recipe/gordon-recipe-id`
3. Observe if form loads
4. If form loads, attempt to modify and submit
5. **Alternative API Test**: Open browser console, run:
   ```javascript
   const token = localStorage.getItem('culinairy_token');
   fetch('http://localhost:3000/api/recipes/gordon-recipe-id', {
     method: 'PUT',
     headers: {
       'Content-Type': 'application/json',
       'X-Authorization': token
     },
     body: JSON.stringify({title: 'HACKED TITLE'})
   }).then(r => r.json()).then(console.log);
   ```

**Expected Results**:
- ❌ Backend returns HTTP 403 Forbidden
- ❌ Error message: "You are not authorized to edit this recipe" or similar
- ❌ No changes saved to `recipes.json`
- ❌ Recipe title remains unchanged
- ✅ Authorization check happens BEFORE any data modification
- ✅ Ownership validated against `recipe.ownerId` vs authenticated `userId`

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Security Validation**:
This test verifies [server/routes/recipes.js](../../server/routes/recipes.js) authorization logic at line ~148:
```javascript
if (recipe.ownerId !== userId) {
  return res.status(403).json({error: 'You are not authorized...'});
}
```

---

## TC-RECIPE-007: Delete Recipe (Owner)

**Objective**: Verify recipe owners can delete their recipes

**Preconditions**: 
- User logged in as `gordon@ramsay.com`
- Test recipe created (from TC-RECIPE-003) exists
- On recipe details page for test recipe

**Test Steps**:
1. Navigate to test recipe: "QA Test Recipe - Chocolate Chip Cookies"
2. Verify "Delete Recipe" button is visible (styled as red danger button)
3. Note recipe ID from URL
4. Click "Delete Recipe"
5. **Check for confirmation**: If browser confirm() dialog appears, click OK
6. Wait for deletion to complete
7. Verify redirect
8. Open `server/data/recipes.json` and search for deleted recipe ID
9. Attempt to navigate directly to `#/recipes/deleted-recipe-id`

**Expected Results**:
- ✅ Delete button visible only to owner
- ✅ Confirmation dialog appears (good UX, may not be implemented)
- ✅ Recipe removed from `recipes.json` array
- ✅ User redirected to `#/my-recipes` or `#/recipes`
- ✅ Recipe no longer appears in browse view
- ✅ Recipe no longer appears in "My Recipes"
- ✅ Direct URL access returns 404 or error message
- ✅ Other users' recipes unaffected

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**⚠️ UX Concern**: 
If no confirmation dialog exists, accidental clicks could delete recipes permanently (no undo functionality)

---

## TC-RECIPE-008: Delete Recipe (Authorization Failure)

**Objective**: Verify users cannot delete recipes owned by others

**Preconditions**: 
- Two users: Gordon and QA Test User
- Logged in as QA Test User
- Gordon owns a recipe

**Test Steps**:
1. Get Gordon's recipe ID
2. Open browser console, execute:
   ```javascript
   const token = localStorage.getItem('culinairy_token');
   fetch('http://localhost:3000/api/recipes/gordon-recipe-id', {
     method: 'DELETE',
     headers: {
       'X-Authorization': token
     }
   }).then(r => r.json()).then(console.log);
   ```
3. Check response
4. Verify recipe still exists in `recipes.json`

**Expected Results**:
- ❌ Backend returns HTTP 403 Forbidden
- ❌ Error: "You are not authorized to delete this recipe"
- ❌ Recipe NOT removed from `recipes.json`
- ❌ Recipe remains accessible to all users
- ✅ Authorization check prevents deletion

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

---

## TC-RECIPE-009: My Recipes View (Ownership Filter)

**Objective**: Verify "My Recipes" only displays recipes owned by authenticated user

**Preconditions**: 
- Gordon has 2+ recipes
- QA Test User has 1+ recipe
- Logged in as Gordon

**Test Steps**:
1. Navigate to `#/my-recipes` via navbar link
2. Wait for recipes to load
3. Count displayed recipes
4. Verify each recipe card shows Edit/Delete buttons
5. Check if any non-Gordon recipes appear
6. Logout and login as QA Test User
7. Navigate to `#/my-recipes` again
8. Verify only QA Test User's recipes display

**Expected Results**:
- ✅ Only recipes where `ownerId === Gordon's userId` display for Gordon
- ✅ Edit and Delete buttons visible on ALL cards (user owns all)
- ✅ Recipe count matches number of Gordon's recipes in `recipes.json`
- ✅ When switched to QA Test User, only their recipes show
- ✅ Empty state message if user has no recipes (e.g., "You haven't created any recipes yet")

**Actual Results**: 
- Gordon's recipes count: ___
- QA Test User's recipes count: ___
- Edit/Delete buttons visible: ___

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Backend Endpoint**: `/api/recipes/my-recipes` (GET, protected)  
**Filtering Logic**: Should query recipes.json and filter by `ownerId`

---

## Test Summary

**Total Test Cases**: 9  
**Estimated Time**: 6-8 hours  
**Priority**: P1 (Core functionality)

**Dependencies**: 
- Backend: [server/routes/recipes.js](../../server/routes/recipes.js)
- Frontend Views: recipesView, recipeDetailsView, createRecipeView, editRecipeView, myRecipesView
- Auth: Must have working authentication (TC-AUTH-* must pass first)

**Critical Findings Expected**:
- ⚠️ No confirmation dialog on delete (UX issue)
- ⚠️ No undo functionality for accidental deletions
- ⚠️ Possible missing validation on servings (accept 0 or negative)
- ⚠️ No max length validation on text fields

**Related Test Suites**: 
- [INGREDIENT_SCALER_TEST_CASES.md](INGREDIENT_SCALER_TEST_CASES.md) - Scaler component testing
- [SECURITY_TEST_CASES.md](SECURITY_TEST_CASES.md) - Authorization security validation
