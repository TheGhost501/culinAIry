import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readJSON, writeJSON } from '../utils/fileHandler.js';
import { generateToken } from '../utils/tokenGenerator.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Simple email validation regex
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * POST /register
 * Register a new user
 * Body: { email, username, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validate required fields
    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Email, username, and password are required' });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Read users from storage
    const userData = await readJSON('./data/users.json');
    const users = userData.users || [];

    // Check if email already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      email,
      username,
      password, // Note: In production, passwords should be hashed (bcrypt)
      createdAt: new Date().toISOString()
    };

    // Add user to storage
    users.push(newUser);
    await writeJSON('./data/users.json', { ...userData, users });

    return res.status(201).json({
      data: {
        userId: newUser.id,
        email: newUser.email,
        username: newUser.username,
        message: 'User registered successfully'
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /login
 * Login and get authentication token
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Read users from storage
    const userData = await readJSON('./data/users.json');
    const users = userData.users || [];

    // Find user by email
    const user = users.find(u => u.email === email);

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken();

    // Create session
    const session = {
      token,
      userId: user.id,
      createdAt: new Date().toISOString()
    };

    // Store session in storage
    const sessions = userData.sessions || [];
    sessions.push(session);
    await writeJSON('./data/users.json', { ...userData, sessions });

    return res.status(200).json({
      data: {
        token,
        userId: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /logout
 * Logout and invalidate token (protected route)
 */
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers['x-authorization'];

    // Read users data
    const userData = await readJSON('./data/users.json');
    const sessions = userData.sessions || [];

    // Remove token from sessions
    const updatedSessions = sessions.filter(s => s.token !== token);

    // Update storage
    await writeJSON('./data/users.json', { ...userData, sessions: updatedSessions });

    return res.status(200).json({ data: { message: 'Logged out successfully' } });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

/**
 * GET /me
 * Get current user profile (protected route)
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Read users from storage
    const userData = await readJSON('./data/users.json');
    const users = userData.users || [];

    // Find current user
    const user = users.find(u => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user info without password
    return res.status(200).json({
      data: {
        userId: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
