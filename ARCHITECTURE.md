# CulinAIry - Software Architecture Design

> **Project Status:** ✅ Implemented and Consolidated  
> **Architecture Version:** 2.0  
> **Last Updated:** February 22, 2026

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Folder Structure](#folder-structure)
3. [API Endpoint Specifications](#api-endpoint-specifications)
4. [JSON Data Schemas](#json-data-schemas)
5. [Authentication Flow](#authentication-flow)
6. [Component Architecture](#component-architecture)
7. [Middleware Chain](#middleware-chain)
8. [Setup & Development Workflow](#setup--development-workflow)
9. [Design Rationale](#design-rationale)

---

## Project Overview

**CulinAIry** is a beginner-friendly, full-stack Single Page Application (SPA) for managing personal recipe collections. The application demonstrates modern web development practices using vanilla JavaScript on the frontend and Node.js/Express on the backend, with custom token-based authentication and JSON file storage.

### Core Features
- User registration and authentication
- Recipe CRUD operations (Create, Read, Update, Delete)
- Ingredient scaling calculator
- Personal recipe collections
- Responsive UI with client-side routing

### Technology Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript ES6+ (template literals)
- **Backend:** Node.js, Express.js
- **Storage:** JSON files (file-based database)
- **Authentication:** Custom token-based auth with X-Authorization header
- **Routing:** Hash-based client-side routing (#/path)

---

## Folder Structure

```
culinAIry/
├── server/                          # Backend Node.js/Express application
│   ├── data/                        # JSON file-based database storage
│   │   ├── users.json               # User accounts with hashed passwords
│   │   └── recipes.json             # Recipe database with author references
│   ├── middleware/                  # Express middleware modules
│   │   └── auth.js                  # Token validation middleware
│   ├── routes/                      # API route handlers
│   │   ├── auth.js                  # Authentication endpoints (register/login/logout)
│   │   └── recipes.js               # Recipe CRUD endpoints
│   ├── utils/                       # Utility modules for reusable logic
│   │   ├── fileHandler.js           # JSON file read/write operations
│   │   └── tokenGenerator.js        # Token generation utilities
│   ├── server.js                    # Express server entry point
│   └── package.json                 # Server dependencies and scripts
│
├── client/                          # Frontend SPA application
│   ├── css/                         # Stylesheets (dark theme with culinary motifs)
│   │   ├── main.css                 # Global styles, layout, components, dark theme
│   │   └── recipe.css               # Ingredient scaler and recipe-specific styles
│   ├── js/                          # JavaScript modules (ES6+)
│   │   ├── app.js                   # SPA entry point (initializes router & navbar)
│   │   ├── router.js                # Hash-based router with protected routes
│   │   ├── api.js                   # HTTP client with X-Authorization header injection
│   │   ├── auth.js                  # Auth state (localStorage token management)
│   │   ├── views/                   # Page view modules (return HTML strings)
│   │   │   ├── homeView.js          # Landing page
│   │   │   ├── loginView.js         # Login form view
│   │   │   ├── registerView.js      # Registration form view
│   │   │   ├── recipesView.js       # All recipes list (public)
│   │   │   ├── recipeDetailsView.js # Single recipe detail with scaler
│   │   │   ├── createRecipeView.js  # Recipe creation form (protected)
│   │   │   ├── editRecipeView.js    # Recipe editing form (protected)
│   │   │   ├── myRecipesView.js     # User's personal recipes (protected)
│   │   │   └── notFoundView.js      # 404 fallback view
│   │   ├── components/              # Reusable UI components
│   │   │   ├── navbar.js            # Navigation bar with auth state
│   │   │   └── ingredientScaler.js  # Interactive ingredient calculator widget
│   │   └── utils/                   # Frontend utilities
│   │       └── ingredientScaler.js  # Ingredient scaling math & formatting
│   ├── legacy-frontend/             # Archived duplicate frontend trees (for review)
│   ├── index.html                   # SPA shell with culinary SVG motifs
│   └── package.json                 # Frontend tooling (http-server)
│
├── .github/                         # GitHub configuration
│   └── copilot-instructions.md      # AI assistant guidance for the project
├── .gitignore                       # Git ignore rules
├── ARCHITECTURE.md                  # This file (software architecture doc)
├── projectStructure.md              # Detailed file tree documentation
└── README.md                        # Project overview and setup guide
```

### Module Responsibilities

#### Backend Modules

**`server/server.js`**
- Express app initialization
- Middleware registration (CORS, body-parser, auth)
- Route mounting
- Static file serving for client
- Error handling
- Server startup

**`server/middleware/auth.js`**
- Extract token from `X-Authorization` header
- Validate token against stored user tokens
- Attach user data to `req.user`
- Return 401 for invalid/missing tokens

**`server/routes/auth.js`**
- User registration endpoint
- User login with credential verification
- User logout endpoint
- Token generation and response

**`server/routes/recipes.js`**
- Recipe creation (auth required)
- Recipe retrieval (all recipes, by ID, or user's recipes)
- Recipe update (owner verification required)
- Recipe deletion (owner verification required)

**`server/utils/fileHandler.js`**
- Read JSON files asynchronously
- Write JSON files with error handling
- File system operations

**`server/utils/tokenGenerator.js`**
- Generate unique tokens (UUID-based)
- Token management utilities

#### Frontend Modules

**`client/js/app.js`**
- SPA entry point (auto-initializes router)
- Initialize navbar on page load
- Listen for authChange events to update UI
- Minimal bootstrap logic

**`client/js/router.js`**
- Map URL hashes to view functions (#/path → viewFn)
- Handle hashchange and load events
- Render views in #app-container
- Protected route guards (redirect to /login if not authenticated)
- Extract route parameters (`:id` patterns)

**`client/js/api.js`**
- Centralized HTTP client (fetch wrapper)
- Auto-inject `X-Authorization` header from localStorage
- Organized by resource (api.auth.*, api.recipes.*)
- Return `{ data, error }` for consistent handling
- Base URL: http://localhost:3000/api/

**`client/js/auth.js`**
- Store/retrieve token from localStorage
- getUserId() for ownership checks
- isAuthenticated() for route guards
- saveToken(), clearToken() with authChange events
- No external dependencies (localStorage only)

**Views** (`client/js/views/*.js`)
- Export async view functions that return HTML strings
- Use ES6 template literals (no lit-html)
- Fetch data directly via api.js (no store)
- Handle form submissions with window event delegation
- Examples: homeView, loginView, registerView, recipesView, recipeDetailsView, createRecipeView, editRecipeView, myRecipesView, notFoundView

**Components** (`client/js/components/*.js`)
- navbar.js: Renders navigation, updates on authChange, handles logout
- ingredientScaler.js: Interactive serving size adjuster with +/− buttons and visual feedback

**Utils** (`client/js/utils/*.js`)
- ingredientScaler.js: Math utilities for scaling ingredients (scaleQuantity, formatQuantity, adjustUnits, getServingSuggestions)

---

## API Endpoint Specifications

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### **POST /api/auth/register**
Create a new user account.

**Authentication:** Not required

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "username": "string (required)",
  "email": "string (required, valid email format)",
  "password": "string (required)"
}
```

**Success Response (201 Created):**
```json
{
  "data": {
    "token": "unique-token-string",
    "userId": "user-uuid",
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- **400 Bad Request:** Validation errors
  ```json
  {
    "error": "Email already exists"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

---

#### **POST /api/auth/login**
Authenticate existing user and receive JWT token.

**Authentication:** Not required

**Request Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "createdAt": "2026-02-02T10:30:00.000Z"
  }
}
```

**Error Responses:**
- **401 Unauthorized:** Invalid credentials
  ```json
  {
    "error": "Invalid email or password"
  }
  ```
- **400 Bad Request:** Missing fields
  ```json
  {
    "error": "Email and password are required"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePass123"
  }'
```

---

### Recipe Endpoints

#### **GET /api/recipes**
Retrieve all recipes or filter by query parameters.

**Authentication:** Required (X-Authorization header)

**Request Headers:**
```json
{
  "X-Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Query Parameters (optional):**
- `authorId` - Filter recipes by author (user ID)
- `search` - Search in recipe titles and descriptions

**Success Response (200 OK):**
```json
[
  {
    "id": "recipe-uuid-1",
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade cookies with chocolate chips",
    "ingredients": [
      {
        "name": "All-purpose flour",
        "amount": 2.5,
        "unit": "cups"
      },
      {
        "name": "Butter",
        "amount": 1,
        "unit": "cup"
      }
    ],
    "steps": [
      "Preheat oven to 375°F",
      "Mix butter and sugar until creamy",
      "Add flour and mix well",
      "Fold in chocolate chips",
      "Bake for 10-12 minutes"
    ],
    "servings": 24,
    "prepTime": 15,
    "cookTime": 12,
    "authorId": "550e8400-e29b-41d4-a716-446655440000",
    "authorName": "johndoe",
    "createdAt": "2026-02-02T11:00:00.000Z",
    "updatedAt": "2026-02-02T11:00:00.000Z"
  }
]
```

**Error Responses:**
- **401 Unauthorized:** Missing or invalid token
  ```json
  {
    "error": "Authentication required"
  }
  ```

**Example:**
```bash
curl -X GET http://localhost:5000/api/recipes \
  -H "X-Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### **GET /api/recipes/:id**
Retrieve a specific recipe by ID.

**Authentication:** Required

**Request Headers:**
```json
{
  "X-Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "id": "recipe-uuid-1",
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies",
  "ingredients": [...],
  "steps": [...],
  "servings": 24,
  "prepTime": 15,
  "cookTime": 12,
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "authorName": "johndoe",
  "createdAt": "2026-02-02T11:00:00.000Z",
  "updatedAt": "2026-02-02T11:00:00.000Z"
}
```

**Error Responses:**
- **404 Not Found:** Recipe doesn't exist
  ```json
  {
    "error": "Recipe not found"
  }
  ```
- **401 Unauthorized:** Missing token

---

#### **POST /api/recipes**
Create a new recipe.

**Authentication:** Required

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "X-Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:**
```json
{
  "title": "string (required, max 100 chars)",
  "description": "string (required, max 500 chars)",
  "ingredients": [
    {
      "name": "string (required)",
      "amount": "number (required, positive)",
      "unit": "string (required)"
    }
  ],
  "steps": ["string (required, array min 1 item)"],
  "servings": "number (required, positive integer)",
  "prepTime": "number (required, minutes)",
  "cookTime": "number (required, minutes)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "new-recipe-uuid",
  "title": "Chocolate Chip Cookies",
  "description": "Classic homemade cookies",
  "ingredients": [...],
  "steps": [...],
  "servings": 24,
  "prepTime": 15,
  "cookTime": 12,
  "authorId": "550e8400-e29b-41d4-a716-446655440000",
  "authorName": "johndoe",
  "createdAt": "2026-02-02T12:00:00.000Z",
  "updatedAt": "2026-02-02T12:00:00.000Z"
}
```

**Error Responses:**
- **400 Bad Request:** Validation errors
  ```json
  {
    "error": "Title is required"
  }
  ```
- **401 Unauthorized:** Missing token

---

#### **PUT /api/recipes/:id**
Update an existing recipe.

**Authentication:** Required (must be recipe owner)

**Request Headers:**
```json
{
  "Content-Type": "application/json",
  "X-Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Request Body:** Same as POST /api/recipes

**Success Response (200 OK):**
```json
{
  "id": "recipe-uuid-1",
  "title": "Updated Recipe Title",
  ...
  "updatedAt": "2026-02-02T13:00:00.000Z"
}
```

**Error Responses:**
- **403 Forbidden:** User is not recipe owner
  ```json
  {
    "error": "You can only edit your own recipes"
  }
  ```
- **404 Not Found:** Recipe doesn't exist
- **401 Unauthorized:** Missing token

---

#### **DELETE /api/recipes/:id**
Delete a recipe.

**Authentication:** Required (must be recipe owner)

**Request Headers:**
```json
{
  "X-Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200 OK):**
```json
{
  "message": "Recipe deleted successfully"
}
```

**Error Responses:**
- **403 Forbidden:** User is not recipe owner
  ```json
  {
    "error": "You can only delete your own recipes"
  }
  ```
- **404 Not Found:** Recipe doesn't exist
- **401 Unauthorized:** Missing token

---

## JSON Data Schemas

### users.json

**File Location:** `server/data/users.json`

**Structure:** Array of user objects

**Schema:**
```json
[
  {
    "id": "string (UUID v4)",
    "username": "string (3-20 chars, alphanumeric)",
    "email": "string (unique, valid email)",
    "password": "string (bcrypt hashed, salt rounds: 10)",
    "createdAt": "string (ISO 8601 timestamp)"
  }
]
```

**Example:**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "johndoe",
    "email": "john@example.com",
    "password": "$2b$10$N9qo8uLOickgx2ZMRZoMye7FRNpZxjNXPqLLN0xLzHT5NKrGz3jWi",
    "createdAt": "2026-02-02T10:30:00.000Z"
  },
  {
    "id": "660f9511-f39c-52e5-b827-557766551111",
    "username": "janedoe",
    "email": "jane@example.com",
    "password": "$2b$10$xLOickgx2ZMRZoMyN9qo8ue7FRNpZxjNXPqLLN0xLzHT5NKrGz3jWi",
    "createdAt": "2026-02-02T14:20:00.000Z"
  }
]
```

**Validation Rules:**
- `id`: Auto-generated UUID v4, unique
- `username`: Required, 3-20 characters, alphanumeric only, case-insensitive unique
- `email`: Required, valid email format, case-insensitive unique
- `password`: Required, minimum 6 characters plain text → hashed with bcrypt (10 rounds)
- `createdAt`: Auto-generated ISO 8601 timestamp

**Initial State:**
```json
[]
```

---

### recipes.json

**File Location:** `server/data/recipes.json`

**Structure:** Array of recipe objects

**Schema:**
```json
[
  {
    "id": "string (UUID v4)",
    "title": "string (max 100 chars)",
    "description": "string (max 500 chars)",
    "ingredients": [
      {
        "name": "string (required)",
        "amount": "number (positive decimal)",
        "unit": "string (cups, tsp, tbsp, oz, lb, g, kg, etc.)"
      }
    ],
    "steps": ["string (ordered array, min 1 item)"],
    "servings": "number (positive integer)",
    "prepTime": "number (minutes, positive integer)",
    "cookTime": "number (minutes, positive integer)",
    "authorId": "string (UUID v4, references users.id)",
    "createdAt": "string (ISO 8601 timestamp)",
    "updatedAt": "string (ISO 8601 timestamp)"
  }
]
```

**Example:**
```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "title": "Chocolate Chip Cookies",
    "description": "Classic homemade cookies with chocolate chips. Perfect for dessert or snacking!",
    "ingredients": [
      {
        "name": "All-purpose flour",
        "amount": 2.5,
        "unit": "cups"
      },
      {
        "name": "Unsalted butter (softened)",
        "amount": 1,
        "unit": "cup"
      },
      {
        "name": "Granulated sugar",
        "amount": 0.75,
        "unit": "cup"
      },
      {
        "name": "Brown sugar (packed)",
        "amount": 0.75,
        "unit": "cup"
      },
      {
        "name": "Eggs",
        "amount": 2,
        "unit": "large"
      },
      {
        "name": "Vanilla extract",
        "amount": 2,
        "unit": "tsp"
      },
      {
        "name": "Baking soda",
        "amount": 1,
        "unit": "tsp"
      },
      {
        "name": "Salt",
        "amount": 1,
        "unit": "tsp"
      },
      {
        "name": "Chocolate chips",
        "amount": 2,
        "unit": "cups"
      }
    ],
    "steps": [
      "Preheat oven to 375°F (190°C).",
      "In a large bowl, cream together butter, granulated sugar, and brown sugar until light and fluffy.",
      "Beat in eggs one at a time, then stir in vanilla extract.",
      "In a separate bowl, combine flour, baking soda, and salt.",
      "Gradually blend the dry ingredients into the creamed mixture.",
      "Fold in chocolate chips until evenly distributed.",
      "Drop rounded tablespoons of dough onto ungreased cookie sheets, spacing 2 inches apart.",
      "Bake for 10-12 minutes or until edges are golden brown.",
      "Cool on baking sheet for 2 minutes before transferring to a wire rack."
    ],
    "servings": 48,
    "prepTime": 15,
    "cookTime": 12,
    "authorId": "550e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2026-02-02T11:00:00.000Z",
    "updatedAt": "2026-02-02T11:00:00.000Z"
  }
]
```

**Validation Rules:**
- `id`: Auto-generated UUID v4, unique
- `title`: Required, max 100 characters
- `description`: Required, max 500 characters
- `ingredients`: Required array, min 1 item
  - `name`: Required string
  - `amount`: Required positive number (decimals allowed)
  - `unit`: Required string
- `steps`: Required array, min 1 item, ordered sequence
- `servings`: Required positive integer
- `prepTime`: Required positive integer (minutes)
- `cookTime`: Required positive integer (minutes)
- `authorId`: Required, must reference existing user ID
- `createdAt`: Auto-generated ISO 8601 timestamp
- `updatedAt`: Auto-generated, updates on PUT requests

**Initial State:**
```json
[]
```

---

## Authentication Flow

### Registration Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Server  │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  POST /api/auth/register │                          │
     │  { username, email,      │                          │
     │    password }            │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Validate input           │
     │                          │ (format, length)         │
     │                          │                          │
     │                          │ Check email uniqueness   │
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ Hash password (bcrypt)   │
     │                          │ saltRounds = 10          │
     │                          │                          │
     │                          │ Generate UUID for user   │
     │                          │                          │
     │                          │ Save user to users.json  │
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ Generate JWT token       │
     │                          │ payload: { id, email }   │
     │                          │ expiresIn: 24h           │
     │                          │                          │
     │  Response 201            │                          │
     │  { token, user }         │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ Store token in           │                          │
     │ localStorage             │                          │
     │                          │                          │
     │ Redirect to /recipes     │                          │
     │                          │                          │
```

### Login Flow

```
┌─────────┐                ┌─────────┐                ┌──────────┐
│ Client  │                │ Server  │                │ Database │
└────┬────┘                └────┬────┘                └────┬─────┘
     │                          │                          │
     │  POST /api/auth/login    │                          │
     │  { email, password }     │                          │
     ├─────────────────────────>│                          │
     │                          │                          │
     │                          │ Find user by email       │
     │                          ├─────────────────────────>│
     │                          │<─────────────────────────┤
     │                          │                          │
     │                          │ Compare password with    │
     │                          │ hashed password (bcrypt) │
     │                          │                          │
     │                          │ If valid:                │
     │                          │   Generate JWT token     │
     │                          │   payload: { id, email } │
     │                          │   expiresIn: 24h         │
     │                          │                          │
     │  Response 200            │                          │
     │  { token, user }         │                          │
     │<─────────────────────────┤                          │
     │                          │                          │
     │ Store token in           │                          │
     │ localStorage             │                          │
     │                          │                          │
     │ Update auth state        │                          │
     │ Redirect to /recipes     │                          │
     │                          │                          │
```

### Protected Route Access Flow

```
┌─────────┐                ┌─────────┐                ┌────────────┐
│ Client  │                │ Server  │                │ Middleware │
└────┬────┘                └────┬────┘                └─────┬──────┘
     │                          │                           │
     │ GET /api/recipes         │                           │
     │ X-Authorization: token   │                           │
     ├─────────────────────────>│                           │
     │                          │                           │
     │                          │ Route handler invoked     │
     │                          ├──────────────────────────>│
     │                          │                           │
     │                          │                           │ Extract token from
     │                          │                           │ X-Authorization header
     │                          │                           │
     │                          │                           │ Verify token:
     │                          │                           │   - Valid signature?
     │                          │                           │   - Not expired?
     │                          │                           │   - Payload intact?
     │                          │                           │
     │                          │                           │ If valid:
     │                          │                           │   Decode payload
     │                          │                           │   Attach req.user
     │                          │                           │   Call next()
     │                          │<──────────────────────────┤
     │                          │                           │
     │                          │ Process request with      │
     │                          │ authenticated user        │
     │                          │                           │
     │  Response 200            │                           │
     │  { recipes data }        │                           │
     │<─────────────────────────┤                           │
     │                          │                           │
     
     
     If token invalid/missing:
     
     │                          │                           │
     │                          │                           │ Return 401
     │  Response 401            │<──────────────────────────┤
     │  { error: "..." }        │                           │
     │<─────────────────────────┤                           │
     │                          │                           │
     │ Redirect to /login       │                           │
     │ Clear localStorage       │                           │
     │                          │                           │
```

### Logout Flow

```
┌─────────┐                
│ Client  │                
└────┬────┘                
     │                     
     │ User clicks Logout  
     │                     
     │ Remove token from   
     │ localStorage        
     │                     
     │ Clear auth state    
     │ in auth.js module   
     │                     
     │ Redirect to /       
     │ (home page)         
     │                     
```

### Token Refresh Strategy (Future Enhancement)

> **Note:** Phase 1 uses simple 24-hour expiration. Future versions may implement refresh tokens.

**JWT Payload Structure:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "john@example.com",
  "iat": 1738497600,
  "exp": 1738584000
}
```

**Token Expiration:** 24 hours from issuance

**Header Format:**
```
X-Authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsImlhdCI6MTczODQ5NzYwMCwiZXhwIjoxNzM4NTg0MDAwfQ.signature
```

---

## Component Architecture

### Frontend Module Interaction Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         index.html                           │
│  - Single page shell                                         │
│  - Imports app.js as module                                  │
│  - Contains <div id="app"></div> container                   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                         app.js                               │
│  - Application initialization                                │
│  - Import router, auth modules                               │
│  - Load auth state on startup                                │
│  - Initialize router with routes                             │
│  - Set up global event delegation                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
┌─────────────────────┐         ┌─────────────────────┐
│     router.js       │         │      auth.js        │
│                     │         │                     │
│ - Route mapping     │         │ - Token storage     │
│ - hashchange listen │         │ - getUser()         │
│ - navigate(path)    │         │ - login(token)      │
│ - render view in    │         │ - logout()          │
│   #app container    │         │ - isAuthenticated() │
│ - Route guards      │         │                     │
└──────┬──────────────┘         └──────┬──────────────┘
       │                               │
       │ Calls view render()           │ Used by views
       │                               │ and api.js
       ▼                               ▼
┌──────────────────────────────────────────────────────────────┐
│                         Views                                │
│  ┌────────────┬────────────┬────────────┬────────────┐      │
│  │  home.js   │  login.js  │ recipes.js │ details.js │ ...  │
│  │            │            │            │            │      │
│  │ - Import   │ - Import   │ - Import   │ - Import   │      │
│  │   api.js   │   auth.js  │   api.js   │   api.js   │      │
│  │ - Import   │ - Render   │ - Fetch    │ - Fetch    │      │
│  │   navbar   │   form     │   recipes  │   recipe   │      │
│  │ - Render   │ - Handle   │ - Import   │ - Import   │      │
│  │   HTML     │   submit   │   card     │   scaler   │      │
│  └────────────┴────────────┴────────────┴────────────┘      │
└────────┬─────────────────────────────────────────────────────┘
         │
         │ Imports components
         ▼
┌──────────────────────────────────────────────────────────────┐
│                       Components                             │
│  ┌───────────────┬──────────────────┬──────────────────┐    │
│  │  navbar.js    │  recipeCard.js   │ ingredientScaler │    │
│  │               │                  │      .js         │    │
│  │ - Import auth │ - Accept recipe  │ - Calculate      │    │
│  │ - Conditional │   as param       │   proportions    │    │
│  │   rendering   │ - Return HTML    │ - Interactive    │    │
│  │ - Nav links   │   card template  │   input          │    │
│  └───────────────┴──────────────────┴──────────────────┘    │
└──────────────────────────────────────────────────────────────┘

                         ▲
                         │ HTTP requests
                         │
                    ┌────┴─────┐
                    │  api.js  │
                    │          │
                    │ - fetch  │
                    │ - Auto   │
                    │   token  │
                    │   inject │
                    │ - Error  │
                    │   handle │
                    └────┬─────┘
                         │
                         ▼
                  Backend API Endpoints
```

### Router Implementation Spec

**File:** `client/js/router.js`

**Routing Strategy:** Hash-based routing (e.g., `#/recipes`, `#/login`)

**Route Configuration:**
```javascript
const routes = {
  '/': home,
  '/login': login,
  '/register': register,
  '/recipes': recipes,          // Protected
  '/recipes/create': createRecipe,  // Protected
  '/recipes/:id': recipeDetails,    // Protected
  '/recipes/:id/edit': editRecipe   // Protected (owner only)
};
```

**Router Functions:**
- `init()` - Set up hashchange listener, render initial route
- `navigate(path)` - Programmatically navigate to route
- `getCurrentRoute()` - Get active route and params
- `isProtectedRoute(path)` - Check if route requires auth
- `renderView(viewFunction, params)` - Render view in #app container

**Route Guards:**
```javascript
if (isProtectedRoute(path) && !auth.isAuthenticated()) {
  navigate('/login');
  return;
}
```

### API Client Spec

**File:** `client/js/api.js`

**Base Configuration:**
```javascript
const BASE_URL = 'http://localhost:5000/api';
```

**Core Functions:**
```javascript
// GET request
async function get(endpoint) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: getHeaders()
  });
  return handleResponse(response);
}

// POST request
async function post(endpoint, data) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(response);
}

// PUT request
async function put(endpoint, data) { /* similar */ }

// DELETE request
async function del(endpoint) { /* similar */ }

// Auto-inject token
function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  const token = auth.getToken();
  if (token) {
    headers['X-Authorization'] = token;
  }
  
  return headers;
}

// Unified error handling
async function handleResponse(response) {
  if (response.ok) {
    return response.json();
  }
  
  if (response.status === 401) {
    auth.logout();
    router.navigate('/login');
  }
  
  const error = await response.json();
  throw new Error(error.error || 'Request failed');
}
```

### Ingredient Scaler Algorithm

**File:** `client/js/components/ingredientScaler.js`

**Purpose:** Dynamically scale ingredient quantities based on desired servings

**Formula:**
```
newAmount = originalAmount × (newServings ÷ originalServings)
```

**Example:**
- Original recipe: 24 cookies, 2.5 cups flour
- Desired servings: 48 cookies
- Scaled amount: 2.5 × (48 ÷ 24) = 5 cups flour

**Implementation Spec:**
```javascript
/**
 * Scale ingredient amounts based on new serving size
 * @param {Array} ingredients - Original ingredient list
 * @param {number} originalServings - Original recipe servings
 * @param {number} newServings - Desired servings
 * @returns {Array} Scaled ingredients
 */
function scaleIngredients(ingredients, originalServings, newServings) {
  const scaleFactor = newServings / originalServings;
  
  return ingredients.map(ingredient => ({
    ...ingredient,
    amount: roundToDecimal(ingredient.amount * scaleFactor, 2)
  }));
}

/**
 * Round to specified decimal places
 * @param {number} value - Number to round
 * @param {number} decimals - Decimal places
 * @returns {number} Rounded value
 */
function roundToDecimal(value, decimals) {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}
```

**UI Spec:**
- Input field for new serving size
- Real-time calculation on input change
- Display scaled amounts alongside original amounts
- Visual indication of scale factor (e.g., "×2" badge)

---

## Middleware Chain

### Express Middleware Order

**File:** `server/server.js`

```javascript
// 1. CORS - Enable cross-origin requests
app.use(cors({
  origin: 'http://localhost:3000',  // Frontend URL
  credentials: true
}));

// 2. Body Parser - Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Request Logging (optional, development only)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// 4. Static Files - Serve client application
app.use(express.static('client'));

// 5. API Routes - Public endpoints (no auth)
app.use('/api/auth', authRoutes);

// 6. API Routes - Protected endpoints (with auth middleware)
app.use('/api/recipes', authMiddleware, recipeRoutes);

// 7. 404 Handler - Catch unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// 8. Error Handler - Centralized error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
```

### Authentication Middleware Spec

**File:** `server/middleware/auth.js`

```javascript
/**
 * JWT Authentication Middleware
 * Validates token and attaches user to request
 */
async function authMiddleware(req, res, next) {
  try {
    // 1. Extract token from X-Authorization header
    const authHeader = req.headers['x-authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Authentication required' 
      });
    }
    
    // 2. Remove "Bearer " prefix if present
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.slice(7) 
      : authHeader;
    
    // 3. Verify token signature and expiration
    const decoded = tokenGenerator.verify(token);
    
    if (!decoded) {
      return res.status(401).json({ 
        error: 'Invalid or expired token' 
      });
    }
    
    // 4. Attach user data to request object
    req.user = {
      id: decoded.id,
      email: decoded.email
    };
    
    // 5. Continue to route handler
    next();
    
  } catch (error) {
    return res.status(401).json({ 
      error: 'Authentication failed' 
    });
  }
}

module.exports = authMiddleware;
```

### Middleware Execution Flow

```
Request → CORS → Body Parser → Logger → Static Files → Routes
                                                          │
                                                          ▼
                                          /api/auth/* (no middleware)
                                          /api/recipes/* (auth middleware)
                                                          │
                                                          ▼
                                          Route Handler executes
                                          (req.user available)
                                                          │
                                                          ▼
                                          Response sent
                                                          │
                                                          ▼
                                          404 Handler (if no route matched)
                                          Error Handler (if error thrown)
```

---

## Setup & Development Workflow

### Prerequisites

- **Node.js**: v16.0.0 or higher
- **npm**: v7.0.0 or higher (comes with Node.js)
- **Text Editor**: VS Code recommended
- **Browser**: Modern browser with ES6 module support

### Installation Steps

#### 1. Clone Repository
```bash
git clone <repository-url>
cd culinAIry
```

#### 2. Server Setup
```bash
cd server
npm init -y
npm install express cors uuid
npm install --save-dev nodemon
```

**Dependencies Explained:**
- `express` - Web framework for REST API
- `cors` - Cross-origin resource sharing
- `uuid` - Generate unique IDs for users/recipes/tokens
- `nodemon` (dev) - Auto-restart server on file changes

**Note:** This implementation uses a simplified token approach (UUID-based) suitable for learning. For production, consider adding `jsonwebtoken` and `bcrypt` for JWT-based authentication.

#### 3. Environment Variables
Create `server/.env` (optional):
```env
PORT=3000
NODE_ENV=development
```

**Security Note:** Never commit `.env` to version control. Add to `.gitignore`.

#### 4. Initialize Data Files
```bash
mkdir server/data
echo "[]" > server/data/users.json
echo "[]" > server/data/recipes.json
```

#### 5. Update package.json Scripts
Edit `server/package.json`:
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### 6. Client Setup
```bash
cd ../client
npm init -y
npm install --save-dev http-server
```

**Client Dependencies:**
- `http-server` (dev) - Simple static file server for development

**Note:** No frontend build step needed. The client uses vanilla ES6+ with native modules and template literals.

### Development Workflow

#### Start Backend Server
```bash
cd server
npm run dev
```

Backend API runs on `http://localhost:3000`

#### Start Frontend Server
```bash
cd ../client
npx http-server -p 5500
```

Frontend SPA runs on `http://localhost:5500`

#### File Watching
- Backend: `nodemon` auto-restarts on `.js` file changes
- Frontend: Refresh browser to see changes (consider adding live-reload extension)
- Frontend: Refresh browser manually (or use Live Server extension)

### Project Structure Validation Checklist

- [ ] `server/data/users.json` exists and contains `[]`
- [ ] `server/data/recipes.json` exists and contains `[]`
- [ ] `server/.env` exists with JWT_SECRET and PORT
- [ ] `server/package.json` has all dependencies
- [ ] `server/server.js` exists (entry point)
- [ ] `client/index.html` exists (SPA shell)
- [ ] `client/js/app.js` exists (frontend entry)
- [ ] `.gitignore` includes `node_modules/`, `.env`, `*.log`

### Testing Strategy (Manual for Phase 1)

#### Authentication Tests
1. **Register new user** → Check `users.json` for hashed password
2. **Login with correct credentials** → Receive valid JWT token
3. **Login with wrong password** → Receive 401 error
4. **Access protected route without token** → Receive 401 error
5. **Access protected route with valid token** → Success

#### Recipe CRUD Tests
1. **Create recipe** (authenticated) → Recipe appears in `recipes.json`
2. **Get all recipes** → Returns array of recipes
3. **Get single recipe by ID** → Returns recipe object
4. **Update own recipe** → Changes saved to `recipes.json`
5. **Delete own recipe** → Recipe removed from `recipes.json`
6. **Try to edit someone else's recipe** → Receive 403 error

#### Ingredient Scaler Tests
1. **Change servings from 24 to 48** → All amounts doubled
2. **Change servings from 24 to 12** → All amounts halved
3. **Change servings to non-integer** → Amounts scaled proportionally
4. **Verify rounding** → Amounts rounded to 2 decimal places

### Debugging Tips

**Backend Debugging:**
- Enable detailed error messages in development mode
- Use `console.log()` for middleware flow tracking
- Check `users.json` and `recipes.json` for data integrity
- Verify JWT tokens at [jwt.io](https://jwt.io)

**Frontend Debugging:**
- Use browser DevTools Console for errors
- Inspect Network tab for API request/response
- Check Application → Local Storage for token
- Use `console.log()` in view render functions

**Common Issues:**
- **CORS errors:** Check `cors()` origin configuration
- **401 on all requests:** Verify token storage and header injection
- **404 on routes:** Check Express route order and paths
- **JSON parse errors:** Verify file encoding (UTF-8) and format

---

## Design Rationale

### Why JSON File Storage?

**Advantages:**
- ✅ **Zero configuration** - No database installation required
- ✅ **Beginner-friendly** - Easy to inspect and debug
- ✅ **Portable** - Copy files to backup/restore data
- ✅ **Version control friendly** - Can track data changes in Git (for learning)
- ✅ **No ORM needed** - Direct object manipulation

**Limitations:**
- ❌ Not suitable for production/high-traffic apps
- ❌ No concurrent write protection
- ❌ No query optimization or indexing
- ❌ Limited scalability
- ❌ No ACID guarantees

**When to migrate:** When app needs multi-user concurrent writes, search capabilities, or 1000+ records.

**Migration path:** Swap `fileHandler.js` with database ORM (Sequelize, Mongoose), keep same API interface.

---

### Why Vanilla JavaScript over Frameworks?

**Advantages:**
- ✅ **Learn fundamentals** - Understand DOM, events, modules
- ✅ **No build step** - Direct browser execution
- ✅ **No framework lock-in** - Transferable skills
- ✅ **Lightweight** - Faster load times
- ✅ **Full control** - No "magic" or abstraction layers

**Limitations:**
- ❌ More boilerplate for complex UIs
- ❌ Manual state management
- ❌ No reactive data binding
- ❌ More code for reusable components

**When to use frameworks:** Large-scale apps, team collaboration, complex state, real-time updates.

**Framework adoption path:** React/Vue can be added incrementally, reuse existing API client.

---

### Why Token-Based Authentication?

**Advantages:**
- ✅ **Stateless server** - No session storage needed
- ✅ **Scalable** - Horizontal scaling without session sharing
- ✅ **Mobile-friendly** - Easy to use in native apps
- ✅ **Cross-domain** - Works across subdomains/CORS
- ✅ **Self-contained** - Token carries user data

**Limitations:**
- ❌ Token revocation complexity (logout doesn't invalidate)
- ❌ Token size larger than session cookies
- ❌ XSS vulnerability if not handled properly

**Security measures:**
- Store tokens in `localStorage` (not cookies for simplicity)
- Use HTTPS in production
- Implement short expiration times (24h)
- Future: Add refresh token rotation

---

### Why Hash-Based Routing?

**Advantages:**
- ✅ **Simple implementation** - Just `hashchange` event listener
- ✅ **No server configuration** - Works with any static host
- ✅ **Browser history** - Back/forward buttons work
- ✅ **Bookmarkable URLs** - `#/recipes` can be shared

**Limitations:**
- ❌ Not SEO-friendly (search engines ignore hash)
- ❌ Uglier URLs (`#/` prefix)
- ❌ No SSR (Server-Side Rendering)

**Alternative:** HTML5 History API (`pushState`) requires server-side URL rewriting.

**When to switch:** When SEO matters or deploying to server with routing config support.

---

### Authentication Implementation

**Current Approach:**
- ✅ **Token-based** - Simple UUID-based tokens stored with user records
- ✅ **X-Authorization header** - Custom header for API requests
- ✅ **localStorage** - Client-side token persistence
- ✅ **Protected routes** - Client and server-side verification

**Note:** This is a simplified implementation suitable for learning. For production applications, consider:
- JWT (JSON Web Tokens) with bcrypt password hashing
- OAuth 2.0 / OpenID Connect for social login
- Refresh tokens for improved security
- HTTPS for encrypted communication

---

## Implementation Status

### ✅ Completed (Phase 2 & 3)
- ✅ Folder structure created and consolidated
- ✅ Express server with CORS and middleware
- ✅ Authentication routes (register/login/logout)
- ✅ Recipe CRUD routes with owner verification
- ✅ Frontend hash-based router with protected routes
- ✅ All view modules (9 views total)
- ✅ Reusable components (navbar, ingredientScaler)
- ✅ Dark theme CSS with culinary motifs
- ✅ API-only architecture (no central store)
- ✅ localStorage-based auth state
- ✅ Ingredient scaling calculator with interactive UI
- ✅ Frontend consolidation (duplicate trees archived in `legacy-frontend/`)

### 🎯 Current Architecture Highlights
- **Single Source of Truth:** One canonical frontend at `client/js/` (API-driven, no state management library)
- **Clean Separation:** Backend (`server/`) and frontend (`client/`) are completely decoupled via REST API
- **Protected Routes:** Client-side guards redirect unauthenticated users to login
- **Culinary Theme:** SVG motifs (chef hat, utensils) with purple/cyan dark theme
- **Ingredient Scaler:** Interactive widget with +/− buttons, serving suggestions, and proportional scaling

### 📦 Legacy Archive
- **Location:** `client/legacy-frontend/`
- **Contents:** Duplicate frontend implementations from incremental development (state-based router, Vuex-like store, duplicate views)
- **Purpose:** Preserved for review; not part of the active codebase

---

## Potential Enhancements

### Next Phase Ideas
1. **Backend Improvements**
   - Migrate from JSON files to PostgreSQL/MongoDB
   - Add input validation middleware (express-validator)
   - Implement refresh tokens for better security
   - Add recipe search/filter endpoints

2. **Frontend Features**
   - Recipe search/filter UI
   - Image upload capability
   - Loading states and skeleton screens
   - Error boundaries for better UX
   - PWA support (service worker, offline mode)

3. **Advanced Features**
   - Recipe sharing/social features
   - Ratings and reviews system
   - Nutritional information calculator
   - Pagination for large recipe lists
   - Real-time updates (WebSockets for collaborative editing)
   - Password reset via email

4. **DevOps & Testing**
   - Unit tests (Jest/Vitest)
   - Integration tests (Supertest for API)
   - E2E tests (Playwright/Cypress)
   - CI/CD pipeline (GitHub Actions)
   - Deploy to Vercel/Netlify (frontend) + Railway/Render (backend)

---

## Summary

CulinAIry is now a fully functional, full-stack recipe management SPA with a clean, consolidated architecture. The design emphasizes:

- **Separation of concerns** - Clear module boundaries between frontend and backend
- **Scalability** - Easy to swap JSON files for a real database
- **Security** - Token-based auth with protected routes
- **Maintainability** - API-only frontend, no complex state management
- **User Experience** - Dark theme, culinary motifs, interactive ingredient scaler
- **Code Quality** - Consolidated structure with archived legacy code for review

The architecture supports incremental development and future enhancements without requiring major refactoring.
