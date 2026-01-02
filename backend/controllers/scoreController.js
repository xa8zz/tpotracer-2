import db from '../db/index.js';
import cacheService from '../services/cacheService.js';
import { validateScore } from '../services/scoreValidationService.js';

/**
 * Submit a new score
 * @param {object} req - Request object with score data in body
 * @param {object} res - Response object
 */
export const submitScore = async (req, res) => {
  try {
    // Destructure data from request body
    const { username, wpm, rawWpm, accuracy, keystrokes, words } = req.body;
    console.log(`[Backend] Received submission for user: ${username}, WPM: ${wpm}`); // Log entry

    // Validate required fields
    if (!username || wpm === undefined || rawWpm === undefined || accuracy === undefined) {
      console.warn('[Backend] Submission rejected: Missing required fields.', req.body);
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate username: 1-15 chars, alphanumeric and underscores.
    const usernameRegex = /^[a-zA-Z0-9_]{1,15}$/;
    if (!usernameRegex.test(username)) {
      console.warn(`[Backend] Submission rejected: Invalid username format for "${username}".`);
      return res.status(400).json({ 
        error: 'Username must be 1-15 characters long and contain only alphanumeric characters and underscores.' 
      });
    }

    // Validate score integrity (anti-cheat checks)
    const validation = validateScore({ wpm, rawWpm, accuracy, keystrokes, words });
    if (!validation.valid) {
      console.warn(`[Backend] Score validation failed for user "${username}": code ${validation.errorCode}`);
      return res.status(400).json({ 
        error: 'Score validation failed',
        invalid: true,
        errorCode: validation.errorCode
      });
    }

    // Prepare data for database insertion
    const query = `
      INSERT INTO scores (username, wpm, raw_wpm, accuracy, keystrokes, words)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, wpm, timestamp
    `;
    // Ensure keystrokes is stringified if it's an object/array
    const values = [username, wpm, rawWpm, accuracy, JSON.stringify(keystrokes), words];

    // Execute the database query
    console.log(`[Backend] Executing insert query for user: ${username}`);
    const result = await db.query(query, values);
    console.log(`[Backend] Score inserted successfully for user: ${username}, ID: ${result.rows[0]?.id}`);

    // --- Cache Invalidation ---
    // Clear all leaderboard cache pages (pagination creates multiple cache keys)
    const deletedLeaderboardCount = cacheService.delByPrefix('leaderboard:');
    console.log(`[Backend] Cleared all leaderboard caches. Deleted count: ${deletedLeaderboardCount}`);

    // Clear the specific user's rank cache
    const userRankKey = `rank:${username}`;
    const deletedRankCount = cacheService.del(userRankKey);
    console.log(`[Backend] Cleared user rank cache ('${userRankKey}'). Deleted count: ${deletedRankCount}`);
    // -------------------------

    // Get the new rank and the WPM of the person above to return immediately
    const rankQuery = `
      WITH distinct_user_scores AS (
        SELECT DISTINCT ON (username) username, wpm, timestamp 
        FROM scores 
        ORDER BY username, wpm DESC, timestamp ASC
      ), ranked_users AS (
        SELECT username, wpm, RANK() OVER (ORDER BY wpm DESC, timestamp ASC) as rank
        FROM distinct_user_scores
      )
      SELECT rank, wpm FROM ranked_users WHERE username = $1;
    `;
    const rankResult = await db.query(rankQuery, [username]);
    const newRank = rankResult.rows[0]?.rank ? parseInt(rankResult.rows[0].rank, 10) : null;

    // Get the WPM of the person ranked just above the user (wpmToBeat)
    let wpmToBeat = null;
    let wpmToBeatRaw = null;
    if (newRank && newRank > 1) {
      const wpmToBeatQuery = `
        WITH distinct_user_scores AS (
          SELECT DISTINCT ON (username) username, wpm, raw_wpm, timestamp 
          FROM scores 
          ORDER BY username, wpm DESC, timestamp ASC
        ), ranked_users AS (
          SELECT username, wpm, raw_wpm, RANK() OVER (ORDER BY wpm DESC, timestamp ASC) as rank
          FROM distinct_user_scores
        )
        SELECT wpm, raw_wpm FROM ranked_users WHERE rank = $1;
      `;
      const wpmToBeatResult = await db.query(wpmToBeatQuery, [newRank - 1]);
      wpmToBeat = wpmToBeatResult.rows[0]?.wpm ? Math.round(wpmToBeatResult.rows[0].wpm) : null;
      wpmToBeatRaw = wpmToBeatResult.rows[0]?.raw_wpm ? Math.round(wpmToBeatResult.rows[0].raw_wpm) : null;
    }

    // Get the fresh top 20 leaderboard (first page for immediate UI update)
    const leaderboardQuery = `
      WITH distinct_user_scores AS (
        SELECT DISTINCT ON (username) username, wpm, timestamp 
        FROM scores 
        ORDER BY username, wpm DESC, timestamp ASC
      )
      SELECT username, wpm, timestamp 
      FROM distinct_user_scores 
      ORDER BY wpm DESC, timestamp ASC
      LIMIT 20;
    `;
    const leaderboardResult = await db.query(leaderboardQuery);

    // Respond with the inserted data, the new rank, wpmToBeat, and the updated leaderboard
    res.status(201).json({ 
      ...result.rows[0], 
      rank: newRank,
      wpmToBeat,
      wpmToBeatRaw,
      leaderboard: leaderboardResult.rows
    });

  } catch (error) {
    console.error('[Backend] Error submitting score:', error); // Log the full error
    console.error('[Backend] Error details:', { // Log context if helpful
      message: error.message,
      stack: error.stack,
      requestBody: req.body // Be cautious logging full body if sensitive data exists
    });
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
    const offset = parseInt(req.query.offset) || 0;
    const search = req.query.search || '';
    const fresh = req.query.fresh === 'true';

    // Construct cache key based on query parameters (including offset for pagination)
    const cacheKey = `leaderboard:${search ? search : 'default'}:${limit}:${offset}`;

    // Check cache first (if fresh flag is not set)
    if (!fresh) {
      const cachedData = cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
      }
       console.log(`Cache miss for ${cacheKey}`);
    } else {
         console.log(`Cache forced refresh for ${cacheKey}`);
    }

    // Build query to get the best score for each user, potentially filtered by search
    let baseQuery = `
      SELECT DISTINCT ON (username)
        username, wpm, timestamp
      FROM scores
    `;
    const queryParams = [];
    let paramIndex = 1;

    if (search) {
      baseQuery += ` WHERE username ILIKE $${paramIndex}`;
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // DISTINCT ON requires ORDER BY username first, then the field determining distinctness (wpm DESC)
    baseQuery += ` ORDER BY username, wpm DESC`;

    // Wrap to apply the overall WPM sorting, limit and offset *after* getting distinct users
    const finalQuery = `
      WITH distinct_user_scores AS (${baseQuery})
      SELECT username, wpm, timestamp
      FROM distinct_user_scores
      ORDER BY wpm DESC
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1};
    `;
    queryParams.push(limit);
    queryParams.push(offset);


    console.log('Executing leaderboard query:', finalQuery);
    console.log('Query params:', queryParams);

    // Execute query
    const result = await db.query(finalQuery, queryParams);

    // Store in cache
    cacheService.set(cacheKey, result.rows);
    console.log(`Cache set for ${cacheKey}`);

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
        console.log(`Cache hit for rank:${username}`);
      return res.json({ rank: cachedRank });
    }
     console.log(`Cache miss for rank:${username}`);

    // Query to find the user's rank based on their best WPM
    const query = `
      WITH user_max_wpm AS (
        SELECT
          username,
          MAX(wpm) as max_wpm
        FROM scores
        GROUP BY username
      ), ranked_users AS (
        SELECT
          user_max_wpm.username,
          RANK() OVER (ORDER BY max_wpm DESC, MIN(scores.timestamp) ASC) as rank
        FROM user_max_wpm
        JOIN scores ON user_max_wpm.username = scores.username AND user_max_wpm.max_wpm = scores.wpm
        GROUP BY user_max_wpm.username, user_max_wpm.max_wpm
      )
      SELECT rank FROM ranked_users
      WHERE username = $1;
    `;

    console.log('Executing rank query for:', username);
    const result = await db.query(query, [username]);

    if (result.rows.length === 0) {
       console.log(`User not found for rank query: ${username}`);
      return res.status(404).json({ error: 'User not found or has no scores' });
    }

    const rank = parseInt(result.rows[0].rank, 10); // Ensure rank is a number

    // Get the WPM of the person ranked just above the user (wpmToBeat)
    let wpmToBeat = null;
    let wpmToBeatRaw = null;
    if (rank && rank > 1) {
      const wpmToBeatQuery = `
        WITH distinct_user_scores AS (
          SELECT DISTINCT ON (username) username, wpm, raw_wpm, timestamp 
          FROM scores 
          ORDER BY username, wpm DESC, timestamp ASC
        ), ranked_users AS (
          SELECT username, wpm, raw_wpm, RANK() OVER (ORDER BY wpm DESC, timestamp ASC) as rank
          FROM distinct_user_scores
        )
        SELECT wpm, raw_wpm FROM ranked_users WHERE rank = $1;
      `;
      const wpmToBeatResult = await db.query(wpmToBeatQuery, [rank - 1]);
      wpmToBeat = wpmToBeatResult.rows[0]?.wpm ? Math.round(wpmToBeatResult.rows[0].wpm) : null;
      wpmToBeatRaw = wpmToBeatResult.rows[0]?.raw_wpm ? Math.round(wpmToBeatResult.rows[0].raw_wpm) : null;
    }

    // Store in cache (10 minute TTL)
    // cacheService.set(cacheKey, rank, 600);
    // console.log(`Cache set for rank:${username}, rank: ${rank}`);

    // Since we now return more than just rank, we shouldn't cache just the number or should update structure
    // For now, let's bypass cache set or update it to object. 
    // To keep it simple and compatible with simple get(), we will just return object without caching for now, 
    // or cache the object.
    
    // Let's modify the cache key content to be an object
    // Note: older cache entries might be just numbers. 
    // Ideally we invalidate old keys or use a new key prefix, but rank:username is standard.
    // If the client expects just { rank }, this is fine. 
    // But we want { rank, wpmToBeat, wpmToBeatRaw }.
    
    const responseData = { rank, wpmToBeat, wpmToBeatRaw };
    // cacheService.set(cacheKey, responseData, 600); // Be careful if existing cache is number
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching user rank:', error);
    res.status(500).json({ error: 'Failed to fetch user rank' });
  }
};