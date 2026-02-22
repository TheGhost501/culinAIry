import { store } from '../state/store.js';
import { api } from '../api.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function recipeCard(recipe) {
  const title = escapeHtml(recipe.title);
  const description = escapeHtml(recipe.description);
  const image = recipe.imageUrl ? escapeHtml(recipe.imageUrl) : '';
  const ingredientsCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;

  return `
    <article class="card card--half">
      <div class="card__body">
        <h2 class="card__title">${title}</h2>
        <p class="card__muted">${description}</p>
        ${
          image
            ? `<div style="margin-top: 12px;"><img class="recipe-hero__img" style="height: 160px; object-fit: cover; border-radius: 4px;" src="${image}" alt="${title}" loading="lazy" onerror="this.style.display='none'" /></div>`
            : ''
        }
        <div class="kv" style="margin-top: 12px;">
          <span class="kv__pill">Servings: ${recipe.servings ?? '?'}</span>
          <span class="kv__pill">Ingredients: ${ingredientsCount}</span>
        </div>
        <div class="card__actions">
          <a class="button button--primary" href="#/recipes/${encodeURIComponent(recipe.id)}">View</a>
        </div>
      </div>
    </article>
  `;
}

export async function recipesListView() {
  const { auth, ui, recipes } = store.getState();

  // Fetch recipes from backend on view load
  const { data: backendRecipes, error } = await api.recipes.getAll();
  
  if (error && recipes.length === 0) {
    // Only show error if we don't have any cached recipes
    return `
      <section>
        <div class="grid">
          <article class="card">
            <div class="card__body">
              <h1 class="card__title">Recipes</h1>
              <div class="error">${escapeHtml(error)}</div>
              <div class="card__actions">
                <a class="button button--primary" href="#/recipes">Retry</a>
                ${auth ? `<a class="button" href="#/recipes/new">Create Recipe</a>` : ''}
              </div>
            </div>
          </article>
        </div>
      </section>
    `;
  }

  const displayRecipes = backendRecipes && backendRecipes.length > 0 ? backendRecipes : recipes;

  return `
    <section>
      <div class="grid">
        <article class="card">
          <div class="card__body">
            <h1 class="card__title">Recipes</h1>
            <p class="card__muted">Browse all available recipes or create your own.</p>

            ${ui.error ? `<div class="error">${escapeHtml(ui.error)}</div>` : ''}
            ${ui.notice ? `<div class="notice">${escapeHtml(ui.notice)}</div>` : ''}

            <div class="card__actions">
              ${
                auth
                  ? `<a class="button button--primary" href="#/recipes/new">New Recipe</a>`
                  : `<a class="button button--primary" href="#/login">Login to create recipes</a>`
              }
            </div>
          </div>
        </article>

        ${
          displayRecipes.length === 0
            ? `<article class="card"><div class="card__body"><p class="card__muted">No recipes yet. ${auth ? 'Create one!' : 'Login to create recipes.'}</p></div></article>`
            : displayRecipes.map(recipeCard).join('')
        }
      </div>
    </section>
  `;
}
