# CulinAIry Copilot Instructions

## Project Architecture

**Full-stack recipe management SPA** with vanilla JavaScript (no frameworks) and Node.js backend.

### Backend (`server/`)
- **Express REST API** with JSON file-based persistence (`data/users.json`, `data/recipes.json`)
- **Auth middleware** (`middleware/auth.js`) validates `X-Authorization` header tokens
- **Routes**: `/auth` (login/register), `/recipes` (CRUD operations)
- **Utilities**: `fileHandler.js` (read/write JSON), `tokenGenerator.js` (UUID-based tokens)

### Frontend (`client/`)
- **SPA with hash routing** (`js/router.js`) - no page reloads, all navigation via `#/path`
- **Entry point**: `js/app.js` initializes router and auth state
- **API client** (`js/api.js`) - centralized HTTP wrapper with auth header injection
- **Views** render pure HTML strings, mounted by router
- **Components** are reusable functions returning HTML strings

## Critical Developer Workflows

### Running the project
```bash
# Backend (from server/)
npm install
node server.js  # Runs on port 3000

# Frontend (option 1 - VS Code Live Server)
# Use Live Server extension on client/index.html - runs on port 5500

# Frontend (option 2 - http-server npm package)
npx http-server client -p 5500
```

### Testing
- *Data Schemas

### User object (`data/users.json`)
```json
{
  "id": "uuid-string",
  "username": "string",
  "password": "hashed-string",
  "token": "session-token-string"
}
```

### Recipe object (`data/recipes.json`)
```json
{
  "id": "uuid-string",
  "title": "string",
  "description": "string",
  "image": "url-string",
  "servings": "number",
  "ingredients": [
    { "name": "string", "quantity": "number", "unit": "string" }
  ],
  "instructions": ["step1", "step2"],
  "userId": "owner-uuid",
  "createdAt": "ISO-date-string"
}
```

## Code Style & Conventions

### CSS approach
- **Custom CSS** - no frameworks or methodologies (BEM, Tailwind, etc.)
- Modular stylesheets: `main.css` (global), `auth.css`, `recipe.css`-end tests
- Test against backend on port 3000, frontend on port 5500

### File-based data storage
- **No database** - all data in `server/data/*.json`
- Use `fileHandler.js` utilities for consistent read/write operations
- Data persists across server restarts

## Code Style & Conventions

### ES6 Modules everywhere
```javascript
// All files use import/export (not require/module.exports)
import express from 'express';
export default function myView() { }
```

### Async/await pattern
```javascript
// Preferred - clean async handling
const data = await api.get('/recipes');

// Avoid - chaining .then()
api.get('/recipes').then(data => ...);
```

### View functions return HTML strings
```javascript
// Pattern used in all views (home.js, login.js, etc.)
export default function recipesView(params) {
  return `
    <div class="recipes-container">
      ${recipes.map(r => recipeCard(r)).join('')}
    </div>
  `;
}
```

### API response format
```javascript
// Backend - consistent success/error responses
res.json({ data: result });           // Success
res.status(400).json({ error: msg }); // Error
```

### Auth token in custom header
```javascript
// Frontend - api.js automatically adds this header
headers: { 'X-Authorization': token }

// Backend - middleware/auth.js validates it
const token = req.headers['x-authorization'];
```

## Component Guidelines

### Recipe cards (`components/recipeCard.js`)
- Display recipe summary with image, title, ingredients count
- Clickable cards navigate to `#/recipes/:id`

### Ingredient scaler (`components/ingredientScaler.js`)
- Interactive widget to adjust serving sizes
- Recalculates ingredient quantities proportionally

### Navbar (`components/navbar.js`)
- Shows/hides links based on auth state
- Login/Register vs Recipes/Logout

## Important Patterns

### Router registration
```javascript
// In router.js - map hash paths to view functions
router.addRoute('/', homeView);
router.addRoute('/recipes/:id', recipeDetailsView);
```

### Auth state management (`js/auth.js`)
- Stores token in localStorage
- Exposes `isLoggedIn()`, `getToken()`, `setToken()`, `clearAuth()`
- Views check auth state before rendering protected content

### Error handling in views
```javascript
try {
  const data = await api.get('/recipes');
  // render data
} catch (error) {
  console.error('Failed to load recipes:', error);
  return `<div class="error">Failed to load recipes</div>`;
}
```

## File Organization

- **`server/routes/`** - Express route handlers (auth, recipes)
- **`client/js/views/`** - Full page views (one per route)
- **`client/js/components/`** - Reusable UI elements
- **`client/css/`** - Modular stylesheets (main, auth, recipe)

## Key Integration Points

1. **API client → Backend**: All requests go through `api.js` which handles auth headers
2. **Router → Views**: Hash changes trigger view functions, results mounted to `#app` container
3. **Auth middleware → Routes**: Protects endpoints requiring authentication
4. **FileHandler → Routes**: Abstracts JSON file I/O for data persistence