import { store } from '../state/store.js';

export async function recipeFormView() {
  const { auth, ui } = store.getState();

  if (!auth) {
    return `
      <section class="grid">
        <article class="card">
          <div class="card__body">
            <h1 class="card__title">Create Recipe</h1>
            <p class="card__muted">You need to be logged in to create recipes.</p>
            <div class="card__actions">
              <a class="button button--primary" href="#/login">Login</a>
              <a class="button" href="#/recipes">Back to recipes</a>
            </div>
          </div>
        </article>
      </section>
    `;
  }

  return `
    <section class="grid">
      <article class="card">
        <div class="card__body">
          <h1 class="card__title">New Recipe</h1>
          <p class="card__muted">Create a new recipe that will be saved to your account.</p>

          ${ui.error ? `<div class="error">${ui.error}</div>` : ''}
          ${ui.notice ? `<div class="notice">${ui.notice}</div>` : ''}

          <form class="form" data-action="recipe-create">
            <div class="field">
              <label class="label" for="recipe-title">Title <span class="required">*</span></label>
              <input class="input" id="recipe-title" name="title" placeholder="e.g. Classic Pancakes" required />
            </div>

            <div class="field">
              <label class="label" for="recipe-description">Description <span class="required">*</span></label>
              <textarea class="textarea" id="recipe-description" name="description" placeholder="Short summary of your recipe" required></textarea>
            </div>

            <div class="field">
              <label class="label" for="recipe-image">Image URL (optional)</label>
              <input class="input" id="recipe-image" name="image" type="url" placeholder="https://example.com/image.jpg" />
              <div class="hint">Tip: Use a direct image URL.</div>
            </div>

            <div class="field">
              <label class="label" for="recipe-servings">Servings <span class="required">*</span></label>
              <input class="input" id="recipe-servings" name="servings" type="number" min="1" step="1" value="2" required />
            </div>

            <div class="field">
              <label class="label" for="recipe-ingredients">Ingredients <span class="required">*</span></label>
              <textarea class="textarea" id="recipe-ingredients" name="ingredients" placeholder="One per line: name | quantity | unit\nFlour | 250 | g\nEggs | 2 |" required></textarea>
              <div class="hint">Format: <strong>name | quantity | unit</strong> (unit can be blank).</div>
            </div>

            <div class="field">
              <label class="label" for="recipe-instructions">Instructions <span class="required">*</span></label>
              <textarea class="textarea" id="recipe-instructions" name="instructions" placeholder="One step per line\nMix ingredients\nCook on pan" required></textarea>
              <div class="hint">One step per line.</div>
            </div>

            <div class="card__actions">
              <button class="button button--primary" type="submit">Create Recipe</button>
              <a class="button" href="#/recipes">Cancel</a>
            </div>
          </form>
        </div>
      </article>
    </section>
  `;
}
