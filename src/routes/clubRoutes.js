const express = require('express');
const { getClubs, createClub, joinClub, unjoinClub } = require('../controllers/clubController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', getClubs);
router.post('/', createClub);
router.post('/:clubId/join', protect, joinClub);
router.post('/:clubId/unjoin', protect, unjoinClub);
module.exports = router;
