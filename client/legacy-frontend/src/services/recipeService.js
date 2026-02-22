import { seedRecipes } from './mockData.js';

// Mock recipe service.
// In the real app, this would call the backend, e.g. GET /recipes.

export const recipeService = {
  getSeedRecipes() {
    // Return a fresh copy so callers can mutate safely.
    return seedRecipes.map((r) => ({
      ...r,
      ingredients: r.ingredients.map((i) => ({ ...i })),
      instructions: [...r.instructions],
    }));
  },
};
