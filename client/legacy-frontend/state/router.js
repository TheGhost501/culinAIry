// Tiny hash-router with route params.
// Supports patterns like:
//  - /recipes
//  - /recipes/:id

function normalizeHash(hash) {
  // "#/recipes" -> "/recipes"; "" -> "/"
  const raw = (hash || '').replace(/^#/, '').trim();
  return raw.startsWith('/') ? raw : '/';
}

function splitPath(path) {
  return path.split('/').filter(Boolean);
}

function matchRoute(pattern, path) {
  const patternParts = splitPath(pattern);
  const pathParts = splitPath(path);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};

  for (let i = 0; i < patternParts.length; i++) {
    const pp = patternParts[i];
    const sp = pathParts[i];

    if (pp.startsWith(':')) {
      params[pp.slice(1)] = decodeURIComponent(sp);
      continue;
    }

    if (pp !== sp) return null;
  }

  return { params };
}

export function createRouter({ onBeforeRender, onRender, notFoundView }) {
  const routes = [];

  function addRoute(pattern, view) {
    routes.push({ pattern, view });
  }

  async function render() {
    const path = normalizeHash(window.location.hash);

    for (const route of routes) {
      const matched = matchRoute(route.pattern, path);
      if (!matched) continue;

      onBeforeRender?.();
      const html = await route.view({ path, params: matched.params });
      onRender?.(html);
      return;
    }

    onBeforeRender?.();
    const html = await notFoundView({ path, params: {} });
    onRender?.(html);
  }

  function start() {
    window.addEventListener('hashchange', render);

    // Default route.
    if (!window.location.hash) {
      window.location.hash = '#/';
      return;
    }

    render();
  }

  return { addRoute, start };
}
