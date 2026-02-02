import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique authentication token using UUID v4
 * @returns {string} A unique token string
 */
export function generateToken() {
  return uuidv4();
}
