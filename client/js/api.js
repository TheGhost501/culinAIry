import { getToken, saveToken, clearToken } from './auth.js';

/**
 * CulinAIry API Service
 * 
 * Centralized HTTP client for all API calls.
 * Handles:
 * - Base URL configuration
 * - JSON parsing
 * - Auth headers (X-Authorization)
 * - Error handling and user feedback
 * - Loading state management
 */

const BASE_URL = 'http://localhost:3000/api/';

/**
 * Get authorization headers with token from localStorage
 */
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

/**
 * Generic request function with error handling
 * 
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint (e.g., '/auth/login')
 * @param {object} body - Request body (optional)
 * @param {boolean} requiresAuth - Whether X-Authorization header is needed
 * @returns {object|null} Parsed JSON response or null
 * @throws {Error} API errors with status and details
 */
async function request(method, endpoint, body = null, requiresAuth = false) {
  const headers = requiresAuth ? getAuthHeaders() : { 'Content-Type': 'application/json' };

  const init = {
    method,
    headers,
  };

  if (body) {
    init.body = JSON.stringify(body);
  }

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
      error.response = response;
      throw error;
    }

    // Handle empty responses.
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    // Re-throw network errors and API errors.
    throw error;
  }
}

/**
 * HTTP method wrappers for clean API method syntax
 */
function get(endpoint, requiresAuth = false) {
  return request('GET', endpoint, null, requiresAuth);
}

function post(endpoint, body, requiresAuth = false) {
  return request('POST', endpoint, body, requiresAuth);
}

function put(endpoint, body, requiresAuth = false) {
  return request('PUT', endpoint, body, requiresAuth);
}

function patch(endpoint, body, requiresAuth = false) {
  return request('PATCH', endpoint, body, requiresAuth);
}

function del(endpoint, requiresAuth = false) {
  return request('DELETE', endpoint, null, requiresAuth);
}

/**
 * API Client - organized by resource
 * Each method returns { data, error } for consistent handling
 */
export const api = {
  /**
   * Authentication endpoints
   */
  auth: {
    /**
     * Register new user
     * @param {string} email - User email
     * @param {string} username - Username
     * @param {string} password - Password
     * @returns {object} User data with token
     */
    async register(email, username, password) {
      try {
        const response = await post('auth/register', { email, username, password });
        const token = response?.data?.token;
        const userId = response?.data?.userId;
        
        if (token) {
          saveToken(token, userId);
        }
        
        return { data: response?.data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    /**
     * Login user
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {object} User data with token
     */
    async login(email, password) {
      try {
        const response = await post('auth/login', { email, password });
        const token = response?.data?.token;
        const userId = response?.data?.userId;
        
        if (token) {
          saveToken(token, userId);
        }
        
        return { data: response?.data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    /**
     * Logout user
     */
    async logout() {
      try {
        // Try to notify server, but don't fail if it doesn't work
        await post('auth/logout', {}, true).catch(() => {});
        clearToken();
        return { data: { message: 'Logged out' }, error: null };
      } catch (error) {
        // Clear token locally anyway
        clearToken();
        return { data: null, error: error.message };
      }
    },

    /**
     * Get current authenticated user profile
     */
    async getCurrentUser() {
      try {
        const response = await get('auth/me', true);
        return { data: response?.data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },
  },

  /**
   * Recipe endpoints
   */
  recipes: {
    /**
     * Get all public recipes
     */
    async getAll() {
      try {
        const response = await get('recipes');
        return { data: response?.data || [], error: null };
      } catch (error) {
        return { data: [], error: error.message };
      }
    },

    /**
     * Get recipes owned by current user
     */
    async getMyRecipes() {
      try {
        const response = await get('recipes/my-recipes', true);
        return { data: response?.data || [], error: null };
      } catch (error) {
        return { data: [], error: error.message };
      }
    },

    /**
     * Get single recipe by ID
     * @param {string} id - Recipe ID
     */
    async getById(id) {
      try {
        const response = await get(`recipes/${encodeURIComponent(id)}`);
        return { data: response?.data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    /**
     * Create new recipe
     * @param {object} recipeData - Recipe details
     */
    async create(recipeData) {
      try {
        const response = await post('recipes', recipeData, true);
        return { data: response?.data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    /**
     * Update recipe by ID
     * @param {string} id - Recipe ID
     * @param {object} recipeData - Updated recipe details
     */
    async update(id, recipeData) {
      try {
        const response = await put(`recipes/${encodeURIComponent(id)}`, recipeData, true);
        return { data: response?.data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },

    /**
     * Delete recipe by ID
     * @param {string} id - Recipe ID
     */
    async delete(id) {
      try {
        const response = await del(`recipes/${encodeURIComponent(id)}`, true);
        return { data: response?.data, error: null };
      } catch (error) {
        return { data: null, error: error.message };
      }
    },
  },
};
