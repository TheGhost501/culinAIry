import { readJSON } from '../utils/fileHandler.js';

/**
 * Middleware to authenticate requests using X-Authorization token header
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void}
 */
export async function authenticateToken(req, res, next) {
  try {
    // Get token from X-Authorization header
    const token = req.headers['x-authorization'];

    // Check if token is provided
    if (!token) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    // Read sessions from storage
    const userData = await readJSON('./data/users.json');
    const sessions = userData.sessions || [];

    // Find session with matching token
    const session = sessions.find(s => s.token === token);

    // Validate token exists in sessions
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Attach user info to request object
    req.user = {
      id: session.userId,
      token: token
    };

    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}
