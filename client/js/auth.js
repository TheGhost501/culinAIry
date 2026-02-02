// Auth state management using localStorage.

const TOKEN_KEY = 'culinairy_token';
const USER_ID_KEY = 'culinairy_user_id';

function dispatchAuthChange() {
  window.dispatchEvent(new CustomEvent('authChange'));
}

export function saveToken(token, userId = null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (userId) {
    localStorage.setItem(USER_ID_KEY, userId);
  }

  dispatchAuthChange();
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  dispatchAuthChange();
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function getUserId() {
  const stored = localStorage.getItem(USER_ID_KEY);
  if (stored) return stored;

  const token = getToken();
  if (!token) return null;

  try {
    // Basic JWT-style decode attempt: header.payload.signature
    const payload = token.split('.')[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded?.userId ?? decoded?.id ?? null;
  } catch {
    return null;
  }
}
