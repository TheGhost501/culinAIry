/**
 * CulinAIry SPA Entry Point
 * 
 * Initializes the hash-based router and navbar.
 * Handles navigation and auth state changes.
 */

import { updateNavbar } from './components/navbar.js';
import './router.js'; // Router auto-initializes

// Initialize navbar on page load
updateNavbar();

// Update navbar on auth changes
window.addEventListener('authChange', () => {
  updateNavbar();
});
