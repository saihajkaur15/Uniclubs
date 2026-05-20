const prisma = require('../config/prisma');
const Club = require('../models/Club');
const Event = require('../models/Event');
const User = require('../models/User');

function getAdminId(req) {
  return req.user?._id?.toString() || req.user?.id?.toString();
}

async function createAdminLog(req, action, targetId, details = {}) {
  return prisma.adminActionLog.create({
    data: {
      adminId: getAdminId(req),
      action,
      targetId,
      details,
    },
  });
}

exports.getApprovals = async (req, res, next) => {
  try {
    const status = req.query.status?.toUpperCase();
    const approvals = await prisma.approvalRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: approvals });
  } catch (error) {
    next(error);
  }
};

exports.createApproval = async (req, res, next) => {
  try {
    const { type, targetId, title, description, requestedBy, metadata } = req.body;

    if (!type || !title) {
      return res.status(400).json({ success: false, message: 'type and title are required' });
    }

    const approval = await prisma.approvalRequest.create({
      data: {
        type: type.toUpperCase(),
        targetId,
        title,
        description,
        requestedBy,
        metadata,
      },
    });

    await createAdminLog(req, 'APPROVAL_REQUEST_CREATED', approval.id, {
      type: approval.type,
      title: approval.title,
    });

    res.status(201).json({ success: true, data: approval });
  } catch (error) {
    next(error);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const approval = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        reviewedBy: getAdminId(req),
        reviewedAt: new Date(),
        reason: req.body.reason,
      },
    });

    await createAdminLog(req, 'APPROVAL_REQUEST_APPROVED', approval.id, {
      type: approval.type,
      title: approval.title,
    });

    res.json({ success: true, data: approval });
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const approval = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        reviewedBy: getAdminId(req),
        reviewedAt: new Date(),
        reason: req.body.reason,
      },
    });

    await createAdminLog(req, 'APPROVAL_REQUEST_REJECTED', approval.id, {
      type: approval.type,
      title: approval.title,
      reason: req.body.reason,
    });

    res.json({ success: true, data: approval });
  } catch (error) {
    next(error);
  }
};

exports.assignVenue = async (req, res, next) => {
  try {
    const { venue, notes } = req.body;
    if (!venue) {
      return res.status(400).json({ success: false, message: 'venue is required' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const assignment = await prisma.venueAssignment.create({
      data: {
        eventId: event._id.toString(),
        venue,
        notes,
        assignedBy: getAdminId(req),
      },
    });

    await createAdminLog(req, 'EVENT_VENUE_ASSIGNED', assignment.id, {
      eventId: event._id.toString(),
      eventTitle: event.title,
      venue,
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    next(error);
  }
};

exports.getLogs = async (req, res, next) => {
  try {
    const logs = await prisma.adminActionLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [
      totalClubs,
      totalEvents,
      totalUsers,
      pendingApprovals,
      totalApprovals,
      totalVenueAssignments,
    ] = await Promise.all([
      Club.countDocuments(),
      Event.countDocuments(),
      User.countDocuments(),
      prisma.approvalRequest.count({ where: { status: 'PENDING' } }),
      prisma.approvalRequest.count(),
      prisma.venueAssignment.count(),
    ]);

    res.json({
      success: true,
      data: {
        totalClubs,
        totalEvents,
        totalUsers,
        pendingApprovals,
        totalApprovals,
        totalVenueAssignments,
      },
    });
  } catch (error) {
    next(error);
  }
};
