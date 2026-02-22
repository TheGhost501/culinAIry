// LocalStorage helper used by the in-memory store.
// This keeps the UI working across refreshes without a backend.

const KEY = {
  auth: 'culinairy.auth',
  recipes: 'culinairy.recipes',
};

export const storage = {
  loadAuth() {
    try {
      const raw = localStorage.getItem(KEY.auth);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveAuth(auth) {
    localStorage.setItem(KEY.auth, JSON.stringify(auth));
  },
  clearAuth() {
    localStorage.removeItem(KEY.auth);
  },

  loadRecipes() {
    try {
      const raw = localStorage.getItem(KEY.recipes);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  saveRecipes(recipes) {
    localStorage.setItem(KEY.recipes, JSON.stringify(recipes));
  },
};
