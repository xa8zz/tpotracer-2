import { Router } from 'express';
import { submitScore, getLeaderboard, getUserRank } from '../controllers/scoreController.js';

const router = Router();

// POST /api/submit-score
router.post('/submit-score', submitScore);

// GET /api/leaderboard
router.get('/leaderboard', getLeaderboard);

// GET /api/rank/:username
router.get('/rank/:username', getUserRank);

export default router; 