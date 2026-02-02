import { api } from '../api.js';
import { navigateTo } from '../router.js';

export async function registerView() {
  return `
    <div class="container">
      <section class="grid">
        <article class="card card--half">
          <div class="card__body">
            <h1 class="card__title">Create Account</h1>
            <p class="card__muted">Join the CulinAIry community to save your recipes.</p>

            <div id="register-message"></div>

            <form class="form" id="register-form">
              <div class="field">
                <label class="label" for="register-email">Email</label>
                <input class="input" id="register-email" name="email" type="email" autocomplete="email" placeholder="you@example.com" required />
              </div>

              <div class="field">
                <label class="label" for="register-username">Username</label>
                <input class="input" id="register-username" name="username" autocomplete="username" placeholder="Pick a username" required />
              </div>

              <div class="field">
                <label class="label" for="register-password">Password</label>
                <input class="input" id="register-password" name="password" type="password" autocomplete="new-password" placeholder="At least 4 characters" required />
              </div>

              <div class="field">
                <label class="label" for="register-repeat">Repeat password</label>
                <input class="input" id="register-repeat" name="repeatPassword" type="password" autocomplete="new-password" placeholder="Repeat your password" required />
              </div>

              <div class="card__actions">
                <button class="button button--primary" type="submit">Create account</button>
                <a class="link" href="#/login">Already have an account?</a>
              </div>
            </form>
          </div>
        </article>

        <article class="card card--half">
          <div class="card__body">
            <h2 class="card__title">What gets saved?</h2>
            <p class="card__muted">Your account is securely stored on our backend. Your auth token is saved in your browser's localStorage.</p>
          </div>
        </article>
      </section>
    </div>
  `;
}

// Handle register form submission
document.addEventListener('submit', async (event) => {
  const form = event.target;
  if (form.id !== 'register-form') return;

  event.preventDefault();

  const formData = new FormData(form);
  const messageEl = document.getElementById('register-message');
  const submitBtn = form.querySelector('button[type="submit"]');

  const email = String(formData.get('email') ?? '').trim();
  const username = String(formData.get('username') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const repeatPassword = String(formData.get('repeatPassword') ?? '');

  // Validate passwords match
  if (password !== repeatPassword) {
    if (messageEl) {
      messageEl.innerHTML = `<div class="error">Passwords do not match.</div>`;
    }
    return;
  }

  // Disable button during request
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';
  }

  try {
    const result = await api.auth.register(email, username, password);

    if (result.error) {
      if (messageEl) {
        messageEl.innerHTML = `<div class="error">${escapeHtml(result.error)}</div>`;
      }
      return;
    }

    // Success - redirect to recipes
    if (messageEl) {
      messageEl.innerHTML = `<div class="notice">Account created! Redirecting...</div>`;
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
      submitBtn.textContent = 'Create account';
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
