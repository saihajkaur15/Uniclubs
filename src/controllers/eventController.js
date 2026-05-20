const Event = require('../models/Event');
const User = require('../models/User');

exports.getEvents = async (req, res, next) => {
  try { res.json(await Event.find().populate('club', 'name icon').sort('date')); } catch (error) { next(error); }
};

exports.createEvent = async (req, res, next) => {
  try { res.status(201).json(await Event.create(req.body)); } catch (error) { next(error); }
};

exports.rsvpEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const hasRsvp = user.rsvpEvents.some(rsvpEvent => rsvpEvent.toString() === event._id.toString());
    if (hasRsvp) {
      user.rsvpEvents.pull(event._id);
      event.attendees.pull(user._id);
    } else {
      user.rsvpEvents.push(event._id);
      event.attendees.push(user._id);
    }
    await user.save();
    await event.save();
    res.json({
      success: true,
      rsvpd: !hasRsvp,
      message: !hasRsvp ? 'RSVP done' : 'RSVP removed',
      data: user
    });
  } catch (error) { next(error); }
};
