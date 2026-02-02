#!/bin/bash

# CulinAIry Integration Test Suite
# Tests complete frontend-backend integration

BASE_URL="http://localhost:3000/api"
TOKEN=""
USER_ID=""
RECIPE_ID=""

echo "🧪 CulinAIry Integration Test Suite"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Register User
echo "📝 Test 1: Register new user..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test_'$(date +%s)'@example.com",
    "username": "testuser_'$(date +%s)'",
    "password": "test123456"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.data.token // empty')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.data.userId // empty')

if [ ! -z "$TOKEN" ]; then
  echo -e "${GREEN}✓ Registration successful${NC}"
  echo "  Token: ${TOKEN:0:20}..."
  echo "  User ID: $USER_ID"
else
  echo -e "${RED}✗ Registration failed${NC}"
  echo $REGISTER_RESPONSE | jq '.'
  exit 1
fi
echo ""

# Test 2: Create Recipe
echo "📖 Test 2: Create new recipe..."
RECIPE_RESPONSE=$(curl -s -X POST "$BASE_URL/recipes" \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN" \
  -d '{
    "title": "Test Pasta",
    "description": "A simple test pasta recipe",
    "imageUrl": "https://example.com/pasta.jpg",
    "servings": 4,
    "ingredients": [
      {"name": "Pasta", "quantity": 400, "unit": "g"},
      {"name": "Olive Oil", "quantity": 50, "unit": "ml"}
    ],
    "instructions": [
      "Boil water",
      "Cook pasta",
      "Drain and serve"
    ]
  }')

RECIPE_ID=$(echo $RECIPE_RESPONSE | jq -r '.data.id // empty')

if [ ! -z "$RECIPE_ID" ]; then
  echo -e "${GREEN}✓ Recipe created${NC}"
  echo "  Recipe ID: $RECIPE_ID"
else
  echo -e "${RED}✗ Recipe creation failed${NC}"
  echo $RECIPE_RESPONSE | jq '.'
  exit 1
fi
echo ""

# Test 3: Get All Recipes
echo "📚 Test 3: Get all recipes..."
ALL_RECIPES=$(curl -s -X GET "$BASE_URL/recipes" \
  -H "Content-Type: application/json")

RECIPE_COUNT=$(echo $ALL_RECIPES | jq '.data | length')

if [ "$RECIPE_COUNT" -ge 1 ]; then
  echo -e "${GREEN}✓ Fetched recipes${NC}"
  echo "  Total recipes: $RECIPE_COUNT"
else
  echo -e "${RED}✗ Failed to fetch recipes${NC}"
  exit 1
fi
echo ""

# Test 4: Get Single Recipe
echo "🔍 Test 4: Get single recipe..."
SINGLE_RECIPE=$(curl -s -X GET "$BASE_URL/recipes/$RECIPE_ID" \
  -H "Content-Type: application/json")

FETCHED_TITLE=$(echo $SINGLE_RECIPE | jq -r '.data.title // empty')

if [ "$FETCHED_TITLE" = "Test Pasta" ]; then
  echo -e "${GREEN}✓ Recipe fetched${NC}"
  echo "  Title: $FETCHED_TITLE"
else
  echo -e "${RED}✗ Recipe fetch failed${NC}"
  exit 1
fi
echo ""

# Test 5: Update Recipe
echo "✏️  Test 5: Update recipe..."
UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/recipes/$RECIPE_ID" \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN" \
  -d '{
    "title": "Updated Test Pasta",
    "description": "Updated description",
    "imageUrl": "https://example.com/pasta.jpg",
    "servings": 6,
    "ingredients": [
      {"name": "Pasta", "quantity": 600, "unit": "g"},
      {"name": "Olive Oil", "quantity": 75, "unit": "ml"}
    ],
    "instructions": [
      "Boil water",
      "Cook pasta",
      "Drain and serve"
    ]
  }')

UPDATED_TITLE=$(echo $UPDATE_RESPONSE | jq -r '.data.title // empty')

if [ "$UPDATED_TITLE" = "Updated Test Pasta" ]; then
  echo -e "${GREEN}✓ Recipe updated${NC}"
  echo "  New title: $UPDATED_TITLE"
else
  echo -e "${RED}✗ Recipe update failed${NC}"
  exit 1
fi
echo ""

# Test 6: Get My Recipes (Protected)
echo "👤 Test 6: Get my recipes (protected)..."
MY_RECIPES=$(curl -s -X GET "$BASE_URL/recipes/my-recipes" \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN")

MY_RECIPE_COUNT=$(echo $MY_RECIPES | jq '.data | length // 0')

if [ "$MY_RECIPE_COUNT" -ge 1 ]; then
  echo -e "${GREEN}✓ My recipes fetched${NC}"
  echo "  My recipes count: $MY_RECIPE_COUNT"
else
  echo -e "${YELLOW}⚠ No recipes found${NC}"
fi
echo ""

# Test 7: Delete Recipe
echo "🗑️  Test 7: Delete recipe..."
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/recipes/$RECIPE_ID" \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN")

DELETE_MESSAGE=$(echo $DELETE_RESPONSE | jq -r '.data.message // empty')

if [ ! -z "$DELETE_MESSAGE" ]; then
  echo -e "${GREEN}✓ Recipe deleted${NC}"
  echo "  Message: $DELETE_MESSAGE"
else
  echo -e "${RED}✗ Recipe deletion failed${NC}"
  exit 1
fi
echo ""

# Test 8: Logout
echo "🚪 Test 8: Logout..."
LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/logout" \
  -H "Content-Type: application/json" \
  -H "X-Authorization: $TOKEN")

LOGOUT_MESSAGE=$(echo $LOGOUT_RESPONSE | jq -r '.data.message // empty')

if [ ! -z "$LOGOUT_MESSAGE" ]; then
  echo -e "${GREEN}✓ Logged out${NC}"
  echo "  Message: $LOGOUT_MESSAGE"
else
  echo -e "${RED}✗ Logout failed${NC}"
  exit 1
fi
echo ""

echo "===================================="
echo -e "${GREEN}✓ All tests passed!${NC}"
echo "===================================="
