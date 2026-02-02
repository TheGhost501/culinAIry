# CulinAIry Frontend-Backend Integration Guide

Complete documentation for the SPA frontend to Express backend integration, including API patterns, authentication, and example request/response flows.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Authentication Flow](#authentication-flow)
3. [API Service Layer](#api-service-layer)
4. [Complete API Reference](#complete-api-reference)
5. [Example Requests & Responses](#example-requests--responses)
6. [Error Handling](#error-handling)
7. [Client-Side State Management](#client-side-state-management)

---

## Architecture Overview

### Backend Structure (Express.js)

```
server/
├── server.js                 # Entry point, middleware setup
├── routes/
│   ├── auth.js              # Auth endpoints (register, login, logout, me)
│   └── recipes.js           # Recipe CRUD endpoints
├── middleware/
│   └── auth.js              # Token validation middleware
├── utils/
│   ├── fileHandler.js       # JSON file I/O utilities
│   └── tokenGenerator.js    # UUID token generation
└── data/
    ├── users.json           # User accounts and sessions
    └── recipes.json         # Recipe data
```

### Frontend Structure (Vanilla JS SPA)

```
client/
├── index.html               # Main HTML shell
├── js/
│   ├── app.js              # Entry point, event handling
│   ├── api.js              # API service client ⭐
│   ├── auth.js             # Auth utilities (token management)
│   ├── router.js           # Hash routing
│   ├── views/              # Page components
│   ├── components/         # Reusable UI elements
│   ├── services/           # Business logic
│   └── state/
│       └── store.js        # Application state management
└── css/
    └── main.css            # Global styles
```

---

## Authentication Flow

### 1. Registration Flow

```
┌─────────────────┐
│   User Input    │
│  (email, pass)  │
└────────┬────────┘
         │
         v
┌─────────────────────────────────────┐
│  store.actions.register()           │
│  - Validate inputs locally          │
│  - Call api.auth.register()         │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│  POST /api/auth/register            │
│  Backend creates user, generates    │
│  token, returns in response         │
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│  api.auth.register() returns        │
│  { data: {token, userId, ...}, error: null }
└────────┬────────────────────────────┘
         │
         v
┌─────────────────────────────────────┐
│  saveToken(token, userId)           │
│  - Saves to localStorage            │
│  - Store state updated              │
│  - Views re-render                  │
│  - Navigate to /recipes             │
└─────────────────────────────────────┘
```

### 2. Login Flow

```
┌─────────────────────────────────┐
│   User Submits Login Form       │
│   (email, password)             │
└────────┬────────────────────────┘
         │
         v
┌─────────────────────────────────┐
│  store.actions.login()          │
│  - Validate inputs              │
│  - Call api.auth.login()        │
└────────┬────────────────────────┘
         │
         v
┌──────────────────────────────────────┐
│  POST /api/auth/login                │
│  Backend validates credentials,      │
│  generates token, returns session    │
└────────┬─────────────────────────────┘
         │
         v
┌──────────────────────────────────────┐
│  saveToken(token) in localStorage    │
│  Update auth state in store          │
│  X-Authorization header now sent     │
│  on all protected requests           │
└──────────────────────────────────────┘
```

### 3. Token Usage

**All authenticated requests include:**

```http
X-Authorization: <token-from-localStorage>
```

**Example with curl:**

```bash
curl -X GET http://localhost:3000/api/recipes/my-recipes \
  -H "X-Authorization: your-token-here" \
  -H "Content-Type: application/json"
```

---

## API Service Layer

### Location: `client/js/api.js`

The API service is a centralized HTTP client that handles:
- Base URL configuration
- Header management (Content-Type, X-Authorization)
- JSON parsing
- Error handling
- Request/response wrapping

### Core Functions

#### `getAuthHeaders()`
Retrieves auth headers with token from localStorage.

```javascript
function getAuthHeaders() {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['X-Authorization'] = token;
  }
  return headers;
}
```

#### `request(method, endpoint, body, requiresAuth)`
Generic request function. All HTTP calls go through this.

```javascript
async function request(method, endpoint, body = null, requiresAuth = false) {
  const headers = requiresAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' };
  
  const init = { method, headers };
  if (body) init.body = JSON.stringify(body);
  
  const url = new URL(endpoint, BASE_URL);
  
  try {
    const response = await fetch(url.toString(), init);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorJson.message || response.statusText;
      } catch {
        errorMessage = errorText || response.statusText;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    // ... handle response
    return data;
  } catch (error) {
    throw error;
  }
}
```

#### HTTP Method Wrappers

```javascript
function get(endpoint, requiresAuth = false)
function post(endpoint, body, requiresAuth = false)
function put(endpoint, body, requiresAuth = false)
function del(endpoint, requiresAuth = false)
```

---

## Complete API Reference

### Authentication Endpoints

#### `POST /api/auth/register`

Register a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123"
}
```

**Response (201 Created):**
```json
{
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe",
    "token": "unique-token-string",
    "message": "User registered successfully"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "error": "Email already registered"
}
```

**Frontend Usage:**
```javascript
const { data, error } = await api.auth.register(email, username, password);
if (error) {
  store.actions.setError(error);
  return;
}
saveToken(data.token, data.userId);
```

---

#### `POST /api/auth/login`

Authenticate user and get session token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "data": {
    "token": "session-token-uuid",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid email or password"
}
```

**Frontend Usage:**
```javascript
const { data, error } = await api.auth.login(email, password);
if (!error && data.token) {
  saveToken(data.token, data.userId);
  window.location.hash = '#/recipes';
}
```

---

#### `POST /api/auth/logout` (Protected)

Invalidate current session token.

**Headers:**
```http
X-Authorization: <token>
```

**Request:** (empty body)

**Response (200 OK):**
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Frontend Usage:**
```javascript
await api.auth.logout();  // Handles token cleanup
window.location.hash = '#/login';
```

---

#### `GET /api/auth/me` (Protected)

Get current authenticated user's profile.

**Headers:**
```http
X-Authorization: <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid or missing token"
}
```

---

### Recipe Endpoints

#### `GET /api/recipes`

Get all public recipes (no auth required).

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": "recipe-uuid-1",
      "title": "Chocolate Chip Cookies",
      "description": "Classic homemade cookies",
      "imageUrl": "https://example.com/image.jpg",
      "servings": 24,
      "ownerId": "user-uuid",
      "ingredients": [
        { "name": "Flour", "quantity": 2.25, "unit": "cups" },
        { "name": "Butter", "quantity": 1, "unit": "cup" }
      ],
      "instructions": [
        "Preheat oven to 375°F",
        "Mix dry ingredients",
        "Combine wet and dry ingredients",
        "Scoop onto baking sheet",
        "Bake for 9-11 minutes"
      ],
      "createdAt": "2024-02-01T10:30:00.000Z"
    },
    // ... more recipes
  ]
}
```

**Frontend Usage:**
```javascript
const { data: recipes, error } = await api.recipes.getAll();
if (!error) {
  setState(s => ({ ...s, recipes: data }));
}
```

---

#### `GET /api/recipes/my-recipes` (Protected)

Get recipes owned by authenticated user.

**Headers:**
```http
X-Authorization: <token>
Content-Type: application/json
```

**Response (200 OK):**
```json
{
  "data": [
    { /* recipe object */ },
    { /* recipe object */ }
  ]
}
```

---

#### `GET /api/recipes/:id`

Get single recipe by ID (public).

**URL:** `/api/recipes/recipe-uuid-1`

**Response (200 OK):**
```json
{
  "data": {
    "id": "recipe-uuid-1",
    "title": "Pancakes",
    "description": "Fluffy breakfast pancakes",
    "imageUrl": "https://example.com/pancakes.jpg",
    "servings": 4,
    "ownerId": "user-uuid",
    "ingredients": [ /* ... */ ],
    "instructions": [ /* ... */ ],
    "createdAt": "2024-02-01T10:30:00.000Z"
  }
}
```

**Error (404 Not Found):**
```json
{
  "error": "Recipe not found"
}
```

---

#### `POST /api/recipes` (Protected)

Create new recipe.

**Headers:**
```http
X-Authorization: <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Spaghetti Carbonara",
  "description": "Italian pasta with creamy sauce",
  "imageUrl": "https://example.com/carbonara.jpg",
  "servings": 4,
  "ingredients": [
    { "name": "Spaghetti", "quantity": 400, "unit": "g" },
    { "name": "Eggs", "quantity": 4, "unit": "" },
    { "name": "Bacon", "quantity": 200, "unit": "g" }
  ],
  "instructions": [
    "Boil water and cook pasta",
    "Fry bacon until crispy",
    "Mix eggs with parmesan",
    "Combine pasta with egg mixture",
    "Serve with black pepper"
  ]
}
```

**Response (201 Created):**
```json
{
  "data": {
    "id": "new-recipe-uuid",
    "title": "Spaghetti Carbonara",
    "description": "Italian pasta with creamy sauce",
    "imageUrl": "https://example.com/carbonara.jpg",
    "servings": 4,
    "ownerId": "user-uuid",
    "ingredients": [ /* ... */ ],
    "instructions": [ /* ... */ ],
    "createdAt": "2024-02-02T15:45:30.000Z"
  }
}
```

**Frontend Usage:**
```javascript
const { data: newRecipe, error } = await api.recipes.create(recipeData);
if (!error) {
  store.actions.setNotice('Recipe created!');
  window.location.hash = '#/recipes';
}
```

---

#### `PUT /api/recipes/:id` (Protected)

Update existing recipe (must be owner).

**Headers:**
```http
X-Authorization: <token>
Content-Type: application/json
```

**URL:** `/api/recipes/recipe-uuid-1`

**Request:** (same structure as POST)
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  // ... other fields
}
```

**Response (200 OK):**
```json
{
  "data": {
    "id": "recipe-uuid-1",
    "title": "Updated Title",
    // ... updated recipe
  }
}
```

**Error (403 Forbidden):**
```json
{
  "error": "You don't have permission to update this recipe"
}
```

---

#### `DELETE /api/recipes/:id` (Protected)

Delete recipe (must be owner).

**Headers:**
```http
X-Authorization: <token>
Content-Type: application/json
```

**URL:** `/api/recipes/recipe-uuid-1`

**Response (200 OK):**
```json
{
  "data": {
    "message": "Recipe deleted successfully"
  }
}
```

**Error (403 Forbidden):**
```json
{
  "error": "You don't have permission to delete this recipe"
}
```

---

## Example Requests & Responses

### Complete User Journey with curl

#### 1. Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "username": "alice_chef",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "data": {
    "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "email": "alice@example.com",
    "username": "alice_chef",
    "token": "8d9e9e82-a8e0-4a7c-b1c9-f8f8f8f8f8f8",
    "message": "User registered successfully"
  }
}
```

#### 2. Create Recipe (with token)

```bash
TOKEN="8d9e9e82-a8e0-4a7c-b1c9-f8f8f8f8f8f8"

curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN" \
  -d '{
    "title": "Homemade Pizza",
    "description": "Crispy crust with fresh toppings",
    "imageUrl": "https://example.com/pizza.jpg",
    "servings": 2,
    "ingredients": [
      {"name": "Flour", "quantity": 500, "unit": "g"},
      {"name": "Water", "quantity": 325, "unit": "ml"},
      {"name": "Tomato Sauce", "quantity": 200, "unit": "ml"},
      {"name": "Mozzarella", "quantity": 250, "unit": "g"}
    ],
    "instructions": [
      "Mix flour and water",
      "Let dough rise for 2 hours",
      "Stretch dough into pizza shape",
      "Add sauce and cheese",
      "Bake at 450°F for 15 minutes"
    ]
  }'
```

**Response:**
```json
{
  "data": {
    "id": "c4a5e3f2-7c8d-4a5b-9f2e-1a2b3c4d5e6f",
    "title": "Homemade Pizza",
    "description": "Crispy crust with fresh toppings",
    "imageUrl": "https://example.com/pizza.jpg",
    "servings": 2,
    "ownerId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "ingredients": [
      {"name": "Flour", "quantity": 500, "unit": "g"},
      {"name": "Water", "quantity": 325, "unit": "ml"},
      {"name": "Tomato Sauce", "quantity": 200, "unit": "ml"},
      {"name": "Mozzarella", "quantity": 250, "unit": "g"}
    ],
    "instructions": [
      "Mix flour and water",
      "Let dough rise for 2 hours",
      "Stretch dough into pizza shape",
      "Add sauce and cheese",
      "Bake at 450°F for 15 minutes"
    ],
    "createdAt": "2024-02-02T16:22:45.123Z"
  }
}
```

#### 3. Get All Recipes

```bash
curl -X GET http://localhost:3000/api/recipes \
  -H "Content-Type: application/json"
```

#### 4. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "data": {
    "token": "9e2f4e3a-1b2c-4d5e-8f9a-0b1c2d3e4f5a",
    "userId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "email": "alice@example.com",
    "username": "alice_chef"
  }
}
```

#### 5. Get My Recipes (protected)

```bash
TOKEN="9e2f4e3a-1b2c-4d5e-8f9a-0b1c2d3e4f5a"

curl -X GET http://localhost:3000/api/recipes/my-recipes \
  -H "X-Authorization: $TOKEN" \
  -H "Content-Type: application/json"
```

#### 6. Update Recipe

```bash
RECIPE_ID="c4a5e3f2-7c8d-4a5b-9f2e-1a2b3c4d5e6f"
TOKEN="9e2f4e3a-1b2c-4d5e-8f9a-0b1c2d3e4f5a"

curl -X PUT http://localhost:3000/api/recipes/$RECIPE_ID \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN" \
  -d '{
    "title": "Homemade Thin Crust Pizza",
    "description": "Crispy thin crust with fresh toppings",
    "imageUrl": "https://example.com/pizza-thin.jpg",
    "servings": 4,
    "ingredients": [...],
    "instructions": [...]
  }'
```

#### 7. Delete Recipe

```bash
RECIPE_ID="c4a5e3f2-7c8d-4a5b-9f2e-1a2b3c4d5e6f"
TOKEN="9e2f4e3a-1b2c-4d5e-8f9a-0b1c2d3e4f5a"

curl -X DELETE http://localhost:3000/api/recipes/$RECIPE_ID \
  -H "X-Authorization: $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "data": {
    "message": "Recipe deleted successfully"
  }
}
```

#### 8. Logout

```bash
TOKEN="9e2f4e3a-1b2c-4d5e-8f9a-0b1c2d3e4f5a"

curl -X POST http://localhost:3000/api/auth/logout \
  -H "X-Authorization: $TOKEN" \
  -H "Content-Type: application/json"
```

---

## Error Handling

### HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | GET request successful |
| 201 | Created | Recipe created |
| 400 | Bad Request | Missing required fields |
| 401 | Unauthorized | Invalid token or credentials |
| 403 | Forbidden | Don't have permission |
| 404 | Not Found | Recipe doesn't exist |
| 500 | Server Error | Database error |

### Error Response Format

```json
{
  "error": "User-friendly error message"
}
```

### Frontend Error Handling Pattern

```javascript
// API calls return { data, error }
const { data, error } = await api.recipes.create(recipeData);

if (error) {
  // Show error to user
  store.actions.setError(error);
  return;
}

// Use successful data
store.actions.setNotice('Recipe created!');
```

### Common Error Scenarios

**Missing Token:**
```json
{
  "error": "Invalid or missing token"
}
```
→ Redirect to login, clear localStorage

**Validation Error:**
```json
{
  "error": "Title, description, ingredients, and instructions are required"
}
```
→ Show validation feedback on form

**Permission Error:**
```json
{
  "error": "You don't have permission to update this recipe"
}
→ Show message, prevent delete button
```

**Network Error:**
```javascript
// Fetch throws on network failure
try {
  const { data, error } = await api.recipes.getAll();
} catch (networkError) {
  store.actions.setError('Connection failed. Please try again.');
}
```

---

## Client-Side State Management

### Store Architecture

The Vuex-like store in `client/js/state/store.js` manages:

```javascript
{
  auth: {
    token: "token-uuid",
    userId: "user-uuid",
    email: "user@example.com",
    username: "johndoe"
  } | null,
  
  ui: {
    error: "Error message" | null,
    notice: "Success message" | null
  },
  
  recipes: [
    { id, title, description, imageUrl, servings, ingredients, instructions, ownerId, createdAt },
    // ...
  ]
}
```

### Store Actions

#### Auth Actions

```javascript
// Call API to register
store.actions.register({ email, username, password, repeatPassword });

// Call API to login
store.actions.login({ email, password });

// Call API to logout, clear token
store.actions.logout();

// Set token directly (used by API callbacks)
store.actions.setToken(token, userId);
```

#### Message Actions

```javascript
// Set error message (auto-clears notice)
store.actions.setError(message);

// Set success message (auto-clears error)
store.actions.setNotice(message);

// Clear both
store.actions.clearMessages();
```

#### Recipe Actions

```javascript
// Fetch all public recipes from backend
store.actions.loadRecipes();

// Fetch user's recipes (protected)
store.actions.loadMyRecipes();

// Create new recipe (calls API)
store.actions.createRecipe({ title, description, image, servings, ingredientsText, instructionsText });

// Update recipe (calls API)
store.actions.updateRecipe(id, { title, description, image, servings, ingredientsText, instructionsText });

// Delete recipe (calls API)
store.actions.deleteRecipe(id);
```

### State Subscription

```javascript
// Listen to store changes
store.subscribe((state) => {
  console.log('State updated:', state);
  // Re-render UI
});

// Get current state
const currentState = store.getState();
```

---

## Running the Integration

### 1. Start Backend

```bash
cd server
npm install
node server.js
# Server running on http://localhost:3000
```

### 2. Start Frontend

```bash
# Option A: VS Code Live Server
# Right-click client/index.html → Open with Live Server (port 5500)

# Option B: http-server package
npx http-server client -p 5500
```

### 3. Test the Integration

1. Open http://localhost:5500 in browser
2. Register a new account
3. Create a recipe
4. View it in recipes list
5. View recipe details
6. Logout and login again

### 4. Monitor Network Requests

- Open DevTools (F12)
- Go to Network tab
- Check Headers tab on API requests
- Verify `X-Authorization` header is present

---

## Next Steps

### Production Considerations

- **Password Hashing:** Use bcrypt instead of plaintext storage
- **HTTPS:** Enforce HTTPS in production
- **CORS:** Adjust CORS origins for production domain
- **Rate Limiting:** Add rate limiting to auth endpoints
- **Token Expiration:** Implement JWT with expiration
- **Error Logging:** Log server errors to external service
- **Input Validation:** Add schema validation (Joi, Zod)

### Frontend Improvements

- Add loading spinners during API calls
- Implement optimistic updates
- Add offline caching (Service Workers)
- Add request retry logic
- Implement request debouncing/throttling

---

## Troubleshooting

**Q: Token not being sent in requests**
→ Check `X-Authorization` header in DevTools Network tab
→ Verify token is in localStorage

**Q: 401 Unauthorized on protected routes**
→ Token may be expired
→ Try logging out and logging back in

**Q: CORS errors**
→ Check `server.js` CORS configuration
→ Frontend must be on allowed origin

**Q: Recipe images not loading**
→ Check image URL is valid and publicly accessible
→ Browser will hide broken images

---

## Summary

This integration provides a **production-ready foundation** for frontend-backend communication with:

✅ Centralized API service layer  
✅ Token-based authentication  
✅ Consistent error handling  
✅ Scalable state management  
✅ Reusable action patterns  
✅ Protected routes & endpoints
