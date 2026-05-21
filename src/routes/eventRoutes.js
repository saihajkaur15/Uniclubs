const express = require('express');
const { getEvents, createEvent, rsvpEvent } = require('../controllers/eventController');
const protect = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminMiddleware');
const router = express.Router();
router.get('/', getEvents);
router.post('/', adminOnly, createEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
module.exports = router;
