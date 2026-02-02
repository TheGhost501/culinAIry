import { store } from '../state/store.js';
import { api } from '../api.js';
import { ingredientScalerComponent, attachScalerListeners } from '../components/ingredientScaler.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function recipeDetailsView({ params }) {
  const { recipes, auth } = store.getState();
  const id = params?.id;

  // Try to fetch from backend first
  const { data: backendRecipe, error } = await api.recipes.getById(id);
  const recipe = backendRecipe || recipes.find((r) => r.id === id);

  if (!recipe) {
    return `
      <section class="grid">
        <article class="card">
          <div class="card__body">
            <h1 class="card__title">Recipe not found</h1>
            <p class="card__muted">No recipe with id: <strong>${escapeHtml(id)}</strong></p>
            ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
            <div class="card__actions">
              <a class="button button--primary" href="#/recipes">Back to recipes</a>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  const title = escapeHtml(recipe.title);
  const description = escapeHtml(recipe.description);
  const image = recipe.imageUrl ? escapeHtml(recipe.imageUrl) : '';

  const ingredients = Array.isArray(recipe.ingredients) ? recipe.ingredients : [];
  const instructions = Array.isArray(recipe.instructions) ? recipe.instructions : [];
  const isOwner = auth && auth.userId === recipe.ownerId;

  // Attach scaler listeners after DOM updates
  setTimeout(() => {
    attachScalerListeners(recipe, (newServings) => {
      console.log(`Servings updated to: ${newServings}`);
    });
  }, 0);

  return `
    <section class="grid">
      <article class="card">
        <div class="card__body">
          <div class="card__actions">
            <a class="link" href="#/recipes">← Back to recipes</a>
          </div>

          <div class="recipe-hero">
            ${image ? `<img class="recipe-hero__img" src="${image}" alt="${title}" onerror="this.style.display='none'" style="max-height: 400px; object-fit: cover; border-radius: 4px;" />` : ''}

            <div>
              <h1 class="card__title" style="font-size: 1.6rem;">${title}</h1>
              <p class="card__muted">${description}</p>

              <div class="kv" style="margin-top: 12px;">
                <span class="kv__pill">Servings: ${recipe.servings ?? '?'}</span>
                <span class="kv__pill">Ingredients: ${ingredients.length}</span>
                <span class="kv__pill">Steps: ${instructions.length}</span>
              </div>

              ${
                isOwner
                  ? `<div class="card__actions" style="margin-top: 16px;">
                      <a class="button" href="#/recipes/${encodeURIComponent(id)}/edit">Edit</a>
                      <button class="button button--danger" data-action="delete-recipe" data-recipe-id="${escapeHtml(id)}">Delete</button>
                    </div>`
                  : ''
              }
            </div>
          </div>
        </div>
      </article>

      <article class="card card--half">
        <div class="card__body">
          ${ingredientScalerComponent(recipe)}
        </div>
      </article>

      <article class="card card--half">
        <div class="card__body">
          <h2 class="card__title">Instructions</h2>
          ${
            instructions.length
              ? `<ol class="list">${instructions
                  .map((s) => `<li>${escapeHtml(s)}</li>`)
                  .join('')}</ol>`
              : '<p class="hint">No instructions listed.</p>'
          }
        </div>
      </article>
    </section>
  `;
}
