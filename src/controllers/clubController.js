const Club = require('../models/Club');
const User = require('../models/User');
const prisma = require('../config/prisma');

exports.getClubs = async (req, res, next) => {
  try {
    res.json(await Club.find({
      $or: [
        { status: 'approved' },
        { status: { $exists: false } }
      ]
    }).sort('name'));
  } catch (error) { next(error); }
};

exports.createClub = async (req, res, next) => {
  try { res.status(201).json(await Club.create(req.body)); } catch (error) { next(error); }
};

exports.requestClub = async (req, res, next) => {
  try {
    const { name, category, description, icon, reason } = req.body;

    if (!name || !category || !description) {
      return res.status(400).json({
        success: false,
        message: 'Club name, category and description are required'
      });
    }

    const club = await Club.create({
      name,
      category,
      description,
      icon: icon || undefined,
      members: 0,
      status: 'pending'
    });

    const approvalRequest = await prisma.approvalRequest.create({
      data: {
        type: 'CLUB',
        targetId: club._id.toString(),
        requestedBy: req.user._id.toString(),
        remarks: reason || `New club request: ${name}`
      }
    });

    res.status(201).json({
      success: true,
      message: 'Club request submitted successfully',
      data: {
        club,
        approvalRequest
      }
    });
  } catch (error) { next(error); }
};

exports.joinClub = async (req, res, next) => {
  try {
    const clubId = req.params.clubId;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyJoined = user.joinedClubs.some(joinedClub => joinedClub.toString() === clubId);
    if (alreadyJoined) {
      return res.json({
        success: true,
        message: `You already joined ${club.name}`,
        data: user
      });
    }

    user.joinedClubs.push(club._id);
    club.members += 1;

    await user.save();
    await club.save();

    res.json({
      success: true,
      message: 'Club joined successfully',
      data: user
    });
  } catch (error) { next(error); }
};

exports.unjoinClub = async (req, res, next) => {
  try {
    const clubId = req.params.clubId;
    const club = await Club.findById(clubId);
    if (!club) return res.status(404).json({ success: false, message: 'Club not found' });

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const alreadyJoined = user.joinedClubs.some(joinedClub => joinedClub.toString() === clubId);
    if (!alreadyJoined) {
      return res.json({
        success: true,
        message: `You have not joined ${club.name}`,
        data: user
      });
    }

    user.joinedClubs = user.joinedClubs.filter(joinedClub => joinedClub.toString() !== clubId);
    club.members = Math.max(0, club.members - 1);

    await user.save();
    await club.save();

    res.json({
      success: true,
      message: 'Club unjoined successfully',
      data: user
    });
  } catch (error) { next(error); }
};
