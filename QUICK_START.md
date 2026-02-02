# CulinAIry Integration - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start Backend
```bash
cd server
npm install  # Skip if already done
node server.js
# ✅ Server running on http://localhost:3000
```

### Step 2: Start Frontend
```bash
# Option A: VS Code Live Server Extension
# Right-click client/index.html → "Open with Live Server"

# Option B: Terminal
npx http-server client -p 5500
```

### Step 3: Open Browser
```
http://localhost:5500
```

### Step 4: Test Integration
1. **Register**: Create a new account with email/username/password
2. **Create Recipe**: Click "New Recipe" and fill out the form
3. **View Recipe**: Click on recipe card to see details
4. **List Recipes**: See all public recipes
5. **Logout**: Click logout to test authentication

---

## 📁 Architecture at a Glance

### Backend (Express.js)
```
POST   /api/auth/register      → Create user
POST   /api/auth/login         → Get token
POST   /api/auth/logout        → Invalidate token (protected)
GET    /api/auth/me            → Get profile (protected)

GET    /api/recipes            → Get all recipes (public)
GET    /api/recipes/:id        → Get recipe by ID (public)
GET    /api/recipes/my-recipes → Get user's recipes (protected)
POST   /api/recipes            → Create recipe (protected)
PUT    /api/recipes/:id        → Update recipe (protected)
DELETE /api/recipes/:id        → Delete recipe (protected)
```

### Frontend (Vanilla JS SPA)
```
client/
├── js/
│   ├── api.js                 ← ⭐ API Service (all HTTP calls)
│   ├── auth.js                ← Token management
│   ├── app.js                 ← Event handling
│   ├── router.js              ← Hash routing
│   ├── state/store.js         ← State management
│   ├── views/                 ← Page components
│   └── components/            ← Reusable UI
└── css/
    └── main.css               ← Styles
```

---

## 🔐 Authentication Flow

### Register
```
User Input (email, username, password)
    ↓
store.actions.register()
    ↓
api.auth.register() → POST /api/auth/register
    ↓
Backend creates user, generates token
    ↓
Frontend: saveToken() → localStorage
    ↓
X-Authorization header added to all requests
```

### Login
```
User Input (email, password)
    ↓
api.auth.login() → POST /api/auth/login
    ↓
Backend validates, returns token
    ↓
Frontend: saveToken() → localStorage
    ↓
Authenticated requests work
```

### Protected Requests
```javascript
// Automatically includes X-Authorization header:
const token = getToken();  // From localStorage
headers: {
  'Content-Type': 'application/json',
  'X-Authorization': token
}
```

---

## 📊 API Service Pattern

All API calls follow this pattern:

```javascript
// Call
const { data, error } = await api.recipes.create(recipeData);

// Handle
if (error) {
  store.actions.setError(error);
  return;
}

// Use
store.actions.setNotice('Recipe created!');
```

---

## 🎨 Key Files Modified

| File | Changes | Purpose |
|------|---------|---------|
| `api.js` | ✅ Complete rewrite | Centralized HTTP client |
| `store.js` | ✅ Backend integration | Auth + CRUD operations |
| `app.js` | ✅ Async handling | Form submission |
| `*View.js` | ✅ API calls | Fetch from backend |
| `main.css` | ✅ Loading states | Animations + styling |

---

## 🧪 Common Test Scenarios

### Test 1: User Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "john_chef",
    "password": "password123"
  }'
```

Expected: `{ "data": { "token": "...", "userId": "...", ... } }`

### Test 2: Create Recipe (Protected)
```bash
TOKEN="your-token-here"

curl -X POST http://localhost:3000/api/recipes \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN" \
  -d '{
    "title": "Pasta",
    "description": "Delicious pasta",
    "imageUrl": "...",
    "servings": 4,
    "ingredients": [...],
    "instructions": [...]
  }'
```

Expected: `{ "data": { "id": "...", ... } }`

### Test 3: Get All Recipes
```bash
curl -X GET http://localhost:3000/api/recipes \
  -H "Content-Type: application/json"
```

Expected: `{ "data": [ { recipe1 }, { recipe2 }, ... ] }`

---

## ⚠️ Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "Cannot connect to backend" | Verify `node server.js` is running on port 3000 |
| "Token not sent" | Check DevTools → Network → Headers for `X-Authorization` |
| "401 Unauthorized" | Token expired or invalid. Log out and log back in |
| "CORS error" | Check CORS origin in `server.js` |
| "Recipe not created" | Check validation errors in browser console |
| "Images not loading" | Image URL must be publicly accessible (https) |

---

## 📚 Documentation Files

| File | Content |
|------|---------|
| `INTEGRATION_GUIDE.md` | Complete API documentation (800+ lines) |
| `INTEGRATION_COMPLETE.md` | Full summary with code examples |
| `INTEGRATION_TEST.sh` | Automated test script |
| `QUICK_START.md` | This file |

---

## 🔑 Key Concepts

### 1. Token Management
```javascript
// Save
saveToken(token, userId);  // → localStorage

// Get
const token = getToken();  // ← localStorage

// Clear
clearToken();  // Remove from localStorage
```

### 2. Store State
```javascript
{
  auth: { token, userId, email, username },
  ui: { error, notice },
  recipes: [ recipe1, recipe2, ... ]
}
```

### 3. Views Are Functions
```javascript
// All views are async functions
export async function recipesListView() {
  const { recipes } = store.getState();
  const { data } = await api.recipes.getAll();
  
  return `<html>...</html>`;
}
```

### 4. Hash Routing
```javascript
// Navigation without page reload
window.location.hash = '#/recipes';
window.location.hash = '#/recipes/123';
window.location.hash = '#/login';
```

---

## 🎯 Integration Checklist

- ✅ API service layer created
- ✅ Authentication integrated with backend
- ✅ Recipe CRUD operations connected
- ✅ Views updated to use API
- ✅ Error handling implemented
- ✅ Loading states added
- ✅ Documentation completed
- ✅ Backend verified running
- ✅ Frontend verified running

---

## 📖 Learning Path

1. **Understand the API Service** (`client/js/api.js`)
   - How requests are made
   - How headers are managed
   - How errors are handled

2. **Understand State Management** (`client/js/state/store.js`)
   - How state is structured
   - How actions modify state
   - How views subscribe to changes

3. **Understand the Flow**
   - User interacts with view
   - View calls store action
   - Store action calls API
   - API makes HTTP request
   - Backend responds
   - Store state updates
   - Views re-render

4. **Understand Authentication**
   - Registration/login get token
   - Token stored in localStorage
   - Token sent in X-Authorization header
   - Backend validates token
   - Protected routes only work with valid token

---

## 🚀 Next: Production Deployment

### Security Improvements
- [ ] Use bcrypt for password hashing
- [ ] Implement JWT with expiration
- [ ] Add HTTPS enforcement
- [ ] Add rate limiting
- [ ] Add input validation (Joi/Zod)

### Performance
- [ ] Add request caching
- [ ] Add pagination for recipes
- [ ] Add search/filtering
- [ ] Minify JavaScript
- [ ] Lazy load images

### Features
- [ ] User profiles
- [ ] Recipe ratings
- [ ] Comments
- [ ] Favorites
- [ ] Sharing

---

## 💡 Pro Tips

- Always check DevTools Network tab for API calls
- Use localStorage DevTools extension to debug tokens
- Add console.log() in api.js request() function to debug
- Test with curl before testing in browser
- Use Postman or Insomnia for complex testing

---

## 📞 Support

If something doesn't work:

1. **Check backend is running**
   ```bash
   curl http://localhost:3000/health
   ```

2. **Check frontend is running**
   ```
   http://localhost:5500
   ```

3. **Open DevTools Console**
   - Check for JavaScript errors
   - Check for network errors

4. **Check Network Tab**
   - Is request sent?
   - What's the response?
   - What headers are sent?

5. **Read Documentation**
   - [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
   - [INTEGRATION_COMPLETE.md](./INTEGRATION_COMPLETE.md)

---

## ✨ Features Implemented

✅ User registration with email  
✅ Login with password  
✅ Token-based authentication  
✅ Create recipes  
✅ View all recipes  
✅ View recipe details  
✅ Update recipes (owner only)  
✅ Delete recipes (owner only)  
✅ Error handling  
✅ Loading states  
✅ Success notifications  
✅ Responsive UI  

---

## 🎓 What You Learned

- ✅ Frontend-backend integration patterns
- ✅ REST API design
- ✅ Token-based authentication
- ✅ HTTP headers (Content-Type, X-Authorization)
- ✅ Request/response handling
- ✅ Error handling patterns
- ✅ State management
- ✅ SPA architecture

---

Happy Cooking! 🍳
import { 
  scaleQuantity, 
  formatQuantity,
  scaleIngredients 
} from './js/utils/ingredientScaler.js';

// Scale 2 cups from 4 to 8 servings
const scaled = scaleQuantity(2, 4, 8);
console.log(scaled); // 4

// Format with fractions
console.log(formatQuantity(0.5));   // "1/2"
console.log(formatQuantity(0.75));  // "3/4"
console.log(formatQuantity(1.5));   // "1 1/2"

// Scale a full recipe
const recipe = {
  servings: 4,
  ingredients: [
    { name: 'flour', quantity: 2, unit: 'cup' },
    { name: 'sugar', quantity: 0.75, unit: 'cup' }
  ]
};

const doubled = scaleIngredients(recipe.ingredients, 4, 8);
doubled.forEach(ing => {
  console.log(`${ing.formattedQuantity} ${ing.unit} ${ing.name}`);
});
// Output:
// 4 cup flour
// 1 1/2 cup sugar
```

---

### Step 3: Add to Your Recipe View

```javascript
import { 
  ingredientScalerComponent, 
  attachScalerListeners 
} from './js/components/ingredientScaler.js';

export function recipeDetailsView(recipe) {
  // 1. Include in your HTML
  const html = `
    <div class="recipe-details">
      ${ingredientScalerComponent(recipe)}
    </div>
  `;
  
  // 2. Attach listeners after render
  setTimeout(() => {
    attachScalerListeners(recipe, (newServings) => {
      console.log(`User changed to ${newServings} servings`);
    });
  }, 0);
  
  return html;
}
```

---

## 📚 Common Use Cases

### Scale Individual Ingredient
```javascript
import { scaleIngredient } from './utils/ingredientScaler.js';

const flour = { name: 'flour', quantity: 2, unit: 'cup' };
const scaled = scaleIngredient(flour, 4, 8);

console.log(scaled.formattedQuantity); // "4"
console.log(scaled.unit);              // "cup"
```

### Get Serving Suggestions
```javascript
import { getServingSuggestions } from './utils/ingredientScaler.js';

const suggestions = getServingSuggestions(4);
console.log(suggestions); // [1, 2, 4, 6, 8, 10, 12]
```

### Handle Unit Conversions
```javascript
import { adjustUnits } from './utils/ingredientScaler.js';

const result = adjustUnits(4, 'tsp');
console.log(result); // { quantity: 1.33, unit: 'tbsp' }
```

---

## 🎨 Styling

The CSS is already linked in `index.html`:
```html
<link rel="stylesheet" href="css/recipe.css" />
```

All styles are scoped to `.ingredient-scaler` class.

---

## 🧪 Testing

Run the test suite:
```bash
# Open demo page and click "Run All Tests" button
client/demo/scalerDemo.html
```

Or run examples in console:
```javascript
// Load examples module
import './js/examples/scalerExamples.js';
```

---

## 📖 Full Documentation

For complete API reference, see:
- **[INGREDIENT_SCALER.md](INGREDIENT_SCALER.md)** - Complete documentation
- **[IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)** - Implementation details

---

## 💡 Tips

### Fraction Display
The system automatically converts decimals to fractions:
- `0.5` → "1/2"
- `0.25` → "1/4"  
- `0.75` → "3/4"
- `0.333` → "1/3"
- `1.5` → "1 1/2"

### Unit Conversions
Automatic upgrades when thresholds are reached:
- `≥3 tsp` → tbsp
- `≥16 tbsp` → cups
- `≥16 oz` → lb
- `≥1000 ml` → liter

### Very Small Amounts
Quantities < 0.0625 show as "pinch"

---

## 🐛 Troubleshooting

### Component Not Rendering?
Make sure CSS is linked:
```html
<link rel="stylesheet" href="css/recipe.css" />
```

### Event Listeners Not Working?
Use `setTimeout` to ensure DOM is ready:
```javascript
setTimeout(() => {
  attachScalerListeners(recipe, callback);
}, 0);
```

### Ingredients Not Scaling?
Check recipe structure:
```javascript
{
  servings: 4,
  ingredients: [
    { name: "flour", quantity: 2, unit: "cup" }
  ]
}
```

---

## ✅ Checklist

Before deployment:
- [ ] Test with real recipe data
- [ ] Verify on mobile devices
- [ ] Check accessibility (keyboard navigation)
- [ ] Test edge cases (0.5 servings, 100 servings)
- [ ] Verify unit conversions
- [ ] Test fraction display

---

**Ready to scale! 🎉**

For questions, check the full documentation or review the examples.
