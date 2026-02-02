export async function notFoundView({ path }) {
  return `
    <section class="grid">
      <article class="card">
        <div class="card__body">
          <h1 class="card__title">Not found</h1>
          <p class="card__muted">No route matches <strong>${path}</strong>.</p>
          <div class="card__actions">
            <a class="button button--primary" href="#/">Go home</a>
            <a class="button" href="#/recipes">Browse recipes</a>
          </div>
        </div>
      </article>
    </section>
  `;
}
