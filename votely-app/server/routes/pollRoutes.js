const express = require('express');
const router = express.Router();
const pollController = require('../controllers/pollController');

// GET /api/polls - list all polls with filters (status, creatorEmail, voterEmail, search)
router.get('/', pollController.getAllPolls);

// GET /api/polls/stats - overview KPIs
router.get('/stats', pollController.getDashboardStats);

// GET /api/polls/:identifier - fetch single poll by ID or Code (e.g. VOTE-89X2)
router.get('/:identifier', pollController.getPollDetails);

// POST /api/polls/create - create new poll
router.post('/create', pollController.createPoll);

// POST /api/polls/vote - cast vote with strict one-vote enforcement
router.post('/vote', pollController.voteInPoll);

module.exports = router;

