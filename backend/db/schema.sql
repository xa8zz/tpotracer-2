-- Create scores table
CREATE TABLE IF NOT EXISTS scores (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  wpm FLOAT NOT NULL,
  raw_wpm FLOAT NOT NULL,
  accuracy FLOAT NOT NULL,
  keystrokes JSONB,
  words TEXT[],
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Create index on wpm for faster sorting
CREATE INDEX IF NOT EXISTS scores_wpm_idx ON scores (wpm DESC);

-- Create index on username for faster searching
CREATE INDEX IF NOT EXISTS scores_username_idx ON scores (username); 