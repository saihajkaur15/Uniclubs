const express = require('express');
const { getTeams, createTeam, addMember } = require('../controllers/teamController');
const router = express.Router();
router.get('/', getTeams);
router.post('/', createTeam);
router.post('/:id/members', addMember);
module.exports = router;
