export type GameState = 'waiting' | 'playing' | 'completed';

export interface Keystroke {
  key: string;
  timestamp: number;
}

export interface GameResult {
  username: string;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  keystrokes: Keystroke[];
  words: string[];
}

export interface LeaderboardEntry {
  username: string;
  wpm: number;
  timestamp: number;
}

export interface ScoreData {
  wpm: number;
  rawWpm: number;
  accuracy: number;
}