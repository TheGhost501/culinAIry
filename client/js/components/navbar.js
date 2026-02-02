import { isAuthenticated } from '../auth.js';
import { api } from '../api.js';

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function renderNavbar() {
  const authenticated = isAuthenticated();

  return `
    <header class="site-header">
      <div class="container nav">
        <a class="brand" href="#/" aria-label="Go to home">
          <span class="brand__logo" aria-hidden="true"></span>
          <span class="brand__name">CulinAIry</span>
        </a>

        <nav class="nav__links" aria-label="Primary">
          <a class="link" href="#/">Home</a>
          <a class="link" href="#/recipes">Recipes</a>

          ${
            authenticated
              ? `
                <a class="link" href="#/my-recipes">My Recipes</a>
                <a class="link" href="#/create-recipe">Create Recipe</a>
                <button type="button" class="button button--danger" data-action="logout">Logout</button>
              `
              : `
                <a class="link" href="#/login">Login</a>
                <a class="button button--primary" href="#/register">Register</a>
              `
          }
        </nav>
      </div>
    </header>
  `;
}

export function updateNavbar() {
  const navbarContainer = document.getElementById('navbar-container');
  if (!navbarContainer) return;

  navbarContainer.innerHTML = renderNavbar();
}

// Handle logout via event delegation
document.addEventListener('click', async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actionEl = target.closest('[data-action]');
  if (!(actionEl instanceof HTMLElement)) return;

  const action = actionEl.getAttribute('data-action');
  if (action !== 'logout') return;

  event.preventDefault();

  // Disable button during logout
  const button = actionEl;
  button.disabled = true;
  button.textContent = 'Logging out...';

  try {
    // Call API logout (clears token automatically)
    await api.auth.logout();
    
    // Update navbar
    updateNavbar();
    
    // Redirect to home/login
    window.location.hash = '#/';
  } catch (error) {
    console.error('Logout error:', error);
    // Even if server fails, token is cleared locally
    updateNavbar();
    window.location.hash = '#/';
  }
});

// Listen for auth changes.
window.addEventListener('authChange', () => {
  updateNavbar();
});
