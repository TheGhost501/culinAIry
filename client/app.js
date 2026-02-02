import { createRouter } from './state/router.js';
import { store } from './state/store.js';
import { renderNavbar } from './components/navbar.js';

import { homeView } from './views/homeView.js';
import { loginView } from './views/loginView.js';
import { registerView } from './views/registerView.js';
import { recipesListView } from './views/recipesListView.js';
import { recipeDetailsView } from './views/recipeDetailsView.js';
import { recipeFormView } from './views/recipeFormView.js';
import { notFoundView } from './views/notFoundView.js';

// Entry point for the SPA.
// Uses hash-based routing: #/path

const appRoot = document.getElementById('app');
const headerRoot = document.getElementById('site-header');

if (!appRoot || !headerRoot) {
  throw new Error('Missing #app or #site-header root element.');
}

function mount(html) {
  appRoot.innerHTML = html;
}

function renderLayout() {
  headerRoot.innerHTML = renderNavbar(store.getState());
}

// Global click handler for elements that want to navigate without anchors.
// Example: <button data-link="#/recipes">Go</button>
document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const link = target.closest('[data-link]');
  if (!(link instanceof HTMLElement)) return;

  const href = link.getAttribute('data-link');
  if (!href) return;

  event.preventDefault();
  window.location.hash = href;
});

// Global submit handler: routes view-specific form events through a data-action.
// This keeps views simple and avoids a large number of per-view listeners.
document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;

  const action = form.getAttribute('data-action');
  if (!action) return;

  event.preventDefault();

  // Views implement their own action handlers through the store.
  // We centralize the wiring here.
  if (action === 'login') {
    const username = form.username?.value?.trim();
    const password = form.password?.value ?? '';

    store.actions.login({ username, password });
    window.location.hash = '#/recipes';
    return;
  }

  if (action === 'register') {
    const username = form.username?.value?.trim();
    const password = form.password?.value ?? '';
    const repeatPassword = form.repeatPassword?.value ?? '';

    store.actions.register({ username, password, repeatPassword });
    window.location.hash = '#/recipes';
    return;
  }

  if (action === 'recipe-create') {
    const formData = new FormData(form);

    const title = String(formData.get('title') ?? '').trim();
    const description = String(formData.get('description') ?? '').trim();
    const image = String(formData.get('image') ?? '').trim();
    const servingsRaw = String(formData.get('servings') ?? '').trim();

    const ingredientsText = String(formData.get('ingredients') ?? '').trim();
    const instructionsText = String(formData.get('instructions') ?? '').trim();

    const servings = Number(servingsRaw);

    store.actions.createRecipe({
      title,
      description,
      image,
      servings,
      ingredientsText,
      instructionsText,
    });

    window.location.hash = '#/recipes';
    return;
  }
});

// Global actions like logout.
document.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const actionEl = target.closest('[data-action]');
  if (!(actionEl instanceof HTMLElement)) return;

  const action = actionEl.getAttribute('data-action');
  if (!action) return;

  if (action === 'logout') {
    event.preventDefault();
    store.actions.logout();
    window.location.hash = '#/login';
  }
});

const router = createRouter({
  notFoundView,
  onBeforeRender() {
    // Navbar depends on auth state, so keep it in sync.
    renderLayout();
  },
  onRender(html) {
    mount(html);
  },
});

router.addRoute('/', homeView);
router.addRoute('/login', loginView);
router.addRoute('/register', registerView);
router.addRoute('/recipes', recipesListView);
router.addRoute('/recipes/new', recipeFormView);
router.addRoute('/recipes/:id', recipeDetailsView);

// Re-render navbar when state changes.
store.subscribe(() => {
  renderLayout();
});

// Start.
renderLayout();
router.start();
