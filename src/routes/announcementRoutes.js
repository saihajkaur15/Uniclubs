const express = require('express');
const { getAnnouncements } = require('../controllers/announcementController');

const router = express.Router();

router.get('/', getAnnouncements);

module.exports = router;
