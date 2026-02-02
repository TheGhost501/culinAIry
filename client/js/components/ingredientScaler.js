/**
 * Ingredient Scaler Component
 * Interactive UI for adjusting recipe serving sizes
 */

import { scaleIngredients, getServingSuggestions } from '../utils/ingredientScaler.js';

/**
 * Generates the ingredient scaler component HTML
 * @param {Object} recipe - Recipe object with servings and ingredients
 * @param {number} currentServings - Currently selected servings (defaults to original)
 * @returns {string} HTML string for the scaler component
 */
export function ingredientScalerComponent(recipe, currentServings = null) {
  const originalServings = recipe.servings;
  const selectedServings = currentServings || originalServings;
  const suggestions = getServingSuggestions(originalServings);
  
  return `
    <div class="ingredient-scaler" data-recipe-id="${recipe.id}">
      <div class="scaler-header">
        <h3>Ingredients</h3>
        <div class="servings-controls">
          <label for="servings-selector">Servings:</label>
          <div class="servings-input-group">
            <button 
              class="servings-btn servings-decrease" 
              data-action="decrease"
              ${selectedServings <= 1 ? 'disabled' : ''}
            >
              <span>−</span>
            </button>
            
            <input 
              type="number" 
              id="servings-selector" 
              class="servings-input"
              value="${selectedServings}" 
              min="1" 
              max="100"
              data-original="${originalServings}"
            />
            
            <button 
              class="servings-btn servings-increase" 
              data-action="increase"
              ${selectedServings >= 100 ? 'disabled' : ''}
            >
              <span>+</span>
            </button>
          </div>
          
          ${selectedServings !== originalServings ? `
            <button class="reset-servings-btn" data-action="reset">
              Reset to ${originalServings}
            </button>
          ` : ''}
        </div>
      </div>
      
      <div class="servings-suggestions">
        <span class="suggestions-label">Quick select:</span>
        ${suggestions.map(size => `
          <button 
            class="serving-suggestion-btn ${size === selectedServings ? 'active' : ''}"
            data-servings="${size}"
          >
            ${size}
          </button>
        `).join('')}
      </div>
      
      <ul class="ingredients-list" id="scaled-ingredients-list">
        ${renderScaledIngredients(recipe.ingredients, originalServings, selectedServings)}
      </ul>
    </div>
  `;
}

/**
 * Renders the list of scaled ingredients
 * @param {Array} ingredients - Array of ingredient objects
 * @param {number} originalServings - Original servings
 * @param {number} currentServings - Current servings
 * @returns {string} HTML string for ingredients list
 */
function renderScaledIngredients(ingredients, originalServings, currentServings) {
  const scaledIngredients = scaleIngredients(ingredients, originalServings, currentServings);
  
  return scaledIngredients.map(ingredient => `
    <li class="ingredient-item ${currentServings !== originalServings ? 'scaled' : ''}">
      <span class="ingredient-quantity">
        ${ingredient.formattedQuantity} ${ingredient.unit}
      </span>
      <span class="ingredient-name">${ingredient.name}</span>
      ${currentServings !== originalServings ? `
        <span class="original-quantity" title="Original: ${ingredient.originalQuantity} ${ingredient.originalUnit}">
          (was ${ingredient.originalQuantity} ${ingredient.originalUnit})
        </span>
      ` : ''}
    </li>
  `).join('');
}

/**
 * Attaches event listeners to the scaler component
 * @param {Object} recipe - Recipe object
 * @param {Function} onServingsChange - Callback when servings change
 */
export function attachScalerListeners(recipe, onServingsChange) {
  const scalerContainer = document.querySelector('.ingredient-scaler');
  if (!scalerContainer) return;
  
  const servingsInput = scalerContainer.querySelector('#servings-selector');
  const decreaseBtn = scalerContainer.querySelector('[data-action="decrease"]');
  const increaseBtn = scalerContainer.querySelector('[data-action="increase"]');
  const resetBtn = scalerContainer.querySelector('[data-action="reset"]');
  const suggestionBtns = scalerContainer.querySelectorAll('.serving-suggestion-btn');
  
  // Handle manual input
  if (servingsInput) {
    servingsInput.addEventListener('input', (e) => {
      let value = parseInt(e.target.value);
      
      // Validate input
      if (isNaN(value) || value < 1) {
        value = 1;
      } else if (value > 100) {
        value = 100;
      }
      
      updateServings(recipe, value, onServingsChange);
    });
    
    // Prevent non-numeric input
    servingsInput.addEventListener('keypress', (e) => {
      if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
        e.preventDefault();
      }
    });
  }
  
  // Handle decrease button
  if (decreaseBtn) {
    decreaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(servingsInput.value);
      const newValue = Math.max(1, currentValue - 1);
      updateServings(recipe, newValue, onServingsChange);
    });
  }
  
  // Handle increase button
  if (increaseBtn) {
    increaseBtn.addEventListener('click', () => {
      const currentValue = parseInt(servingsInput.value);
      const newValue = Math.min(100, currentValue + 1);
      updateServings(recipe, newValue, onServingsChange);
    });
  }
  
  // Handle reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      updateServings(recipe, recipe.servings, onServingsChange);
    });
  }
  
  // Handle suggestion buttons
  suggestionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const servings = parseInt(btn.dataset.servings);
      updateServings(recipe, servings, onServingsChange);
    });
  });
}

/**
 * Updates the servings and refreshes the UI
 * @param {Object} recipe - Recipe object
 * @param {number} newServings - New servings count
 * @param {Function} callback - Callback function
 */
function updateServings(recipe, newServings, callback) {
  const servingsInput = document.querySelector('#servings-selector');
  const ingredientsList = document.querySelector('#scaled-ingredients-list');
  
  if (!servingsInput || !ingredientsList) return;
  
  // Update input value
  servingsInput.value = newServings;
  
  // Update button states
  updateButtonStates(newServings, recipe.servings);
  
  // Re-render ingredients
  ingredientsList.innerHTML = renderScaledIngredients(
    recipe.ingredients,
    recipe.servings,
    newServings
  );
  
  // Call callback if provided
  if (callback && typeof callback === 'function') {
    callback(newServings);
  }
}

/**
 * Updates the state of increase/decrease buttons
 * @param {number} currentServings - Current servings
 * @param {number} originalServings - Original servings
 */
function updateButtonStates(currentServings, originalServings) {
  const decreaseBtn = document.querySelector('[data-action="decrease"]');
  const increaseBtn = document.querySelector('[data-action="increase"]');
  const resetBtn = document.querySelector('[data-action="reset"]');
  const suggestionBtns = document.querySelectorAll('.serving-suggestion-btn');
  
  // Update decrease button
  if (decreaseBtn) {
    decreaseBtn.disabled = currentServings <= 1;
  }
  
  // Update increase button
  if (increaseBtn) {
    increaseBtn.disabled = currentServings >= 100;
  }
  
  // Show/hide reset button
  if (resetBtn) {
    if (currentServings === originalServings) {
      resetBtn.style.display = 'none';
    } else {
      resetBtn.style.display = 'inline-block';
    }
  }
  
  // Update suggestion button states
  suggestionBtns.forEach(btn => {
    const servings = parseInt(btn.dataset.servings);
    if (servings === currentServings) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

export default ingredientScalerComponent;
