import { api } from '../api.js';
import { navigateTo } from '../router.js';

export async function loginView() {
  return `
    <div class="container">
      <section class="grid">
        <article class="card card--half">
          <div class="card__body">
            <h1 class="card__title">Login</h1>
            <p class="card__muted">Sign in to access your recipes.</p>

            <div id="login-message"></div>

            <form class="form" id="login-form">
              <div class="field">
                <label class="label" for="login-email">Email</label>
                <input class="input" id="login-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
              </div>

              <div class="field">
                <label class="label" for="login-password">Password</label>
                <input class="input" id="login-password" name="password" type="password" autocomplete="current-password" placeholder="Your password" required />
              </div>

              <div class="card__actions">
                <button class="button button--primary" type="submit">Login</button>
                <a class="link" href="#/register">Need an account?</a>
              </div>
            </form>
          </div>
        </article>

        <article class="card card--half">
          <div class="card__body">
            <h2 class="card__title">Demo Credentials</h2>
            <p class="card__muted">Try these credentials:</p>
            <ul>
              <li>Email: <code>gordon@ramsay.com</code></li>
              <li>Password: <code>gordon#1</code></li>
            </ul>
          </div>
        </article>
      </section>
    </div>
  `;
}

// Handle login form submission
document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form.id !== 'login-form') return;

  event.preventDefault();

  const formData = new FormData(form);
  const messageEl = document.getElementById('login-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  // Disable button during request
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';
  }

  try {
    const result = await api.auth.login(email, password);

    if (result.error) {
      if (messageEl) {
        messageEl.innerHTML = `<div class="error">${escapeHtml(result.error)}</div>`;
      }
      return;
    }

    // Success - redirect to recipes
    if (messageEl) {
      messageEl.innerHTML = `<div class="notice">Login successful! Redirecting...</div>`;
    }

    setTimeout(() => {
      navigateTo('/recipes');
    }, 500);
  } catch (error) {
    if (messageEl) {
      messageEl.innerHTML = `<div class="error">${escapeHtml(error.message)}</div>`;
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  }
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
