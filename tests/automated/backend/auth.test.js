/**
 * Backend API Tests - Authentication
 * 
 * Tests authentication endpoints: register, login, logout
 * Corresponds to manual test cases in: tests/manual/AUTH_TEST_CASES.md
 */

import request from 'supertest';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base URL for API requests
const API_BASE = 'http://localhost:3000';

// Helper to backup and restore users.json
const usersFilePath = join(__dirname, '../../../server/data/users.json');
let usersBackup;

beforeAll(() => {
  // Backup users.json before tests
  usersBackup = readFileSync(usersFilePath, 'utf-8');
});

afterAll(() => {
  // Restore users.json after tests
  writeFileSync(usersFilePath, usersBackup, 'utf-8');
});

describe('Authentication API', () => {
  
  describe('POST /api/auth/register', () => {
    
    test('TC-AUTH-001: Should create new user with valid credentials', async () => {
      const response = await request(API_BASE)
        .post('/api/auth/register')
        .send({
          email: 'automated.test@example.com',
          username: 'automatedtester',
          password: 'TestPassword123!',
          repeatPassword: 'TestPassword123!'
        });
      
      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('automated.test@example.com');
      expect(response.body.data.username).toBe('automatedtester');
      
      // ⚠️ SECURITY ISSUE: Verify password stored as plain text (expected finding)
      const usersData = JSON.parse(readFileSync(usersFilePath, 'utf-8'));
      const newUser = usersData.users.find(u => u.email === 'automated.test@example.com');
      expect(newUser).toBeDefined();
      expect(newUser.password).toBe('TestPassword123!'); // Plain text - CRITICAL SECURITY ISSUE
    });
    
    test('TC-AUTH-002: Should reject duplicate email registration', async () => {
      const response = await request(API_BASE)
        .post('/api/auth/register')
        .send({
          email: 'gordon@ramsay.com', // Existing demo user
          username: 'anothergordon',
          password: 'password123',
          repeatPassword: 'password123'
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/already registered|already exists/i);
    });
    
    test('TC-AUTH-004: Should reject invalid email format', async () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'double@@at.com'
      ];
      
      for (const email of invalidEmails) {
        const response = await request(API_BASE)
          .post('/api/auth/register')
          .send({
            email: email,
            username: 'testuser',
            password: 'password123',
            repeatPassword: 'password123'
          });
        
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toMatch(/invalid email/i);
      }
    });
    
    test('Should reject missing required fields', async () => {
      const response = await request(API_BASE)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // Missing username, password, repeatPassword
        });
      
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
    
  });
  
  describe('POST /api/auth/login', () => {
    
    test('TC-AUTH-005: Should login with valid credentials', async () => {
      const response = await request(API_BASE)
        .post('/api/auth/login')
        .send({
          email: 'gordon@ramsay.com',
          password: 'gordon#1'
        });
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('userId');
      expect(response.body.data).toHaveProperty('username');
      expect(response.body.data).toHaveProperty('email');
      
      // Verify password NOT in response
      expect(response.body.data).not.toHaveProperty('password');
      
      // Verify session created in users.json
      const usersData = JSON.parse(readFileSync(usersFilePath, 'utf-8'));
      const session = usersData.sessions.find(s => s.token === response.body.data.token);
      expect(session).toBeDefined();
      expect(session.userId).toBe(response.body.data.userId);
    });
    
    test('TC-AUTH-006: Should reject invalid credentials', async () => {
      const response = await request(API_BASE)
        .post('/api/auth/login')
        .send({
          email: 'gordon@ramsay.com',
          password: 'wrongpassword'
        });
      
      expect(response.statusCode).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/invalid email or password/i);
    });
    
    test('Should reject non-existent email', async () => {
      const response = await request(API_BASE)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'anypassword'
        });
      
      expect(response.statusCode).toBe(401);
      expect(response.body.error).toMatch(/invalid email or password/i);
    });
    
  });
  
  describe('POST /api/auth/logout', () => {
    
    test('TC-AUTH-008: Should logout and invalidate token', async () => {
      // First login to get token
      const loginResponse = await request(API_BASE)
        .post('/api/auth/login')
        .send({
          email: 'gordon@ramsay.com',
          password: 'gordon#1'
        });
      
      const token = loginResponse.body.data.token;
      expect(token).toBeDefined();
      
      // Logout with token
      const logoutResponse = await request(API_BASE)
        .post('/api/auth/logout')
        .set('X-Authorization', token);
      
      expect(logoutResponse.statusCode).toBe(200);
      
      // Verify session removed from users.json
      const usersData = JSON.parse(readFileSync(usersFilePath, 'utf-8'));
      const session = usersData.sessions.find(s => s.token === token);
      expect(session).toBeUndefined();
      
      // Verify token no longer works for protected endpoints
      const protectedResponse = await request(API_BASE)
        .get('/api/recipes/my-recipes')
        .set('X-Authorization', token);
      
      expect(protectedResponse.statusCode).toBe(401);
    });
    
    test('Should reject logout without token', async () => {
      const response = await request(API_BASE)
        .post('/api/auth/logout');
      
      expect(response.statusCode).toBe(401);
    });
    
  });
  
  describe('GET /api/auth/me', () => {
    
    test('Should return user profile for valid token', async () => {
      // Login first
      const loginResponse = await request(API_BASE)
        .post('/api/auth/login')
        .send({
          email: 'gordon@ramsay.com',
          password: 'gordon#1'
        });
      
      const token = loginResponse.body.data.token;
      
      // Get profile
      const response = await request(API_BASE)
        .get('/api/auth/me')
        .set('X-Authorization', token);
      
      expect(response.statusCode).toBe(200);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data).toHaveProperty('username');
      
      // TC-SEC-009: Verify password NOT in response
      expect(response.body.data).not.toHaveProperty('password');
    });
    
    test('TC-AUTH-007: Should reject request without token', async () => {
      const response = await request(API_BASE)
        .get('/api/auth/me');
      
      expect(response.statusCode).toBe(401);
    });
    
  });
  
});
