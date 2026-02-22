import { storage } from './storage.js';
import { recipeService } from '../services/recipeService.js';
import { api } from '../api.js';

// Very small app store.
// - Keeps state in one place
// - Notifies subscribers on changes
// - Persists key parts to localStorage
// - Integrates with backend API

function createId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function parseMultilineLines(text) {
  return String(text ?? '')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIngredients(text) {
  // Expected simple format (beginner-friendly):
  // "name | quantity | unit" per line
  // Examples:
  //  "Flour | 250 | g"
  //  "Eggs | 2 |"
  const lines = parseMultilineLines(text);

  return lines.map((line) => {
    const [nameRaw, quantityRaw, unitRaw] = line
      .split('|')
      .map((s) => (s ?? '').trim());

    const name = nameRaw || line;
    const quantity = Number(quantityRaw);
    const unit = unitRaw ?? '';

    return {
      name,
      quantity: Number.isFinite(quantity) ? quantity : 0,
      unit,
    };
  });
}

function validateAuthPayload({ username, password }) {
  if (!username) return 'Username is required.';
  if (!password || password.length < 4) return 'Password must be at least 4 characters.';
  return null;
}

function validateRecipePayload({ title, description, servings }) {
  if (!title) return 'Title is required.';
  if (!description) return 'Description is required.';
  if (!Number.isFinite(servings) || servings <= 0) return 'Servings must be a positive number.';
  return null;
}

const initialAuth = storage.loadAuth() || null;

const initialRecipes = storage.loadRecipes();
const seeded = recipeService.getSeedRecipes();

const initialState = {
  auth: initialAuth,
  ui: {
    error: null,
    notice: null,
  },
  recipes: Array.isArray(initialRecipes) ? initialRecipes : seeded,
};

function createStore() {
  let state = initialState;
  const subscribers = new Set();

  function notify() {
    for (const fn of subscribers) fn(state);
  }

  function setState(updater) {
    state = typeof updater === 'function' ? updater(state) : updater;

    // Persist data we want across refreshes.
    storage.saveRecipes(state.recipes);
    if (state.auth) storage.saveAuth(state.auth);
    else storage.clearAuth();

    notify();
  }

  function getState() {
    return state;
  }

  function subscribe(fn) {
    subscribers.add(fn);
    return () => subscribers.delete(fn);
  }

  const actions = {
    clearMessages() {
      setState((s) => ({
        ...s,
        ui: { error: null, notice: null },
      }));
    },

    setNotice(message) {
      setState((s) => ({
        ...s,
        ui: { ...s.ui, notice: message, error: null },
      }));
    },

    setError(message) {
      setState((s) => ({
        ...s,
        ui: { ...s.ui, error: message, notice: null },
      }));
    },

    login({ email, password }) {
      // Validate inputs
      if (!email || !password) {
        actions.setError('Email and password are required.');
        return;
      }

      // Call API
      api.auth.login(email, password).then(({ data, error }) => {
        if (error) {
          actions.setError(error);
          return;
        }

        // Update state with logged-in user
        setState((s) => ({
          ...s,
          auth: {
            token: data.token,
            userId: data.userId,
            email: data.email,
            username: data.username,
          },
          ui: { error: null, notice: `Welcome back, ${data.username}!` },
        }));
      });
    },

    register({ email, username, password, repeatPassword }) {
      // Validate inputs
      if (!email || !username || !password) {
        actions.setError('Email, username, and password are required.');
        return;
      }

      if (!email.includes('@')) {
        actions.setError('Please enter a valid email address.');
        return;
      }

      if (password.length < 4) {
        actions.setError('Password must be at least 4 characters.');
        return;
      }

      if (password !== repeatPassword) {
        actions.setError('Passwords do not match.');
        return;
      }

      // Call API
      api.auth.register(email, username, password).then(({ data, error }) => {
        if (error) {
          actions.setError(error);
          return;
        }

        // Update state with new user
        setState((s) => ({
          ...s,
          auth: {
            token: data.token,
            userId: data.userId,
            email: data.email,
            username: data.username,
          },
          ui: { error: null, notice: `Account created. Welcome, ${data.username}!` },
        }));
      });
    },

    logout() {
      // Call API to invalidate token on server
      api.auth.logout().then(() => {
        setState((s) => ({
          ...s,
          auth: null,
          ui: { error: null, notice: 'Logged out successfully.' },
        }));
      });
    },

    setToken(token, userId) {
      // This method is used for setting token directly (used by API callbacks)
      setState((s) => ({
        ...s,
        auth: {
          token,
          userId,
        },
        ui: { error: null, notice: 'Logged in.' },
      }));
    },

    async createRecipe({ title, description, image, servings, ingredientsText, instructionsText }) {
      const err = validateRecipePayload({ title, description, servings });
      if (err) {
        actions.setError(err);
        return;
      }

      const ingredients = parseIngredients(ingredientsText);
      const instructions = parseMultilineLines(instructionsText);

      const recipeData = {
        title,
        description,
        imageUrl: image,
        servings: Number(servings),
        ingredients,
        instructions,
      };

      const { data, error } = await api.recipes.create(recipeData);
      
      if (error) {
        actions.setError(error);
        return;
      }

      // Add recipe to state
      setState((s) => ({
        ...s,
        recipes: [data, ...s.recipes],
        ui: { error: null, notice: 'Recipe created successfully!' },
      }));
    },

    async updateRecipe(id, { title, description, image, servings, ingredientsText, instructionsText }) {
      const err = validateRecipePayload({ title, description, servings });
      if (err) {
        actions.setError(err);
        return;
      }

      const ingredients = parseIngredients(ingredientsText);
      const instructions = parseMultilineLines(instructionsText);

      const recipeData = {
        title,
        description,
        imageUrl: image,
        servings: Number(servings),
        ingredients,
        instructions,
      };

      const { data, error } = await api.recipes.update(id, recipeData);
      
      if (error) {
        actions.setError(error);
        return;
      }

      // Update recipe in state
      setState((s) => ({
        ...s,
        recipes: s.recipes.map(r => r.id === id ? data : r),
        ui: { error: null, notice: 'Recipe updated successfully!' },
      }));
    },

    async deleteRecipe(id) {
      const { error } = await api.recipes.delete(id);
      
      if (error) {
        actions.setError(error);
        return;
      }

      // Remove recipe from state
      setState((s) => ({
        ...s,
        recipes: s.recipes.filter(r => r.id !== id),
        ui: { error: null, notice: 'Recipe deleted successfully!' },
      }));
    },

    async loadRecipes() {
      const { data, error } = await api.recipes.getAll();
      
      if (error) {
        actions.setError(error);
        return;
      }

      setState((s) => ({
        ...s,
        recipes: data || [],
      }));
    },

    async loadMyRecipes() {
      const { data, error } = await api.recipes.getMyRecipes();
      
      if (error) {
        actions.setError(error);
        return;
      }

      setState((s) => ({
        ...s,
        recipes: data || [],
      }));
    },
  };

  return { getState, setState, subscribe, actions };
}

export const store = createStore();
