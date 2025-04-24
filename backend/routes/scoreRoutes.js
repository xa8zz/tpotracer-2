import { Router } from 'express';
import { submitScore, getLeaderboard } from '../controllers/scoreController.js';

const router = Router();

// POST /api/submit-score
router.post('/submit-score', submitScore);

// GET /api/leaderboard
router.get('/leaderboard', getLeaderboard);

export default router; 