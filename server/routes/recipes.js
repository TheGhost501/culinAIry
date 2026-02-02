import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from '../utils/fileHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

/**
 * GET /
 * Get all recipes (public)
 */
router.get('/', async (req, res) => {
  try {
    const recipeData = await readJSON('./data/recipes.json');
    const recipes = recipeData.recipes || [];

    return res.status(200).json({ data: recipes });
  } catch (error) {
    console.error('Get all recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

/**
 * GET /my-recipes
 * Get recipes owned by authenticated user (protected)
 */
router.get('/my-recipes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const recipeData = await readJSON('./data/recipes.json');
    const recipes = recipeData.recipes || [];

    // Filter recipes by owner
    const userRecipes = recipes.filter(r => r.ownerId === userId);

    return res.status(200).json({ data: userRecipes });
  } catch (error) {
    console.error('Get my recipes error:', error);
    res.status(500).json({ error: 'Failed to fetch your recipes' });
  }
});

/**
 * GET /:id
 * Get single recipe by id (public)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recipeData = await readJSON('./data/recipes.json');
    const recipes = recipeData.recipes || [];

    // Find recipe by id
    const recipe = recipes.find(r => r.id === id);

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    return res.status(200).json({ data: recipe });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

/**
 * POST /
 * Create new recipe (protected)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, servings, ingredients, instructions, imageUrl, cookTime, prepTime } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!title || !description || !ingredients || !instructions) {
      return res.status(400).json({
        error: 'Title, description, ingredients, and instructions are required'
      });
    }

    // Validate ingredients is an array
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Ingredients must be a non-empty array' });
    }

    // Validate instructions is an array
    if (!Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({ error: 'Instructions must be a non-empty array' });
    }

    // Create new recipe
    const newRecipe = {
      id: uuidv4(),
      title,
      description,
      servings: servings || 1,
      ingredients,
      instructions,
      imageUrl: imageUrl || '',
      cookTime: cookTime || 0,
      prepTime: prepTime || 0,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Read current recipes
    const recipeData = await readJSON('./data/recipes.json');
    const recipes = recipeData.recipes || [];

    // Add new recipe
    recipes.push(newRecipe);

    // Save to storage
    await writeJSON('./data/recipes.json', { recipes });

    return res.status(201).json({ data: newRecipe });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

/**
 * PUT /:id
 * Update recipe (protected - owner only)
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, servings, ingredients, instructions, imageUrl, cookTime, prepTime } = req.body;

    // Read recipes
    const recipeData = await readJSON('./data/recipes.json');
    const recipes = recipeData.recipes || [];

    // Find recipe by id
    const recipeIndex = recipes.findIndex(r => r.id === id);

    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipes[recipeIndex];

    // Check ownership
    if (recipe.ownerId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to update this recipe' });
    }

    // Update recipe fields
    if (title !== undefined) recipe.title = title;
    if (description !== undefined) recipe.description = description;
    if (servings !== undefined) recipe.servings = servings;
    if (ingredients !== undefined) recipe.ingredients = ingredients;
    if (instructions !== undefined) recipe.instructions = instructions;
    if (imageUrl !== undefined) recipe.imageUrl = imageUrl;
    if (cookTime !== undefined) recipe.cookTime = cookTime;
    if (prepTime !== undefined) recipe.prepTime = prepTime;

    // Update timestamp
    recipe.updatedAt = new Date().toISOString();

    // Save to storage
    await writeJSON('./data/recipes.json', { recipes });

    return res.status(200).json({ data: recipe });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

/**
 * DELETE /:id
 * Delete recipe (protected - owner only)
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Read recipes
    const recipeData = await readJSON('./data/recipes.json');
    const recipes = recipeData.recipes || [];

    // Find recipe by id
    const recipeIndex = recipes.findIndex(r => r.id === id);

    if (recipeIndex === -1) {
      return res.status(404).json({ error: 'Recipe not found' });
    }

    const recipe = recipes[recipeIndex];

    // Check ownership
    if (recipe.ownerId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this recipe' });
    }

    // Remove recipe from array
    recipes.splice(recipeIndex, 1);

    // Save to storage
    await writeJSON('./data/recipes.json', { recipes });

    return res.status(200).json({ data: { message: 'Recipe deleted successfully', recipeId: id } });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

export default router;
