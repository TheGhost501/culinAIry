import { isAuthenticated } from '../auth.js';

export async function homeView() {
  const authenticated = isAuthenticated();

  return `
    <div class="container">
      <section class="grid">
        <article class="card card--half">
          <div class="card__body">
            <h1 class="card__title">Welcome to CulinAIry</h1>
            <p class="card__muted">A modern recipe manager built with vanilla JavaScript and backend integration.</p>
            <div class="card__actions">
              <a class="button button--primary" href="#/recipes">Browse Recipes</a>
              ${
                authenticated
                  ? `<a class="button" href="#/create-recipe">Create Recipe</a>`
                  : `<a class="button" href="#/login">Login</a>`
              }
            </div>
          </div>
        </article>

        <article class="card card--half">
          <div class="card__body">
            <h2 class="card__title">Features</h2>
            <ul>
              <li>Full backend integration</li>
              <li>User authentication</li>
              <li>Create and manage recipes</li>
              <li>Share with the community</li>
            </ul>
            <p class="card__muted">Status: <strong>${authenticated ? 'Signed in' : 'Not signed in'}</strong></p>
          </div>
        </article>
      </section>
    </div>
  `;
}
