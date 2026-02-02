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

export async function createRecipeView() {
  return `
    <div class="container">
      <section class="grid">
        <article class="card">
          <div class="card__body">
            <h1 class="card__title">Create Recipe</h1>
            <p class="card__muted">Share your recipe with the community.</p>

            <div id="create-recipe-message"></div>

            <form class="form" id="create-recipe-form">
              <div class="field">
                <label class="label" for="recipe-title">Title *</label>
                <input class="input" id="recipe-title" name="title" required placeholder="e.g. Classic Pancakes" />
              </div>

              <div class="field">
                <label class="label" for="recipe-description">Description *</label>
                <textarea class="textarea" id="recipe-description" name="description" required placeholder="Brief description of your recipe"></textarea>
              </div>

              <div class="field">
                <label class="label" for="recipe-image">Image URL (optional)</label>
                <input class="input" id="recipe-image" name="image" type="url" placeholder="https://example.com/image.jpg" />
              </div>

              <div class="field">
                <label class="label" for="recipe-servings">Servings *</label>
                <input class="input" id="recipe-servings" name="servings" type="number" min="1" required value="2" />
              </div>

              <div class="field">
                <label class="label" for="recipe-ingredients">Ingredients *</label>
                <textarea class="textarea" id="recipe-ingredients" name="ingredients" required placeholder="Format: name | quantity | unit (one per line)
Example:
Flour | 250 | g
Eggs | 2 |
Milk | 200 | ml"></textarea>
                <div class="hint">Format: <strong>name | quantity | unit</strong> (one per line, unit can be blank)</div>
              </div>

              <div class="field">
                <label class="label" for="recipe-instructions">Instructions *</label>
                <textarea class="textarea" id="recipe-instructions" name="instructions" required placeholder="One step per line"></textarea>
                <div class="hint">Enter each step on a new line.</div>
              </div>

              <div class="card__actions">
                <button class="button button--primary" type="submit">Create Recipe</button>
                <a class="button" href="#/recipes">Cancel</a>
              </div>
            </form>
          </div>
        </article>
      </section>
    </div>
  `;
}

// Handle create form submission
window.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id !== 'create-recipe-form') return;

  event.preventDefault();

  const formData = new FormData(form);
  const messageEl = document.getElementById('create-recipe-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';
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

    const result = await api.recipes.create(recipeData);

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
      submitBtn.textContent = 'Create Recipe';
    }
  }
});
