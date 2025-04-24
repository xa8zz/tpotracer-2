import db from '../db/index.js';
import cacheService from '../services/cacheService.js';

/**
 * Submit a new score
 * @param {object} req - Request object with score data in body
 * @param {object} res - Response object
 */
export const submitScore = async (req, res) => {
  try {
    const { username, wpm, rawWpm, accuracy, keystrokes, words } = req.body;

    // Validate required fields
    if (!username || wpm === undefined || rawWpm === undefined || accuracy === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert new score
    const query = `
      INSERT INTO scores (username, wpm, raw_wpm, accuracy, keystrokes, words)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, wpm, timestamp
    `;

    const values = [username, wpm, rawWpm, accuracy, JSON.stringify(keystrokes), words];
    const result = await db.query(query, values);

    // Clear the leaderboard cache to ensure fresh data
    cacheService.del('leaderboard:default');

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
};

/**
 * Get the leaderboard
 * @param {object} req - Request object with optional query parameters
 * @param {object} res - Response object
 */
export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const fresh = req.query.fresh === 'true';
    
    // Construct cache key based on query parameters
    const cacheKey = `leaderboard:${search ? search : 'default'}:${limit}`;

    // Check cache first (if fresh flag is not set)
    if (!fresh) {
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        return res.json(cachedData);
      }
    }

    // Build query based on parameters
    let query = `
      SELECT username, wpm, timestamp
      FROM scores
    `;

    const queryParams = [];
    let paramIndex = 1;

    // Add search filter if provided
    if (search) {
      query += ` WHERE username ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Add sorting and limit
    query += `
      ORDER BY wpm DESC
      LIMIT $${paramIndex}
    `;
    queryParams.push(limit);

    // Execute query
    const result = await db.query(query, queryParams);

    // Store in cache
    cacheService.set(cacheKey, result.rows);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
};

/**
 * Get a user's rank on the leaderboard
 * @param {object} req - Request object with username parameter
 * @param {object} res - Response object
 */
export const getUserRank = async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    // Construct cache key
    const cacheKey = `rank:${username}`;
    
    // Check cache first
    const cachedRank = cacheService.get(cacheKey);
    if (cachedRank !== undefined) {
      return res.json({ rank: cachedRank });
    }
    
    // Query to find the user's rank
    const query = `
      WITH ranked_scores AS (
        SELECT 
          username, 
          wpm,
          RANK() OVER (ORDER BY wpm DESC) as rank
        FROM scores
        GROUP BY username, wpm
      )
      SELECT rank FROM ranked_scores
      WHERE username = $1
    `;
    
    const result = await db.query(query, [username]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const rank = result.rows[0].rank;
    
    // Store in cache (10 minute TTL)
    cacheService.set(cacheKey, rank, 600);
    
    res.json({ rank });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
}; 