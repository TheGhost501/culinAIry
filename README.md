# CulinAIry

A full-stack recipe management single-page application (SPA) built with vanilla JavaScript and Node.js/Express.

## Features

- 🔐 User authentication with token-based sessions
- 📝 Create, read, update, and delete recipes
- 🍽️ Scale recipe ingredients by serving size
- 🎨 Responsive UI with vanilla CSS (no frameworks)
- 📱 Hash-based routing for seamless navigation
- 💾 JSON file-based data persistence

## Tech Stack

### Backend
- **Node.js** + **Express** REST API
- **JSON file storage** (no database)
- Token-based authentication with custom `X-Authorization` header

### Frontend
- **Vanilla JavaScript** (ES6 modules)
- **Hash-based router** for SPA navigation
- **Custom CSS** (modular stylesheets)
- **Playwright** for end-to-end testing

## Project Structure

```
culinAIry/
├── server/
│   ├── data/                    # JSON data files
│   │   ├── users.json
│   │   └── recipes.json
│   ├── middleware/
│   │   └── auth.js              # Token validation middleware
│   ├── routes/
│   │   ├── auth.js              # Login/register endpoints
│   │   └── recipes.js           # Recipe CRUD endpoints
│   ├── utils/
│   │   ├── fileHandler.js       # JSON read/write utilities
│   │   └── tokenGenerator.js    # UUID token generation
│   ├── server.js                # Express app entry point
│   └── package.json
├── client/
│   ├── css/
│   │   ├── main.css             # Global styles
│   │   ├── auth.css             # Auth page styles
│   │   └── recipe.css           # Recipe page styles
│   ├── js/
│   │   ├── app.js               # SPA initialization
│   │   ├── router.js            # Hash-based router
│   │   ├── api.js               # HTTP client with auth
│   │   ├── auth.js              # Auth state management
│   │   ├── views/               # Full-page views (home, login, recipes, etc.)
│   │   └── components/          # Reusable components (navbar, recipeCard, etc.)
│   ├── index.html               # SPA host
│   └── favicon.ico
├── .github/
│   └── copilot-instructions.md  # AI coding agent guidelines
├── .gitignore
├── README.md
└── projectStructure.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- VS Code (with Live Server extension) or http-server

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/culinAIry.git
   cd culinAIry
   ```

2. **Set up the backend**
   ```bash
   cd server
   npm install
   node server.js
   ```
   Backend runs on `http://localhost:3000`

3. **Set up the frontend** (choose one method)

   **Option A: VS Code Live Server**
   - Install [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)
   - Right-click `client/index.html` → "Open with Live Server"
   - Frontend runs on `http://localhost:5500`

   **Option B: http-server**
   ```bash
   # From project root
   npx http-server client -p 5500
   ```

### Development Workflow

1. Backend and frontend run on separate ports (3000 and 5500)
2. Frontend `api.js` automatically injects auth token in `X-Authorization` header
3. All data persists to JSON files under `server/data/`
4. Hash navigation (`#/recipes`, `#/login`, etc.) triggers view changes without page reloads

## API Endpoints

### Authentication
- `POST /auth/register` — Create new user (body: `{ username, password }`)
- `POST /auth/login` — Login user (body: `{ username, password }`)
- Returns: `{ data: { token, id, username } }`

### Recipes
- `GET /recipes` — List all recipes
- `GET /recipes/:id` — Get recipe details
- `POST /recipes` — Create recipe (requires auth)
- `PUT /recipes/:id` — Update recipe (requires auth, owner only)
- `DELETE /recipes/:id` — Delete recipe (requires auth, owner only)

**Auth header required:** `X-Authorization: <token>`

## Data Schemas

### User (`server/data/users.json`)
```json
{
  "id": "uuid-string",
  "username": "string",
  "password": "hashed-string",
  "token": "session-token-string"
}
```

### Recipe (`server/data/recipes.json`)
```json
{
  "id": "uuid-string",
  "title": "string",
  "description": "string",
  "image": "url-string",
  "servings": 4,
  "ingredients": [
    { "name": "flour", "quantity": 2, "unit": "cups" }
  ],
  "instructions": ["Mix dry ingredients", "Add wet ingredients"],
  "userId": "owner-uuid",
  "createdAt": "2024-02-02T10:00:00Z"
}
```

## Testing

Run end-to-end tests with Playwright:

1. Ensure backend (port 3000) and frontend (port 5500) are running
2. From project root:
   ```bash
   npm install --save-dev @playwright/test
   npx playwright install
   npx playwright test
   ```

## Code Conventions

- **ES6 Modules** — All files use `import`/`export`
- **Async/await** — Preferred over `.then()` chains
- **Views return HTML strings** — Views are functions that return template strings
- **Custom CSS** — Modular stylesheets (no frameworks like Tailwind or BEM)
- **Centralized API client** — All requests go through `client/js/api.js`

For detailed coding patterns and AI agent guidelines, see [.github/copilot-instructions.md](.github/copilot-instructions.md).

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "feat: description"`
3. Push and create a PR: `git push -u origin feature/your-feature`

## License

MIT
