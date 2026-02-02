import { api } from '../api.js';
import { navigateTo } from '../router.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseIngredients(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, quantity, unit] = line.split('|').map((s) => (s ?? '').trim());
      return {
        name: name || line,
        quantity: Number(quantity) || 0,
        unit: unit || '',
      };
    });
}

function parseInstructions(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export async function editRecipeView({ params }) {
  const recipeId = params?.id;

  try {
    const response = await api.recipes.getById(recipeId);
    const recipe = response?.data;

    if (!recipe) {
      return `
        <div class="container">
          <section class="grid">
            <article class="card">
              <div class="card__body">
                <h1 class="card__title">Recipe Not Found</h1>
                <div class="card__actions">
                  <a class="button button--primary" href="#/my-recipes">Back to My Recipes</a>
                </div>
              </div>
            </article>
          </section>
        </div>
      `;
    }

    const ingredientsText = recipe.ingredients
      .map((i) => `${i.name} | ${i.quantity} | ${i.unit}`)
      .join('\n');

    const instructionsText = recipe.instructions.join('\n');

    return `
      <div class="container">
        <section class="grid">
          <article class="card">
            <div class="card__body">
              <h1 class="card__title">Edit Recipe</h1>
              <p class="card__muted">Update your recipe details.</p>

              <div id="edit-recipe-message"></div>

              <form class="form" id="edit-recipe-form" data-recipe-id="${escapeHtml(recipeId)}">
                <div class="field">
                  <label class="label" for="recipe-title">Title *</label>
                  <input class="input" id="recipe-title" name="title" required value="${escapeHtml(recipe.title)}" />
                </div>

                <div class="field">
                  <label class="label" for="recipe-description">Description *</label>
                  <textarea class="textarea" id="recipe-description" name="description" required>${escapeHtml(recipe.description)}</textarea>
                </div>

                <div class="field">
                  <label class="label" for="recipe-image">Image URL (optional)</label>
                  <input class="input" id="recipe-image" name="image" type="url" value="${escapeHtml(recipe.image || '')}" />
                </div>

                <div class="field">
                  <label class="label" for="recipe-servings">Servings *</label>
                  <input class="input" id="recipe-servings" name="servings" type="number" min="1" required value="${recipe.servings}" />
                </div>

                <div class="field">
                  <label class="label" for="recipe-ingredients">Ingredients *</label>
                  <textarea class="textarea" id="recipe-ingredients" name="ingredients" required>${escapeHtml(ingredientsText)}</textarea>
                </div>

                <div class="field">
                  <label class="label" for="recipe-instructions">Instructions *</label>
                  <textarea class="textarea" id="recipe-instructions" name="instructions" required>${escapeHtml(instructionsText)}</textarea>
                </div>

                <div class="card__actions">
                  <button class="button button--primary" type="submit">Save Changes</button>
                  <a class="button" href="#/my-recipes">Cancel</a>
                </div>
              </form>
            </div>
          </article>
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
                <a class="button button--primary" href="#/my-recipes">Back to My Recipes</a>
              </div>
            </div>
          </article>
        </section>
      </div>
    `;
  }
}

// Handle edit form submission
window.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id !== 'edit-recipe-form') return;

  event.preventDefault();

  const recipeId = form.getAttribute('data-recipe-id');
  const formData = new FormData(form);
  const messageEl = document.getElementById('edit-recipe-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';
  }

  try {
    const recipeData = {
      title: String(formData.get('title') ?? '').trim(),
      description: String(formData.get('description') ?? '').trim(),
      image: String(formData.get('image') ?? '').trim(),
      servings: Number(formData.get('servings')),
      ingredients: parseIngredients(String(formData.get('ingredients') ?? '')),
      instructions: parseInstructions(String(formData.get('instructions') ?? '')),
    };

    const result = await api.recipes.update(recipeId, recipeData);

    if (result?.error) {
      if (messageEl) {
        messageEl.innerHTML = `<div class="error">${escapeHtml(result.error)}</div>`;
      }
      return;
    }

    navigateTo('/my-recipes');
  } catch (error) {
    if (messageEl) {
      messageEl.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Changes';
    }
  }
});
