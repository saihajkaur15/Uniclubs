const express = require('express');
const { markAttendance, myAttendance } = require('../controllers/attendanceController');
const protect = require('../middleware/authMiddleware');
const router = express.Router();
router.get('/me', protect, myAttendance);
router.post('/:eventId', protect, markAttendance);
module.exports = router;
