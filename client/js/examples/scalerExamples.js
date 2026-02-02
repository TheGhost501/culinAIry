/**
 * Ingredient Scaler - Usage Examples & Tests
 * Demonstrates the capabilities of the ingredient scaling system
 */

import {
  scaleQuantity,
  formatQuantity,
  adjustUnits,
  scaleIngredient,
  scaleIngredients,
  getServingSuggestions
} from './utils/ingredientScaler.js';

/* ==========================================
   EXAMPLE 1: Basic Quantity Scaling
   ========================================== */
console.log('=== Example 1: Basic Quantity Scaling ===');

// Original: 2 cups for 4 servings
// Wanted: Recipe for 8 servings
const scaled = scaleQuantity(2, 4, 8);
console.log(`Original: 2 cups for 4 servings`);
console.log(`Scaled to 8 servings: ${scaled} cups`); // 4 cups
console.log('');

/* ==========================================
   EXAMPLE 2: Formatting with Fractions
   ========================================== */
console.log('=== Example 2: Smart Formatting ===');

const quantities = [0.05, 0.125, 0.25, 0.5, 0.75, 1.333, 2.5, 15.75, 128];
quantities.forEach(qty => {
  console.log(`${qty} → "${formatQuantity(qty)}"`);
});
// Output examples:
// 0.05 → "pinch"
// 0.125 → "1/8"
// 0.25 → "1/4"
// 0.5 → "1/2"
// 0.75 → "3/4"
// 1.333 → "1 1/3"
// 2.5 → "2.5"
// 15.75 → "15.8"
// 128 → "128"
console.log('');

/* ==========================================
   EXAMPLE 3: Unit Conversion
   ========================================== */
console.log('=== Example 3: Automatic Unit Conversion ===');

// tsp → tbsp
console.log(adjustUnits(4, 'tsp')); // { quantity: 1.33, unit: 'tbsp' }

// tbsp → cup
console.log(adjustUnits(20, 'tbsp')); // { quantity: 1.25, unit: 'cup' }

// oz → lb
console.log(adjustUnits(24, 'oz')); // { quantity: 1.5, unit: 'lb' }

// ml → liter
console.log(adjustUnits(1500, 'ml')); // { quantity: 1.5, unit: 'liter' }
console.log('');

/* ==========================================
   EXAMPLE 4: Scale a Single Ingredient
   ========================================== */
console.log('=== Example 4: Single Ingredient Scaling ===');

const flour = {
  name: 'all-purpose flour',
  quantity: 2,
  unit: 'cup'
};

// Scale from 4 servings to 6 servings
const scaledFlour = scaleIngredient(flour, 4, 6);
console.log('Original (4 servings):', flour);
console.log('Scaled (6 servings):', scaledFlour);
// Output: { name: 'all-purpose flour', quantity: 3, unit: 'cup', formattedQuantity: '3', ... }
console.log('');

/* ==========================================
   EXAMPLE 5: Scale Multiple Ingredients
   ========================================== */
console.log('=== Example 5: Full Recipe Scaling ===');

const originalRecipe = {
  servings: 4,
  ingredients: [
    { name: 'flour', quantity: 2, unit: 'cup' },
    { name: 'sugar', quantity: 0.75, unit: 'cup' },
    { name: 'butter', quantity: 8, unit: 'tbsp' },
    { name: 'eggs', quantity: 2, unit: '' },
    { name: 'vanilla extract', quantity: 1, unit: 'tsp' },
    { name: 'milk', quantity: 16, unit: 'oz' }
  ]
};

const scaledRecipe = scaleIngredients(originalRecipe.ingredients, 4, 8);
console.log('Original recipe (4 servings):');
originalRecipe.ingredients.forEach(i => {
  console.log(`  ${i.quantity} ${i.unit} ${i.name}`);
});

console.log('\nScaled recipe (8 servings):');
scaledRecipe.forEach(i => {
  console.log(`  ${i.formattedQuantity} ${i.unit} ${i.name} (was ${i.originalQuantity} ${i.originalUnit})`);
});
console.log('');

/* ==========================================
   EXAMPLE 6: Serving Suggestions
   ========================================== */
console.log('=== Example 6: Serving Suggestions ===');

console.log('For a 4-serving recipe:', getServingSuggestions(4));
// [1, 2, 4, 6, 8, 10, 12]

console.log('For a 6-serving recipe:', getServingSuggestions(6));
// [1, 2, 3, 4, 6, 8, 10, 12]
console.log('');

/* ==========================================
   EXAMPLE 7: Edge Cases
   ========================================== */
console.log('=== Example 7: Edge Cases ===');

// Very small quantities
const pinch = { name: 'salt', quantity: 0.03, unit: 'tsp' };
console.log('Tiny amount:', scaleIngredient(pinch, 4, 4));
// Shows as "pinch"

// Fractional servings
const halfServing = scaleQuantity(1, 4, 2);
console.log('Half servings: 1 cup → ' + formatQuantity(halfServing) + ' cup'); // "1/2 cup"

// Large scaling
const bulkBaking = scaleIngredient({ name: 'flour', quantity: 2, unit: 'cup' }, 4, 50);
console.log('Bulk scaling (4→50 servings):', bulkBaking);

console.log('');

/* ==========================================
   EXAMPLE 8: Error Handling
   ========================================== */
console.log('=== Example 8: Error Handling ===');

try {
  scaleQuantity(2, 0, 4); // Invalid: 0 servings
} catch (error) {
  console.log('✓ Caught error:', error.message);
}

try {
  scaleQuantity(-5, 4, 8); // Invalid: negative quantity
} catch (error) {
  console.log('✓ Caught error:', error.message);
}

try {
  scaleIngredients('not an array', 4, 8); // Invalid: not an array
} catch (error) {
  console.log('✓ Caught error:', error.message);
}

console.log('');

/* ==========================================
   EXAMPLE 9: Real-World Recipe
   ========================================== */
console.log('=== Example 9: Real-World Recipe - Chocolate Chip Cookies ===');

const cookieRecipe = {
  title: 'Classic Chocolate Chip Cookies',
  servings: 24,
  ingredients: [
    { name: 'all-purpose flour', quantity: 2.25, unit: 'cup' },
    { name: 'baking soda', quantity: 1, unit: 'tsp' },
    { name: 'salt', quantity: 1, unit: 'tsp' },
    { name: 'butter (softened)', quantity: 1, unit: 'cup' },
    { name: 'white sugar', quantity: 0.75, unit: 'cup' },
    { name: 'brown sugar', quantity: 0.75, unit: 'cup' },
    { name: 'vanilla extract', quantity: 2, unit: 'tsp' },
    { name: 'eggs', quantity: 2, unit: '' },
    { name: 'chocolate chips', quantity: 2, unit: 'cup' }
  ]
};

// Scale down to 12 cookies (half the recipe)
const halfBatch = scaleIngredients(cookieRecipe.ingredients, 24, 12);
console.log('Half batch (12 cookies):');
halfBatch.forEach(i => {
  console.log(`  ${i.formattedQuantity} ${i.unit} ${i.name}`);
});

console.log('');

// Scale up to 72 cookies (triple the recipe)
const tripleBatch = scaleIngredients(cookieRecipe.ingredients, 24, 72);
console.log('Triple batch (72 cookies):');
tripleBatch.forEach(i => {
  console.log(`  ${i.formattedQuantity} ${i.unit} ${i.name}`);
});

console.log('');

/* ==========================================
   EXAMPLE 10: UI Integration Pattern
   ========================================== */
console.log('=== Example 10: UI Integration Pattern ===');
console.log(`
// In your recipe details view:

import { ingredientScalerComponent, attachScalerListeners } from './components/ingredientScaler.js';

export function recipeDetailsView(recipe) {
  // Render the scaler component
  const html = ingredientScalerComponent(recipe);
  
  // After DOM updates, attach event listeners
  setTimeout(() => {
    attachScalerListeners(recipe, (newServings) => {
      console.log(\`User changed servings to: \${newServings}\`);
      // Optional: track analytics, save preference, etc.
    });
  }, 0);
  
  return html;
}
`);

console.log('All examples completed! ✓');
