const Attendance = require('../models/Attendance');
const Event = require('../models/Event');
const mongoose = require('mongoose');

exports.markAttendance = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event id' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const log = await Attendance.create({ user: req.user.id, event: event.id, status: 'Present' });
    await log.populate('event', 'title date location');

    res.status(201).json({
      success: true,
      message: 'Attendance marked',
      data: { log }
    });
  } catch (error) { next(error); }
};

exports.myAttendance = async (req, res, next) => {
  try {
    const logs = await Attendance.find({ user: req.user.id })
      .populate('event', 'title date location')
      .sort('-markedAt');

    res.json({
      success: true,
      message: 'Attendance fetched',
      data: { logs }
    });
  } catch (error) { next(error); }
};
