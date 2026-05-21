const prisma = require('../config/prisma');
const Club = require('../models/Club');
const Event = require('../models/Event');
const User = require('../models/User');

const APPROVAL_TYPES = ['CLUB', 'EVENT'];

function getAdminId(req) {
  return req.user?._id?.toString() || req.user?.id?.toString();
}

function sendSuccess(res, message, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

function normalizeApprovalType(type) {
  return String(type || '').toUpperCase();
}

async function findMongoTarget(type, targetId) {
  if (type === 'CLUB') return Club.findById(targetId);
  if (type === 'EVENT') return Event.findById(targetId);
  return null;
}

async function updateMongoStatusIfSupported(type, targetId, status) {
  const Model = type === 'CLUB' ? Club : type === 'EVENT' ? Event : null;
  if (!Model || !Model.schema.path('status')) return;

  await Model.findByIdAndUpdate(targetId, { status });
}

async function createAdminLog(req, action, targetType, targetId) {
  return prisma.adminActionLog.create({
    data: {
      adminId: getAdminId(req),
      action,
      targetType,
      targetId,
    },
  });
}

exports.getApprovals = async (req, res, next) => {
  try {
    const status = req.query.status?.toUpperCase();
    const type = req.query.type?.toUpperCase();

    const approvals = await prisma.approvalRequest.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    const enrichedApprovals = await Promise.all(approvals.map(async (approval) => {
      const approvalData = { ...approval };

      if (approval.type === 'CLUB') {
        const club = await Club.findById(approval.targetId).select('name category description icon');
        if (club) {
          approvalData.targetName = club.name;
          approvalData.category = club.category;
          approvalData.description = club.description;
          approvalData.icon = club.icon;
        }
      }

      if (approval.type === 'EVENT') {
        const event = await Event.findById(approval.targetId).populate('club', 'name').select('title date club');
        if (event) {
          approvalData.targetName = event.title;
          approvalData.date = event.date;
          approvalData.clubName = event.club?.name;
        }
      }

      if (approval.requestedBy) {
        const user = await User.findById(approval.requestedBy).select('name email');
        if (user) {
          approvalData.requestedByName = user.name;
          approvalData.requestedByEmail = user.email;
        }
      }

      return approvalData;
    }));

    return sendSuccess(res, 'Approval requests fetched successfully', enrichedApprovals);
  } catch (error) {
    next(error);
  }
};

exports.createApproval = async (req, res, next) => {
  try {
    const type = normalizeApprovalType(req.body.type);
    const { targetId, requestedBy, remarks } = req.body;

    if (!APPROVAL_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'type must be CLUB or EVENT' });
    }

    if (!targetId || !requestedBy) {
      return res.status(400).json({ success: false, message: 'targetId and requestedBy are required' });
    }

    const target = await findMongoTarget(type, targetId);
    if (!target) {
      return res.status(404).json({ success: false, message: `${type.toLowerCase()} target not found` });
    }

    const approval = await prisma.approvalRequest.create({
      data: {
        type,
        targetId,
        requestedBy,
        remarks,
      },
    });

    await createAdminLog(req, 'APPROVAL_REQUEST_CREATED', type, approval.targetId);

    return sendSuccess(res, 'Approval request created successfully', approval, 201);
  } catch (error) {
    next(error);
  }
};

exports.approveRequest = async (req, res, next) => {
  try {
    const existingApproval = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existingApproval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const approval = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        remarks: req.body.remarks ?? existingApproval.remarks,
      },
    });

    await updateMongoStatusIfSupported(approval.type, approval.targetId, 'approved');
    await createAdminLog(req, 'APPROVAL_REQUEST_APPROVED', approval.type, approval.targetId);

    return sendSuccess(res, 'Approval request approved successfully', approval);
  } catch (error) {
    next(error);
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const existingApproval = await prisma.approvalRequest.findUnique({
      where: { id: req.params.id },
    });

    if (!existingApproval) {
      return res.status(404).json({ success: false, message: 'Approval request not found' });
    }

    const approval = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        remarks: req.body.remarks ?? existingApproval.remarks,
      },
    });

    await updateMongoStatusIfSupported(approval.type, approval.targetId, 'rejected');
    await createAdminLog(req, 'APPROVAL_REQUEST_REJECTED', approval.type, approval.targetId);

    return sendSuccess(res, 'Approval request rejected successfully', approval);
  } catch (error) {
    next(error);
  }
};

exports.assignVenue = async (req, res, next) => {
  try {
    const venueName = req.body.venueName || req.body.venue;
    if (!venueName) {
      return res.status(400).json({ success: false, message: 'venueName is required' });
    }

    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const assignment = await prisma.venueAssignment.create({
      data: {
        eventId: event._id.toString(),
        venueName,
        assignedBy: getAdminId(req),
      },
    });

    if (Event.schema.path('location')) {
      event.location = venueName;
      await event.save();
    }

    await createAdminLog(req, 'EVENT_VENUE_ASSIGNED', 'EVENT', event._id.toString());

    return sendSuccess(res, 'Venue assigned successfully', assignment, 201);
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

    return sendSuccess(res, 'Admin action logs fetched successfully', logs);
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
      pendingClubApprovals,
      pendingEventApprovals,
    ] = await Promise.all([
      Club.countDocuments(),
      Event.countDocuments(),
      User.countDocuments(),
      prisma.approvalRequest.count({ where: { status: 'PENDING' } }),
      prisma.approvalRequest.count({ where: { status: 'PENDING', type: 'CLUB' } }),
      prisma.approvalRequest.count({ where: { status: 'PENDING', type: 'EVENT' } }),
    ]);

    return sendSuccess(res, 'Admin stats fetched successfully', {
      totalClubs,
      totalEvents,
      totalUsers,
      pendingApprovals,
      pendingClubApprovals,
      pendingEventApprovals,
    });
  } catch (error) {
    next(error);
  }
};
