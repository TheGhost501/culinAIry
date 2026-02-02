# CulinAIry - Software Architecture Design (Phase 1)

> **Project Status:** Planning Phase  
> **Architecture Version:** 1.0  
> **Last Updated:** February 2, 2026

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

**CulinAIry** is a beginner-friendly, full-stack Single Page Application (SPA) for managing personal recipe collections. The application demonstrates modern web development practices using vanilla JavaScript on the frontend and Node.js/Express on the backend, with JWT-based authentication and JSON file storage.

### Core Features
- User registration and authentication
- Recipe CRUD operations (Create, Read, Update, Delete)
- Ingredient scaling calculator
- Personal recipe collections
- Responsive UI with client-side routing

### Technology Stack
- **Frontend:** HTML5, CSS3, Vanilla JavaScript, lit-html
- **Backend:** Node.js, Express.js
- **Storage:** JSON files (file-based database)
- **Authentication:** JWT (JSON Web Tokens) with bcrypt password hashing
- **Routing:** Hash-based client-side routing

---

## Folder Structure

```
culinAIry/
├── server/                          # Backend Node.js/Express application
│   ├── data/                        # JSON file-based database storage
│   │   ├── users.json               # User accounts with hashed passwords
│   │   └── recipes.json             # Recipe database with author references
│   ├── middleware/                  # Express middleware modules
│   │   └── auth.js                  # JWT token validation middleware
│   ├── routes/                      # API route handlers
│   │   ├── auth.js                  # Authentication endpoints (register/login)
│   │   └── recipes.js               # Recipe CRUD endpoints
│   ├── utils/                       # Utility modules for reusable logic
│   │   ├── fileHandler.js           # JSON file read/write operations
│   │   └── tokenGenerator.js        # JWT token generation and validation
│   ├── server.js                    # Express server entry point
│   ├── package.json                 # Server dependencies and scripts
│   └── .env.example                 # Environment variables template
│
├── client/                          # Frontend SPA application
│   ├── css/                         # Stylesheets organized by feature
│   │   ├── main.css                 # Global styles, layout, typography
│   │   ├── auth.css                 # Login/register form styles
│   │   └── recipe.css               # Recipe card and detail styles
│   ├── js/                          # JavaScript modules
│   │   ├── app.js                   # Application entry point and initialization
│   │   ├── router.js                # Client-side hash-based router
│   │   ├── api.js                   # HTTP client with automatic token injection
│   │   ├── auth.js                  # Authentication state management
│   │   ├── views/                   # Page view modules (returns HTML)
│   │   │   ├── home.js              # Landing page with app introduction
│   │   │   ├── login.js             # Login form view
│   │   │   ├── register.js          # Registration form view
│   │   │   ├── recipes.js           # Recipe list/browse view
│   │   │   ├── recipeDetails.js     # Individual recipe detail view
│   │   │   ├── createRecipe.js      # Recipe creation form
│   │   │   └── editRecipe.js        # Recipe editing form
│   │   └── components/              # Reusable UI components
│   │       ├── navbar.js            # Navigation bar with auth state
│   │       ├── recipeCard.js        # Recipe summary card component
│   │       └── ingredientScaler.js  # Interactive ingredient calculator
│   ├── index.html                   # SPA shell (single HTML file)
│   └── favicon.ico                  # Application icon
│
├── .gitignore                       # Git ignore rules (node_modules, .env)
└── README.md                        # Project documentation

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
- Extract JWT token from `X-Authorization` header
- Validate token signature and expiration
- Attach user data to `req.user`
- Return 401 for invalid/missing tokens

**`server/routes/auth.js`**
- User registration with password hashing
- User login with credential verification
- Token generation and response

**`server/routes/recipes.js`**
- Recipe creation (auth required)
- Recipe retrieval (all recipes or by ID)
- Recipe update (owner verification)
- Recipe deletion (owner verification)

**`server/utils/fileHandler.js`**
- Read JSON files asynchronously
- Write JSON files with error handling
- Data validation helpers
- File system operations

**`server/utils/tokenGenerator.js`**
- Generate JWT tokens with user payload
- Verify token validity
- Extract user data from tokens
- Set expiration policies

#### Frontend Modules

**`client/js/app.js`**
- Initialize router
- Set up global event listeners
- Load authentication state
- Render initial view
- Handle navigation events

**`client/js/router.js`**
- Map URL hashes to view functions
- Handle route changes (hashchange event)
- Navigate programmatically
- Render views in DOM container
- Manage route guards (auth-required routes)

**`client/js/api.js`**
- Make HTTP requests to backend
- Auto-inject `X-Authorization` header
- Handle response errors
- Parse JSON responses
- Centralized error handling

**`client/js/auth.js`**
- Store/retrieve JWT from localStorage
- Get current user data
- Login/logout functions
- Check authentication status
- Clear auth state

**Views** (`client/js/views/*.js`)
- Export default function that returns HTML string
- Use lit-html for templating
- Attach event listeners after render
- Fetch data via api.js
- Handle form submissions

**Components** (`client/js/components/*.js`)
- Export reusable render functions
- Accept data as parameters
- Return HTML using lit-html
- Stateless presentation logic

---

## API Endpoint Specifications

### Base URL
```
http://localhost:5000/api
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
  "username": "string (required, 3-20 chars, alphanumeric)",
  "email": "string (required, valid email format)",
  "password": "string (required, min 6 chars)"
}
```

**Success Response (201 Created):**
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
- **400 Bad Request:** Validation errors
  ```json
  {
    "error": "Email already exists"
  }
  ```
- **400 Bad Request:** Missing fields
  ```json
  {
    "error": "All fields are required"
  }
  ```

**Example:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
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
npm install express jsonwebtoken bcrypt cors dotenv uuid
npm install --save-dev nodemon
```

**Dependencies Explained:**
- `express` - Web framework
- `jsonwebtoken` - JWT token generation/validation
- `bcrypt` - Password hashing (10 salt rounds)
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management
- `uuid` - Generate unique IDs for users/recipes
- `nodemon` (dev) - Auto-restart server on file changes

#### 3. Environment Variables
Create `server/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_key_change_in_production_min_32_chars
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
npm install lit-html
```

**Note:** `lit-html` can also be loaded via CDN in production:
```html
<script type="module">
  import {html, render} from 'https://unpkg.com/lit-html?module';
</script>
```

### Development Workflow

#### Start Development Server
```bash
cd server
npm run dev
```

Server runs on `http://localhost:5000`

#### Access Application
Open browser to `http://localhost:5000` (server serves static client files)

#### File Watching
- Backend: `nodemon` auto-restarts on `.js` file changes
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

### Why bcrypt for Password Hashing?

**Advantages:**
- ✅ **Industry standard** - Battle-tested algorithm
- ✅ **Adaptive** - Can increase work factor over time
- ✅ **Salt included** - Each hash is unique
- ✅ **Slow by design** - Resistant to brute-force

**Configuration:**
- Salt rounds: 10 (good balance of security and performance)
- Hash length: 60 characters

**Security note:** Never store plain-text passwords, even in development.

---

## Next Steps

### Phase 2: Implementation
1. Create folder structure
2. Set up server with Express
3. Implement authentication routes
4. Implement recipe routes
5. Build frontend router
6. Create view modules
7. Build reusable components
8. Style with CSS

### Phase 3: Enhancement
1. Add input validation
2. Implement error boundaries
3. Add loading states
4. Create recipe search/filter
5. Add image upload capability
6. Implement unit tests
7. Add API documentation (Swagger)
8. Deploy to hosting platform

### Phase 4: Advanced Features
1. Migrate to database (PostgreSQL/MongoDB)
2. Implement refresh tokens
3. Add password reset via email
4. Create recipe sharing/social features
5. Add ratings and reviews
6. Calculate nutritional information
7. Implement pagination
8. Add real-time updates (WebSockets)

---

## Summary

This architecture provides a solid foundation for building CulinAIry as a beginner-friendly, full-stack recipe management application. The design emphasizes:

- **Separation of concerns** - Clear module boundaries
- **Scalability** - Easy to swap JSON for database
- **Security** - JWT auth with bcrypt password hashing
- **Maintainability** - Modular code with single responsibilities
- **Beginner-friendly** - Well-documented, standard patterns

The architecture supports incremental development and future enhancements without requiring major refactoring.
