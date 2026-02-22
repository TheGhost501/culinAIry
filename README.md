# CulinAIry

> ✅ **Status:** Fully implemented and consolidated  
> 🎨 **Theme:** Dark mode with culinary motifs  
> 📅 **Last Updated:** February 22, 2026

A full-stack recipe management single-page application (SPA) built with vanilla JavaScript and Node.js/Express. Features a clean API-only architecture with no frontend frameworks or state management libraries.

## Features

- 🔐 **User authentication** — Token-based sessions with localStorage persistence
- 📝 **Recipe CRUD** — Create, read, update, and delete recipes with owner verification
- 🍽️ **Ingredient scaler** — Interactive serving size adjuster with +/− buttons and visual feedback
- 🎨 **Dark theme UI** — Purple/cyan color scheme with culinary SVG background motifs
- 📱 **Protected routes** — Client-side route guards redirect unauthenticated users to login
- 💾 **JSON file storage** — Simple file-based persistence (no database required)
- 🧭 **Hash-based routing** — Seamless SPA navigation (#/path)

## Tech Stack

### Backend
- **Node.js** + **Express** REST API
- **JSON file storage** (no database)
- Token-based authentication with custom `X-Authorization` header

### Frontend
- **Vanilla JavaScript** (ES6+ modules, template literals)
- **Hash-based router** with protected routes
- **API-only architecture** (no state management library)
- **Custom CSS** with dark theme and culinary motifs
- **localStorage** for auth token persistence

## Project Structure

```
culinAIry/
├── server/                      # Backend API
│   ├── data/
│   │   ├── users.json           # User accounts with tokens
│   │   └── recipes.json         # Recipe database
│   ├── middleware/
│   │   └── auth.js              # Token validation middleware
│   ├── routes/
│   │   ├── auth.js              # Login/register/logout endpoints
│   │   └── recipes.js           # Recipe CRUD with owner verification
│   ├── utils/
│   │   ├── fileHandler.js       # JSON read/write utilities
│   │   └── tokenGenerator.js    # UUID token generation
│   ├── server.js                # Express app entry point
│   └── package.json
├── client/                      # Frontend SPA
│   ├── css/
│   │   ├── main.css             # Global styles, dark theme, components
│   │   └── recipe.css           # Ingredient scaler styles
│   ├── js/
│   │   ├── app.js               # SPA entry point (initializes router & navbar)
│   │   ├── router.js            # Hash-based router with protected routes
│   │   ├── api.js               # HTTP client with X-Authorization header
│   │   ├── auth.js              # localStorage token management
│   │   ├── views/               # 9 page views
│   │   │   ├── homeView.js
│   │   │   ├── loginView.js
│   │   │   ├── registerView.js
│   │   │   ├── recipesView.js       # All recipes (public)
│   │   │   ├── recipeDetailsView.js # Single recipe with scaler
│   │   │   ├── createRecipeView.js  # Create form (protected)
│   │   │   ├── editRecipeView.js    # Edit form (protected)
│   │   │   ├── myRecipesView.js     # User's recipes (protected)
│   │   │   └── notFoundView.js      # 404 fallback
│   │   ├── components/
│   │   │   ├── navbar.js            # Nav with auth state
│   │   │   └── ingredientScaler.js  # Interactive scaler widget
│   │   └── utils/
│   │       └── ingredientScaler.js  # Scaling math & formatting
│   ├── legacy-frontend/         # Archived duplicate files (for review)
│   ├── index.html               # SPA shell with culinary SVG motifs
│   └── package.json
├── .github/
│   └── copilot-instructions.md  # AI coding guidelines
├── ARCHITECTURE.md              # Detailed architecture documentation
├── projectStructure.md
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- VS Code with Live Server extension (recommended)

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

   **Option B: Python http.server**
   ```bash
   cd client
   python -m http.server 5500
   ```

   **Option C: Node.js serve**
   ```bash
   # From project root
   npx serve client -p 5500
   ```

### Development Workflow

1. **Backend** runs on `http://localhost:3000` (Express API)
2. **Frontend** runs on `http://localhost:5500` (static file server)
3. **API client** (`client/js/api.js`) automatically injects `X-Authorization` header from localStorage
4. **Data persistence** — all user and recipe data in `server/data/*.json` files
5. **Hash routing** — `#/recipes`, `#/login`, etc. trigger view changes without page reloads
6. **Protected routes** — `/create-recipe`, `/edit-recipe/:id`, `/my-recipes` require authentication

## API Endpoints

### Authentication
- `POST /api/auth/register` — Create new user
  - Body: `{ email, username, password }`
  - Returns: `{ data: { token, userId, username, email } }`
- `POST /api/auth/login` — Login user
  - Body: `{ email, password }`
  - Returns: `{ data: { token, userId, username, email } }`
- `POST /api/auth/logout` — Logout (requires auth)
  - Returns: `{ data: { message: "Logged out" } }`

### Recipes
- `GET /api/recipes` — List all public recipes
- `GET /api/recipes/my-recipes` — Get user's recipes (requires auth)
- `GET /api/recipes/:id` — Get single recipe details
- `POST /api/recipes` — Create recipe (requires auth)
- `PUT /api/recipes/:id` — Update recipe (requires auth, owner only)
- `DELETE /api/recipes/:id` — Delete recipe (requires auth, owner only)

**Auth header:** `X-Authorization: <token>` (auto-injected by `api.js`)

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

## Key Features Detail

### Ingredient Scaler
The recipe detail view includes an interactive ingredient calculator:
- **+/− buttons** to adjust serving sizes
- **Quick select** buttons for common multipliers (1×, 2×, 3×)
- **Real-time scaling** with proportional quantity updates
- **Visual feedback** when ingredients are scaled
- **Math utilities** handle fractions, unit conversions, and formatting

### Protected Routes
Client-side route guards protect authenticated pages:
- `/create-recipe` — Redirects to login if not authenticated
- `/edit-recipe/:id` — Requires auth + ownership verification
- `/my-recipes` — User's personal recipe collection

### Dark Theme
- **Color palette:** Purple (`#7c5cff`) and cyan (`#38bdf8`) accents on dark blue background
- **Culinary motifs:** SVG illustrations (chef hat, utensils) as decorative background
- **Glassmorphism effects:** Cards with backdrop blur and transparency
- **Custom CSS variables** for consistent theming

## Code Conventions

- **ES6+ Modules** — All files use `import`/`export` (no CommonJS)
- **Async/await** — Preferred over `.then()` chains for async operations
- **Views return HTML strings** — Template literals (no lit-html or JSX)
- **API-only architecture** — No state management library (no Vuex/Redux/store)
- **Custom CSS** — Modular stylesheets using CSS variables (no Tailwind/BEM)
- **Centralized API client** — All HTTP requests go through `client/js/api.js`
- **Event delegation** — Window-level listeners for form submissions and actions
- **localStorage auth** — Token stored client-side, cleared on logout

For detailed coding patterns and AI agent guidelines, see [.github/copilot-instructions.md](.github/copilot-instructions.md).

## Architecture Notes

### Why No State Management Library?
The frontend uses a **direct API approach** instead of Vuex/Redux/store patterns:
- Views call `api.js` directly and render responses
- Auth state lives in `localStorage` with `authChange` events
- Simpler data flow: `View → API → Render`
- Easier to understand for beginners

### Legacy Files
The `client/legacy-frontend/` folder contains archived duplicate implementations from incremental development (state-based router, Vuex-like store). These are preserved for review but not part of the active codebase.

### Culinary Theme
The dark theme with culinary motifs reflects the app's recipe management purpose:
- SVG chef hat and utensils in background (subtle, low opacity)
- Food-related color palette (warm purples, fresh cyans)
- Card-based layout resembling recipe cards

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -m "feat: description"`
3. Push and create a PR: `git push -u origin feature/your-feature`

## License

MIT
