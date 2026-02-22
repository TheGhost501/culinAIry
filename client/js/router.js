import { isAuthenticated } from './auth.js';
import { homeView } from './views/homeView.js';
import { loginView } from './views/loginView.js';
import { registerView } from './views/registerView.js';
import { recipesView } from './views/recipesView.js';
import { recipeDetailsView } from './views/recipeDetailsView.js';
import { createRecipeView } from './views/createRecipeView.js';
import { editRecipeView } from './views/editRecipeView.js';
import { myRecipesView } from './views/myRecipesView.js';
import { notFoundView } from './views/notFoundView.js';

// Route mapping object
const routes = {
  '/': homeView,
  '/login': loginView,
  '/register': registerView,
  '/recipes': recipesView,
  '/recipes/:id': recipeDetailsView,
  '/create-recipe': createRecipeView,
  '/edit-recipe/:id': editRecipeView,
  '/my-recipes': myRecipesView,
};

const protectedRoutes = new Set([
  '/create-recipe',
  '/edit-recipe/:id',
  '/my-recipes',
]);

export function navigateTo(path) {
  window.location.hash = `#${path}`;
}

export function getCurrentRoute() {
  const hash = window.location.hash.replace('#', '');
  return hash || '/';
}

export function extractParams(pattern, path) {
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = path.split('/').filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
}

export function isProtectedRoute(path) {
  return Array.from(protectedRoutes).some((pattern) => extractParams(pattern, path) !== null);
}

export async function handleRoute() {
  const path = getCurrentRoute();

  if (isProtectedRoute(path) && !isAuthenticated()) {
    navigateTo('/login');
    return;
  }

  let view = null;
  let params = {};

  for (const [pattern, viewFn] of Object.entries(routes)) {
    const extracted = extractParams(pattern, path);
    if (extracted !== null) {
      view = viewFn;
      params = extracted;
      break;
    }
  }

  const appContainer = document.getElementById('app-container');
  if (!appContainer) {
    throw new Error('Missing #app-container in index.html');
  }

  if (!view) {
    const html = await notFoundView({ path });
    appContainer.innerHTML = html;
    return;
  }

  const html = await view({ params, path });
  appContainer.innerHTML = html;
}

window.addEventListener('hashchange', handleRoute);
window.addEventListener('load', handleRoute);
