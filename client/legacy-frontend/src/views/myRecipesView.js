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
          <a class="button button--primary" href="#/recipes/${encodeURIComponent(recipe.id)}">View</a>
          <a class="button" href="#/edit-recipe/${encodeURIComponent(recipe.id)}">Edit</a>
          <button class="button button--danger" data-action="delete-recipe" data-id="${escapeHtml(recipe.id)}">Delete</button>
        </div>
      </div>
    </article>
  `;
}

export async function myRecipesView() {
  try {
    const response = await api.recipes.getMyRecipes();
    const recipes = response?.data || [];

    return `
      <div class="container">
        <section class="grid">
          <article class="card">
            <div class="card__body">
              <h1 class="card__title">My Recipes</h1>
              <p class="card__muted">Recipes you've created.</p>
              <div class="card__actions">
                <a class="button button--primary" href="#/create-recipe">Create New Recipe</a>
                <a class="button" href="#/recipes">Browse All Recipes</a>
              </div>
            </div>
          </article>

          ${recipes.length ? recipes.map(recipeCard).join('') : `
            <article class="card">
              <div class="card__body">
                <p class="card__muted">You haven't created any recipes yet.</p>
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
                <a class="button button--primary" href="#/recipes">Back to Recipes</a>
              </div>
            </div>
          </article>
        </section>
      </div>
    `;
  }
}

// Handle delete action via event delegation
window.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const btn = target.closest('[data-action="delete-recipe"]');
  if (!(btn instanceof HTMLElement)) return;

  const recipeId = btn.getAttribute('data-id');
  if (!recipeId) return;

  if (!confirm('Delete this recipe?')) return;

  try {
    await api.recipes.delete(recipeId);
    window.location.hash = '#/my-recipes';
  } catch (error) {
    alert(`Failed to delete: ${error.message}`);
  }
});
