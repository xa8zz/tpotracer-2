-- TPO Tracer Database Schema

-- Create scores table if it doesn't exist
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  wpm FLOAT NOT NULL,
  raw_wpm FLOAT NOT NULL,
  accuracy FLOAT NOT NULL,
  keystrokes JSONB,
  words TEXT[],
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_scores_username ON scores(username);

-- Create index on wpm for faster sorting
CREATE INDEX IF NOT EXISTS idx_scores_wpm ON scores(wpm DESC);

-- Index for combined username and timestamp queries
CREATE INDEX IF NOT EXISTS idx_scores_username_timestamp ON scores(username, timestamp DESC);

-- Function to get top scores for each user
CREATE OR REPLACE FUNCTION get_top_scores_per_user(limit_count INTEGER)
RETURNS TABLE (
  id INTEGER,
  username VARCHAR(255),
  wpm FLOAT,
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_scores AS (
    SELECT 
      s.id,
      s.username,
      s.wpm,
      s.timestamp as created_at,
      ROW_NUMBER() OVER (PARTITION BY s.username ORDER BY s.wpm DESC) as rn
    FROM scores s
  )
  SELECT rs.id, rs.username, rs.wpm, rs.created_at
  FROM ranked_scores rs
  WHERE rs.rn = 1
  ORDER BY rs.wpm DESC
  LIMIT limit_count;
END;
$$
LANGUAGE plpgsql; 