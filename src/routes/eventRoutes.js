const express = require('express');
const { getEvents, createEvent, rsvpEvent } = require('../controllers/eventController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/', getEvents);
router.post('/', createEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
module.exports = router;
