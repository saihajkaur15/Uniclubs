const express = require('express');
const adminOnly = require('../middleware/adminMiddleware');
const {
  getApprovals,
  createApproval,
  approveRequest,
  rejectRequest,
  assignVenue,
  getLogs,
  getStats,
} = require('../controllers/adminController');
const upload = require('../middleware/uploadMiddleware');
const {
  createAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { createEvent } = require('../controllers/eventController');

const router = express.Router();

router.use(adminOnly);

router.get('/approvals', getApprovals);
router.post('/approvals', createApproval);
router.patch('/approvals/:id/approve', approveRequest);
router.patch('/approvals/:id/reject', rejectRequest);
router.post('/events', createEvent);
router.post('/events/:eventId/venue', assignVenue);
router.get('/logs', getLogs);
router.get('/stats', getStats);
router.post('/announcements', upload.single('image'), createAnnouncement);
router.delete('/announcements/:id', deleteAnnouncement);

module.exports = router;
