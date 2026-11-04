const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register - Onboard or register user
router.post('/register', userController.registerUser);

// GET /api/users/profile/:email - Fetch user profile & stats
router.get('/profile/:email', userController.getUserProfile);

// PUT /api/users/profile/:email - Update profile
router.put('/profile/:email', userController.updateUserProfile);

module.exports = router;

