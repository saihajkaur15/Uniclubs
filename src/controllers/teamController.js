const Team = require('../models/Team');

exports.getTeams = async (req, res, next) => {
  try { res.json(await Team.find().sort('-createdAt')); } catch (error) { next(error); }
};

exports.createTeam = async (req, res, next) => {
  try {
    const { name, stream, year, icon, members } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Team name is required' });
    }

    const team = await Team.create({
      name: name.trim(),
      stream: stream || 'General',
      year: year || '1st Year',
      icon: icon || undefined,
      members: Array.isArray(members) ? members : []
    });

    res.status(201).json({
      success: true,
      message: 'Team created successfully',
      data: team
    });
  } catch (error) { next(error); }
};

exports.addMember = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    team.members.push(req.body);
    await team.save();
    res.json({ success: true, team });
  } catch (error) { next(error); }
};
