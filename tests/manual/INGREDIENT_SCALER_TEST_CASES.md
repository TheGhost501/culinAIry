# Ingredient Scaler Test Cases

**Module**: Ingredient Scaler Component  
**Priority**: P2 (Critical Feature)  
**Test Files**: 
- Component: [client/js/components/ingredientScaler.js](../../client/js/components/ingredientScaler.js)
- Logic: [client/js/utils/ingredientScaler.js](../../client/js/utils/ingredientScaler.js)
- Integration: [client/js/views/recipeDetailsView.js](../../client/js/views/recipeDetailsView.js)

---

## TC-SCALER-001: Manual Serving Adjustment

**Objective**: Verify manual input in servings field correctly scales ingredients

**Preconditions**: 
- Recipe with servings = 4 and ingredients:
  - `Flour | 2 | cups`
  - `Sugar | 1 | cup`
  - `Salt | 0.5 | tsp`
- On recipe details page with scaler visible

**Test Steps**:
1. Locate servings input field (should show `4`)
2. Click in input field to focus
3. Clear current value
4. Type `8` (double the servings)
5. Press Enter or click outside field to trigger change event
6. Observe ingredient quantities update in real-time

**Expected Results**:
- ✅ Flour displays: `4 cups` with annotation `(was 2 cups)`
- ✅ Sugar displays: `2 cups` with annotation `(was 1 cup)`
- ✅ Salt displays: `1 tsp` with annotation `(was 0.5 tsp)`
- ✅ All ingredients scale proportionally (quantity × 2)
- ✅ Units remain unchanged (cups → cups, tsp → tsp)
- ✅ "was X" annotation appears for all ingredients
- ✅ Reset button becomes visible (was hidden when at original servings)

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Formula Verification**:
```javascript
newQuantity = originalQuantity × (newServings / originalServings)
Flour: 2 × (8 / 4) = 4 ✓
Sugar: 1 × (8 / 4) = 2 ✓
Salt: 0.5 × (8 / 4) = 1 ✓
```

**Notes**: 

---

## TC-SCALER-002: Plus/Minus Button Controls

**Objective**: Verify +/- buttons increment/decrement servings correctly

**Preconditions**: 
- Recipe with servings = 4
- On recipe details page

**Test Steps**:
1. Locate +/- buttons next to servings input
2. Click "+" button once → Servings should become 5
3. Click "+" button 4 more times → Servings should become 9
4. Observe ingredient scaling after each click
5. Click "-" button 3 times → Servings should become 6
6. Continue clicking "-" until servings = 1
7. Attempt to click "-" when at servings = 1
8. Test upper boundary: Increase servings to 100
9. Attempt to click "+" when at servings = 100

**Expected Results**:
- ✅ Each "+" click increments by 1
- ✅ Each "-" click decrements by 1
- ✅ Ingredients re-scale after each button click
- ✅ "-" button **disabled** when servings = 1 (minimum)
- ✅ "+" button **disabled** when servings = 100 (maximum)
- ✅ Disabled buttons visually indicate state (grayed out or reduced opacity)
- ✅ Disabled buttons don't respond to clicks
- ✅ Buttons remain responsive and don't lag on repeated clicks

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Boundary Values to Test**:
- Minimum: `1` serving (cannot go below)
- Maximum: `100` servings (cannot go above)
- Current implementation: Check [ingredientScaler.js](../../client/js/components/ingredientScaler.js) for hardcoded min/max

---

## TC-SCALER-003: Quick Select Buttons

**Objective**: Verify quick select buttons instantly set servings to preset values

**Preconditions**: 
- Recipe with any serving size
- On recipe details page

**Test Steps**:
1. Locate quick select buttons: 1, 2, 4, 6, 8, 10, 12
2. Current servings = 4
3. Click "2 servings" button
4. Verify servings input updates to `2`
5. Verify ingredients scale to 50% (2/4 = 0.5×)
6. Click "12 servings" button
7. Verify servings input updates to `12`
8. Verify ingredients scale to 300% (12/4 = 3×)
9. Test clicking current serving size button (e.g., if at 4, click "4")

**Expected Results**:
- ✅ Clicking any quick select button sets servings to that value instantly
- ✅ Ingredients recalculate and update immediately
- ✅ Servings input field reflects new value
- ✅ Buttons remain clickable (not disabled)
- ✅ Clicking current serving size still works (redundant but allowed)
- ✅ Reset button appears/disappears appropriately

**Actual Results**: 
- 2 servings: [ingredients scaled to ___]
- 4 servings: [ingredients scaled to ___]
- 6 servings: [ingredients scaled to ___]
- 8 servings: [ingredients scaled to ___]
- 10 servings: [ingredients scaled to ___]
- 12 servings: [ingredients scaled to ___]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

---

## TC-SCALER-004: Reset Functionality

**Objective**: Verify reset button returns servings and ingredients to original values

**Preconditions**: 
- Recipe with original servings = 4
- Currently scaled to different value (e.g., 8 servings)

**Test Steps**:
1. Scale recipe to 10 servings using quick select
2. Verify reset button is visible
3. Note current ingredient quantities (scaled)
4. Click "Reset" button
5. Observe servings field and ingredients

**Expected Results**:
- ✅ Servings input returns to original value: `4`
- ✅ All ingredients return to original quantities
- ✅ "was X" annotations disappear (no longer needed)
- ✅ Reset button becomes hidden (already at original)
- ✅ Quick visual feedback (no delay)

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Reset Button Visibility Logic**:
- Hidden when `currentServings === originalServings`
- Visible when `currentServings !== originalServings`

---

## TC-SCALER-005: Decimal to Fraction Conversion

**Objective**: Verify decimal quantities are converted to readable fractions

**Preconditions**: 
- Recipe with fractional ingredients:
  - `Butter | 0.5 | cups` (should display as 1/2)
  - `Flour | 0.25 | cups` (should display as 1/4)
  - `Sugar | 0.333 | cups` (should display as 1/3)
  - `Salt | 0.75 | tsp` (should display as 3/4)
  - `Milk | 0.667 | cups` (should display as 2/3)

**Test Steps**:
1. View recipe at original servings
2. Check how fractional quantities display
3. Scale to 2× servings
4. Check if fractions remain readable or convert to whole numbers
5. Scale to 0.5× servings (if possible)
6. Check for smaller fractions (e.g., 1/8, 1/16)

**Expected Results**:
- ✅ `0.5` displays as `1/2`
- ✅ `0.25` displays as `1/4`
- ✅ `0.333` or `0.33` displays as `1/3`
- ✅ `0.75` displays as `3/4`
- ✅ `0.667` or `0.67` displays as `2/3`
- ✅ `1.5` displays as `1 1/2` (mixed number)
- ✅ `2.25` displays as `2 1/4`
- ✅ Edge case: `0.125` displays as `1/8`
- ✅ Non-fraction decimals like `0.37` display as decimal (no forced fraction)

**Actual Results**: [To be filled during test execution]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Fraction Conversion Logic**: 
Check [client/js/utils/ingredientScaler.js](../../client/js/utils/ingredientScaler.js) `formatQuantity()` function for fraction mapping

**Mathematical Verification**:
Test calculated values:
- 0.5 × 2 = 1 → Should display as `1` (whole number, not `1/1`)
- 0.25 × 4 = 1 → Should display as `1`
- 0.333 × 3 ≈ 1 → Should display as `1` (with rounding tolerance)

---

## TC-SCALER-006: Unit Conversion Thresholds

**Objective**: Verify automatic unit conversions when quantities exceed thresholds

**Preconditions**: 
- Recipe with ingredients at conversion boundaries

**Test Steps**:

**Scenario 1: teaspoon → tablespoon**
- Original: `Salt | 6 | tsp`
- Scale to any multiplier
- Check if converts to tablespoons when ≥ 3 tsp

**Scenario 2: tablespoon → cup**
- Original: `Oil | 8 | tbsp`
- Scale to 2× → Should become `1 cup` (16 tbsp = 1 cup)

**Scenario 3: grams → kilograms**
- Original: `Flour | 1000 | g`
- Should display as `1 kg`
- Scale to 2× → Should display as `2 kg`

**Scenario 4: ounces → pounds**
- Original: `Beef | 16 | oz`
- Should display as `1 lb` (16 oz = 1 lb)
- Scale to 2× → Should display as `2 lb`

**Expected Results**:
- ✅ **tsp → tbsp**: When quantity ≥ 3 tsp, converts to tbsp (3 tsp = 1 tbsp)
- ✅ **tbsp → cup**: When quantity ≥ 16 tbsp, converts to cups (16 tbsp = 1 cup)
- ✅ **g → kg**: When quantity ≥ 1000g, converts to kg
- ✅ **oz → lb**: When quantity ≥ 16 oz, converts to lb
- ✅ Conversions maintain accuracy (no rounding errors)
- ✅ "was X tsp" annotation shows original unit
- ✅ Fractional conversions: `4.5 tsp` → `1 1/2 tbsp`

**Actual Results**: 
- tsp → tbsp: [result at 6 tsp, 9 tsp, 12 tsp]
- tbsp → cup: [result at 16 tbsp, 32 tbsp]
- g → kg: [result at 1000g, 2000g]
- oz → lb: [result at 16 oz, 32 oz]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Unit Conversion Reference** ([ingredientScaler.js](../../client/js/utils/ingredientScaler.js)):
```javascript
adjustUnits() {
  // tsp → tbsp (3 tsp = 1 tbsp)
  // tbsp → cup (16 tbsp = 1 cup)
  // g → kg (1000 g = 1 kg)
  // oz → lb (16 oz = 1 lb)
}
```

---

## TC-SCALER-007: Edge Cases and Boundary Conditions

**Objective**: Verify scaler handles unusual inputs gracefully

**Preconditions**: 
- Various test recipes with edge case ingredients

**Test Scenarios**:

**1. Zero Quantity Ingredient**
- Original: `Optional topping | 0 | tsp`
- Scale to 10× → Should remain `0 tsp`

**2. Very Small Quantity**
- Original: `Saffron | 0.0625 | tsp` (1/16 tsp)
- Scale to 2× → Should display `0.125 tsp` or `1/8 tsp`

**3. Very Large Quantity**
- Original: `Water | 100 | cups`
- Scale to 10× → Should display `1000 cups` (or convert to gallons if implemented)
- Check for display overflow or number formatting issues

**4. No Unit Specified**
- Original: `Eggs | 3 | large`
- Scale to 2× → Should display `6 large`
- Unit "large" preserved (not converted)

**5. Non-standard Units**
- Original: `Pinch | 1 | pinch`
- Original: `Dash | 2 | dash`
- Scale to 4× → Should multiply normally without conversion

**6. Fractional Servings**
- Scale to `0.5` servings (half recipe)
- Check if allowed (input validation)

**7. Decimal Servings**
- Scale to `3.5` servings
- Verify ingredients calculate correctly

**8. Extremely Large Servings**
- Scale to `99` or `100` servings
- Check for integer overflow or display issues

**Expected Results**:
1. ✅ Zero quantity remains zero (0 × any multiplier = 0)
2. ✅ Very small decimals display with precision or as fractions
3. ✅ Large numbers format with commas or readable notation
4. ✅ Non-standard units preserved without conversion
5. ✅ Custom units like "pinch", "dash", "handful" scale numerically
6. ✅ Fractional servings allowed (or input validation prevents it)
7. ✅ Decimal servings calculate accurately
8. ✅ Maximum servings capped at 100 (or reasonable limit)

**Actual Results**: 
1. Zero quantity: [result]
2. Very small: [result]
3. Very large: [result]
4. No unit: [result]
5. Non-standard units: [result]
6. Fractional servings: [result]
7. Decimal servings: [result]
8. Max servings: [result]

**Status**: ⬜ Not Run | ✅ Pass | ❌ Fail | ⚠️ Blocked

**Notes**: 

**Rounding Precision**:
Check if scaler uses `toFixed(2)` or similar for decimal display

---

## Test Summary

**Total Test Cases**: 7  
**Estimated Time**: 4-5 hours  
**Priority**: P2 (Critical feature, but not blocking core CRUD)

**Dependencies**: 
- Recipe CRUD (must have recipes to test scaler)
- Component: [client/js/components/ingredientScaler.js](../../client/js/components/ingredientScaler.js)
- Logic: [client/js/utils/ingredientScaler.js](../../client/js/utils/ingredientScaler.js)

**Mathematical Validation**:
All scaling calculations use formula:
```javascript
scaledQuantity = originalQuantity × (newServings / originalServings)
```

**Critical Findings Expected**:
- ⚠️ Possible rounding errors with repeating decimals (0.333... → 0.33)
- ⚠️ Unit conversion edge cases (what happens at 2.5 tsp? Still tsp or convert?)
- ⚠️ Display overflow with very large quantities
- ✅ Fraction conversion makes recipes more readable (positive finding)

**Related Test Suites**: 
- [RECIPE_TEST_CASES.md](RECIPE_TEST_CASES.md) - Recipe details view integration
- [UI_UX_TEST_CASES.md](UI_UX_TEST_CASES.md) - Responsive design for scaler buttons
