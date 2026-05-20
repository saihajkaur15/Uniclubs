const Club = require('../models/Club');
const User = require('../models/User');

exports.getClubs = async (req, res, next) => {
  try { res.json(await Club.find().sort('name')); } catch (error) { next(error); }
};

exports.createClub = async (req, res, next) => {
  try { res.status(201).json(await Club.create(req.body)); } catch (error) { next(error); }
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
