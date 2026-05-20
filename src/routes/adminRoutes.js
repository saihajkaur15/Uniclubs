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

const router = express.Router();

router.use(adminOnly);

router.get('/approvals', getApprovals);
router.post('/approvals', createApproval);
router.patch('/approvals/:id/approve', approveRequest);
router.patch('/approvals/:id/reject', rejectRequest);
router.post('/events/:eventId/venue', assignVenue);
router.get('/logs', getLogs);
router.get('/stats', getStats);

module.exports = router;
