import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';

/**
 * Reads and parses a JSON file
 * @param {string} filepath - Path to the JSON file
 * @returns {Promise<any>} Parsed JSON data
 * @throws {Error} If file cannot be read or parsed
 */
export async function readJSON(filepath) {
  try {
    const data = await readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty object or array depending on filepath
    if (error.code === 'ENOENT') {
      console.warn(`File not found: ${filepath}. Returning empty structure.`);
      // Return appropriate empty structure based on filename
      if (filepath.includes('users.json')) {
        return { users: [], sessions: [] };
      } else if (filepath.includes('recipes.json')) {
        return { recipes: [] };
      }
      return {};
    }
    throw new Error(`Failed to read JSON file ${filepath}: ${error.message}`);
  }
}

/**
 * Writes data to a JSON file with pretty formatting
 * @param {string} filepath - Path to the JSON file
 * @param {any} data - Data to write (will be stringified)
 * @returns {Promise<void>}
 * @throws {Error} If file cannot be written
 */
export async function writeJSON(filepath, data) {
  try {
    // Ensure directory exists before writing
    const dir = dirname(filepath);
    await mkdir(dir, { recursive: true });
    
    // Write JSON with 2-space indentation for readability
    const jsonString = JSON.stringify(data, null, 2);
    await writeFile(filepath, jsonString, 'utf-8');
  } catch (error) {
    throw new Error(`Failed to write JSON file ${filepath}: ${error.message}`);
  }
}
