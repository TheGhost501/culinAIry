/**
 * Ingredient Scaling Utility
 * Handles mathematical transformations for scaling recipe ingredients
 */

/**
 * Scales a single ingredient quantity based on serving size change
 * @param {number} originalQuantity - Original ingredient amount
 * @param {number} originalServings - Original number of servings
 * @param {number} newServings - Desired number of servings
 * @returns {number} Scaled quantity
 */
export function scaleQuantity(originalQuantity, originalServings, newServings) {
  if (originalServings <= 0 || newServings <= 0) {
    throw new Error('Servings must be positive numbers');
  }
  
  if (originalQuantity < 0) {
    throw new Error('Quantity cannot be negative');
  }
  
  const scalingFactor = newServings / originalServings;
  return originalQuantity * scalingFactor;
}

/**
 * Formats a scaled quantity with intelligent rounding
 * @param {number} quantity - The quantity to format
 * @returns {string} Formatted quantity string
 */
export function formatQuantity(quantity) {
  if (quantity === 0) return '0';
  
  // Handle very small quantities
  if (quantity < 0.0625) {
    return 'pinch';
  }
  
  // Convert to common fractions for better readability
  const fractions = [
    { decimal: 0.125, display: '1/8' },
    { decimal: 0.25, display: '1/4' },
    { decimal: 0.333, display: '1/3' },
    { decimal: 0.5, display: '1/2' },
    { decimal: 0.667, display: '2/3' },
    { decimal: 0.75, display: '3/4' }
  ];
  
  const whole = Math.floor(quantity);
  const decimal = quantity - whole;
  
  // Check if decimal part matches a common fraction (with tolerance)
  const tolerance = 0.05;
  const matchingFraction = fractions.find(
    f => Math.abs(decimal - f.decimal) < tolerance
  );
  
  if (matchingFraction) {
    if (whole === 0) {
      return matchingFraction.display;
    }
    return `${whole} ${matchingFraction.display}`;
  }
  
  // For non-fraction decimals
  if (decimal === 0) {
    return whole.toString();
  }
  
  // Round to 2 decimal places for readability
  if (quantity < 10) {
    return quantity.toFixed(2).replace(/\.?0+$/, '');
  }
  
  // Round to 1 decimal for larger quantities
  if (quantity < 100) {
    return quantity.toFixed(1).replace(/\.?0+$/, '');
  }
  
  // Round to whole numbers for very large quantities
  return Math.round(quantity).toString();
}

/**
 * Handles unit conversion edge cases
 * @param {number} quantity - The scaled quantity
 * @param {string} unit - The current unit
 * @returns {Object} Object with adjusted quantity and unit
 */
export function adjustUnits(quantity, unit) {
  const conversions = {
    // Volume conversions
    'tsp': { threshold: 3, newUnit: 'tbsp', factor: 1/3 },
    'tbsp': { threshold: 16, newUnit: 'cup', factor: 1/16 },
    'cup': { threshold: 4, newUnit: 'quart', factor: 1/4 },
    'quart': { threshold: 4, newUnit: 'gallon', factor: 1/4 },
    
    // Metric volume
    'ml': { threshold: 1000, newUnit: 'liter', factor: 1/1000 },
    'liter': { threshold: 10, newUnit: 'liter', factor: 1 },
    
    // Weight conversions
    'oz': { threshold: 16, newUnit: 'lb', factor: 1/16 },
    'g': { threshold: 1000, newUnit: 'kg', factor: 1/1000 }
  };
  
  const unitLower = unit.toLowerCase();
  const conversion = conversions[unitLower];
  
  if (conversion && quantity >= conversion.threshold) {
    const newQuantity = quantity * conversion.factor;
    return {
      quantity: newQuantity,
      unit: conversion.newUnit
    };
  }
  
  return { quantity, unit };
}

/**
 * Scales an entire ingredient object
 * @param {Object} ingredient - Original ingredient {name, quantity, unit}
 * @param {number} originalServings - Original servings
 * @param {number} newServings - New servings
 * @returns {Object} Scaled ingredient with formatted values
 */
export function scaleIngredient(ingredient, originalServings, newServings) {
  const scaledQuantity = scaleQuantity(
    ingredient.quantity,
    originalServings,
    newServings
  );
  
  // Adjust units if necessary
  const { quantity: adjustedQuantity, unit: adjustedUnit } = adjustUnits(
    scaledQuantity,
    ingredient.unit
  );
  
  return {
    name: ingredient.name,
    quantity: adjustedQuantity,
    unit: adjustedUnit,
    formattedQuantity: formatQuantity(adjustedQuantity),
    originalQuantity: ingredient.quantity,
    originalUnit: ingredient.unit
  };
}

/**
 * Scales an array of ingredients
 * @param {Array} ingredients - Array of ingredient objects
 * @param {number} originalServings - Original servings
 * @param {number} newServings - New servings
 * @returns {Array} Array of scaled ingredients
 */
export function scaleIngredients(ingredients, originalServings, newServings) {
  if (!Array.isArray(ingredients)) {
    throw new Error('Ingredients must be an array');
  }
  
  return ingredients.map(ingredient => 
    scaleIngredient(ingredient, originalServings, newServings)
  );
}

/**
 * Calculates serving suggestions based on original servings
 * @param {number} originalServings - Original servings
 * @returns {Array<number>} Array of suggested serving sizes
 */
export function getServingSuggestions(originalServings) {
  const suggestions = new Set();
  
  // Always include original
  suggestions.add(originalServings);
  
  // Add half and double
  suggestions.add(Math.max(1, Math.floor(originalServings / 2)));
  suggestions.add(originalServings * 2);
  
  // Add common serving sizes
  [1, 2, 4, 6, 8, 10, 12].forEach(size => suggestions.add(size));
  
  // Convert to sorted array
  return Array.from(suggestions).sort((a, b) => a - b);
}

export default {
  scaleQuantity,
  formatQuantity,
  adjustUnits,
  scaleIngredient,
  scaleIngredients,
  getServingSuggestions
};
