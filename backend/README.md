# TPO Tracer Backend API

This is the backend API for TPO Tracer, a speed typing test application for X (Twitter) users.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your PostgreSQL database credentials.

3. Initialize the database:
   ```
   npm run init-db
   ```

4. Start the server:
   ```
   npm run dev
   ```

## API Endpoints

### Submit Score

Submits a new typing test score to the leaderboard.

- **URL:** `/api/submit-score`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "johndoe",
    "wpm": 85.5,
    "rawWpm": 90.2,
    "accuracy": 95.3,
    "keystrokes": [
      { "key": "t", "timestamp": 1621234567890 },
      { "key": "e", "timestamp": 1621234567950 }
    ],
    "words": ["the", "quick", "brown", "fox"]
  }
  ```
- **Success Response:**
  - **Code:** 201 Created
  - **Content:**
    ```json
    {
      "id": 123,
      "username": "johndoe",
      "wpm": 85.5,
      "timestamp": "2023-10-20T15:30:45.123Z"
    }
    ```
- **Error Response:**
  - **Code:** 400 Bad Request
  - **Content:**
    ```json
    {
      "error": "Missing required fields"
    }
    ```
  OR
  - **Code:** 500 Internal Server Error
  - **Content:**
    ```json
    {
      "error": "Failed to submit score"
    }
    ```

### Get Leaderboard

Retrieves the leaderboard with top scores.

- **URL:** `/api/leaderboard`
- **Method:** `GET`
- **URL Parameters:**
  - `limit=[number]` - Number of scores to return (default: 20)
  - `search=[string]` - Filter by username
  - `fresh=[boolean]` - Force refresh from database (bypass cache)
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    [
      {
        "username": "speedtyper",
        "wpm": 120.5,
        "timestamp": "2023-10-20T12:30:45.123Z"
      },
      {
        "username": "fastfingers",
        "wpm": 115.2,
        "timestamp": "2023-10-19T10:15:30.456Z"
      }
    ]
    ```
- **Error Response:**
  - **Code:** 500 Internal Server Error
  - **Content:**
    ```json
    {
      "error": "Failed to fetch leaderboard"
    }
    ```

### Get User Rank

Retrieves a specific user's rank on the leaderboard.

- **URL:** `/api/rank/:username`
- **Method:** `GET`
- **URL Parameters:**
  - `username=[string]` - X username
- **Success Response:**
  - **Code:** 200 OK
  - **Content:**
    ```json
    {
      "rank": 42
    }
    ```
- **Error Response:**
  - **Code:** 404 Not Found
  - **Content:**
    ```json
    {
      "error": "User not found"
    }
    ```
  OR
  - **Code:** 500 Internal Server Error
  - **Content:**
    ```json
    {
      "error": "Failed to fetch user rank"
    }
    ```

## Caching

The API implements caching to reduce database load:

- Leaderboard data is cached for up to 5 minutes
- User rank data is cached for up to 10 minutes
- Cache is invalidated when new scores are submitted

## Database Schema

The database uses PostgreSQL with the following schema:

```sql
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
```

## Rate Limiting

To prevent abuse, the API implements the following rate limits:

- Score submission: Maximum 1 submission per user every 30 seconds
- Leaderboard fetching: Maximum 10 requests per minute per IP
- User rank fetching: Maximum 10 requests per minute per IP 