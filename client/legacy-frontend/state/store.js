import { storage } from './storage.js';
import { recipeService } from '../services/recipeService.js';

// Very small app store.
// - Keeps state in one place
// - Notifies subscribers on changes
// - Persists key parts to localStorage

function createId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function parseMultilineLines(text) {
  return text
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
    const [nameRaw, quantityRaw, unitRaw] = line.split('|').map((s) => (s ?? '').trim());

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

    login({ username, password }) {
      const err = validateAuthPayload({ username, password });
      if (err) {
        setState((s) => ({ ...s, ui: { ...s.ui, error: err, notice: null } }));
        return;
      }

      // Mock token.
      setState((s) => ({
        ...s,
        auth: {
          username,
          token: createId('token'),
        },
        ui: { error: null, notice: `Welcome back, ${username}!` },
      }));
    },

    register({ username, password, repeatPassword }) {
      const err = validateAuthPayload({ username, password });
      if (err) {
        setState((s) => ({ ...s, ui: { ...s.ui, error: err, notice: null } }));
        return;
      }

      if (password !== repeatPassword) {
        setState((s) => ({
          ...s,
          ui: { ...s.ui, error: 'Passwords do not match.', notice: null },
        }));
        return;
      }

      setState((s) => ({
        ...s,
        auth: {
          username,
          token: createId('token'),
        },
        ui: { error: null, notice: `Account created. Hi, ${username}!` },
      }));
    },

    logout() {
      setState((s) => ({
        ...s,
        auth: null,
        ui: { error: null, notice: 'Logged out.' },
      }));
    },

    createRecipe({ title, description, image, servings, ingredientsText, instructionsText }) {
      const err = validateRecipePayload({ title, description, servings });
      if (err) {
        setState((s) => ({ ...s, ui: { ...s.ui, error: err, notice: null } }));
        return;
      }

      const ingredients = parseIngredients(ingredientsText);
      const instructions = parseMultilineLines(instructionsText);

      const recipe = {
        id: createId('recipe'),
        title,
        description,
        image,
        servings,
        ingredients,
        instructions,
        createdAt: new Date().toISOString(),
      };

      setState((s) => ({
        ...s,
        recipes: [recipe, ...s.recipes],
        ui: { error: null, notice: 'Recipe saved (mock).' },
      }));
    },
  };

  return { getState, setState, subscribe, actions };
}

export const store = createStore();
