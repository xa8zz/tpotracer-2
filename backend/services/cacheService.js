import NodeCache from 'node-cache';
import dotenv from 'dotenv';

dotenv.config();

// Create a new cache instance
const cache = new NodeCache({
  stdTTL: parseInt(process.env.CACHE_TTL) / 1000 || 1800, // Default to 30 minutes if not set
  checkperiod: 120,
});

/**
 * Get a value from the cache
 * @param {string} key - The cache key
 * @returns {*} The cached value or undefined if not found
 */
export const get = (key) => {
  return cache.get(key);
};

/**
 * Set a value in the cache
 * @param {string} key - The cache key
 * @param {*} value - The value to cache
 * @param {number} ttl - Time to live in seconds (optional, uses default if not provided)
 * @returns {boolean} True on success, false on failure
 */
export const set = (key, value, ttl) => {
  return cache.set(key, value, ttl);
};

/**
 * Delete a value from the cache
 * @param {string} key - The cache key to delete
 * @returns {number} Number of deleted entries
 */
export const del = (key) => {
  return cache.del(key);
};

/**
 * Flush the entire cache
 */
export const flush = () => {
  return cache.flushAll();
};

export default {
  get,
  set,
  del,
  flush,
}; 