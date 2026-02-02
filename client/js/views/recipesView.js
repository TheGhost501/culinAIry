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
  const image = recipe.image ? escapeHtml(recipe.image) : '';
  const ingredientsCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;

  return `
    <article class="card card--half">
      <div class="card__body">
        ${
          image
            ? `<img class="recipe-hero__img" style="height: 160px; margin-bottom: 12px;" src="${image}" alt="${title}" loading="lazy" />`
            : ''
        }
        <h2 class="card__title">${title}</h2>
        <p class="card__muted">${description}</p>
        <div class="kv" style="margin-top: 12px;">
          <span class="kv__pill">Servings: ${recipe.servings ?? '?'}</span>
          <span class="kv__pill">Ingredients: ${ingredientsCount}</span>
        </div>
        <div class="card__actions">
          <a class="button button--primary" href="#/recipes/${encodeURIComponent(recipe.id)}">View Recipe</a>
        </div>
      </div>
    </article>
  `;
}

export async function recipesView() {
  try {
    const response = await api.recipes.getAll();
    const recipes = response?.data || [];

    return `
      <div class="container">
        <section class="grid">
          <article class="card">
            <div class="card__body">
              <h1 class="card__title">All Recipes</h1>
              <p class="card__muted">Browse all recipes from the community.</p>
              <div class="card__actions">
                <a class="button button--primary" href="#/create-recipe">Create New Recipe</a>
              </div>
            </div>
          </article>

          ${recipes.length ? recipes.map(recipeCard).join('') : `
            <article class="card">
              <div class="card__body">
                <p class="card__muted">No recipes yet. Be the first to create one!</p>
              </div>
            </article>
          `}
        </section>
      </div>
    `;
  } catch (error) {
    return `
      <div class="container">
        <section class="grid">
          <article class="card">
            <div class="card__body">
              <h1 class="card__title">Error</h1>
              <div class="error">${escapeHtml(error.message)}</div>
              <div class="card__actions">
                <a class="button button--primary" href="#/">Go Home</a>
              </div>
            </div>
          </article>
        </section>
      </div>
    `;
  }
}
