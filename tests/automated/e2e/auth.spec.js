/**
 * E2E Tests - Authentication Flows
 * 
 * Tests complete user flows for registration, login, and logout
 * Corresponds to: tests/manual/AUTH_TEST_CASES.md
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication User Flows', () => {
  
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for clean state
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });
  
  test('TC-AUTH-001: User registration flow', async ({ page }) => {
    await page.goto('/#/register');
    
    // Wait for form to load
    await expect(page.locator('h2')).toContainText(/register|sign up/i);
    
    // Fill registration form
    await page.fill('input[name="email"], input[type="email"]', `e2e.test.${Date.now()}@example.com`);
    await page.fill('input[name="username"]', 'e2etester');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="repeatPassword"]', 'TestPassword123!');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to recipes page
    await expect(page).toHaveURL(/#\/recipes/);
    
    // Verify success (user should be able to see recipes)
    await expect(page.locator('h1, h2')).toContainText(/recipes/i);
  });
  
  test('TC-AUTH-003: Password mismatch validation', async ({ page }) => {
    await page.goto('/#/register');
    
    await page.fill('input[name="email"], input[type="email"]', 'test@example.com');
    await page.fill('input[name="username"]', 'testuser');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="repeatPassword"]', 'password456'); // Different
    
    await page.click('button[type="submit"]');
    
    // Verify error message appears
    await expect(page.locator('.error, [class*="error"]')).toContainText(/passwords do not match/i);
  });
  
  test('TC-AUTH-005: Successful login flow', async ({ page }) => {
    await page.goto('/#/login');
    
    // Fill login form with demo credentials
    await page.fill('input[name="email"], input[type="email"]', 'gordon@ramsay.com');
    await page.fill('input[name="password"], input[type="password"]', 'gordon#1');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Wait for redirect
    await page.waitForURL(/#\/recipes/);
    
    // Verify navbar shows logged-in state
    await expect(page.locator('nav')).toContainText(/my recipes/i);
    await expect(page.locator('nav')).toContainText(/logout/i);
    await expect(page.locator('nav')).not.toContainText(/login/i);
    
    // Verify token stored in localStorage
    const token = await page.evaluate(() => localStorage.getItem('culinairy_token'));
    expect(token).toBeTruthy();
    expect(token.length).toBeGreaterThan(10); // UUID length check
  });
  
  test('TC-AUTH-006: Invalid credentials rejection', async ({ page }) => {
    await page.goto('/#/login');
    
    await page.fill('input[name="email"], input[type="email"]', 'gordon@ramsay.com');
    await page.fill('input[name="password"], input[type="password"]', 'wrongpassword');
    
    await page.click('button[type="submit"]');
    
    // Should NOT redirect
    await expect(page).toHaveURL(/#\/login/);
    
    // Error message should appear
    await expect(page.locator('.error, [class*="error"]')).toContainText(/invalid/i);
    
    // Navbar should still show logged-out state
    await expect(page.locator('nav')).toContainText(/login/i);
    
    // No token in localStorage
    const token = await page.evaluate(() => localStorage.getItem('culinairy_token'));
    expect(token).toBeNull();
  });
  
  test('TC-AUTH-007: Protected route redirect', async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto('/#/create-recipe');
    
    // Should redirect to login
    await page.waitForURL(/#\/login/);
    
    await expect(page.locator('h2')).toContainText(/login/i);
  });
  
  test('TC-AUTH-008: Logout flow', async ({ page }) => {
    // First login
    await page.goto('/#/login');
    await page.fill('input[name="email"], input[type="email"]', 'gordon@ramsay.com');
    await page.fill('input[name="password"], input[type="password"]', 'gordon#1');
    await page.click('button[type="submit"]');
    await page.waitForURL(/#\/recipes/);
    
    // Verify logged in
    await expect(page.locator('nav')).toContainText(/logout/i);
    const tokenBefore = await page.evaluate(() => localStorage.getItem('culinairy_token'));
    expect(tokenBefore).toBeTruthy();
    
    // Click logout
    await page.click('button:has-text("Logout"), a:has-text("Logout")');
    
    // Wait for redirect to home
    await page.waitForURL(/\/#\/?$/);
    
    // Verify navbar shows logged-out state
    await expect(page.locator('nav')).toContainText(/login/i);
    await expect(page.locator('nav')).not.toContainText(/my recipes/i);
    
    // Verify token removed from localStorage
    const tokenAfter = await page.evaluate(() => localStorage.getItem('culinairy_token'));
    expect(tokenAfter).toBeNull();
    
    // Verify cannot access protected routes
    await page.goto('/#/my-recipes');
    await page.waitForURL(/#\/login/);
  });
  
  test('Multiple login/logout cycles', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      // Login
      await page.goto('/#/login');
      await page.fill('input[name="email"], input[type="email"]', 'gordon@ramsay.com');
      await page.fill('input[name="password"], input[type="password"]', 'gordon#1');
      await page.click('button[type="submit"]');
      await page.waitForURL(/#\/recipes/);
      
      // Verify logged in
      await expect(page.locator('nav')).toContainText(/logout/i);
      
      // Logout
      await page.click('button:has-text("Logout"), a:has-text("Logout")');
      await page.waitForURL(/\/#\/?$/);
      
      // Verify logged out
      await expect(page.locator('nav')).toContainText(/login/i);
    }
  });
  
});
