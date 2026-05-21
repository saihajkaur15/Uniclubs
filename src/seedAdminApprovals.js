require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const prisma = require('./config/prisma');
const User = require('./models/User');
const Club = require('./models/Club');
const Event = require('./models/Event');

async function findRequestedByUser() {
  const adminUser = await User.findOne({ role: 'admin' }).select('_id');
  if (adminUser) return adminUser._id.toString();

  const anyUser = await User.findOne().select('_id');
  return anyUser?._id.toString();
}

async function createApprovalIfMissing(type, targetId, requestedBy, remarks) {
  const existing = await prisma.approvalRequest.findFirst({
    where: {
      type,
      targetId,
      status: 'PENDING',
    },
  });

  if (existing) {
    console.log(`${type} approval already exists for ${targetId}`);
    return existing;
  }

  const approval = await prisma.approvalRequest.create({
    data: {
      type,
      targetId,
      requestedBy,
      remarks,
    },
  });

  console.log(`Created ${type} approval: ${approval.id}`);
  return approval;
}

async function seedAdminApprovals() {
  try {
    await connectDB();

    const requestedBy = await findRequestedByUser();
    if (!requestedBy) {
      throw new Error('No MongoDB user found. Create or sign up one user first.');
    }

    const club = await Club.findOne().sort({ createdAt: -1 });
    const event = await Event.findOne().sort({ createdAt: -1 });

    if (!club) {
      console.log('No MongoDB club found. Skipping CLUB approval seed.');
    } else {
      await createApprovalIfMissing(
        'CLUB',
        club._id.toString(),
        requestedBy,
        `Sample approval request for ${club.name}`
      );
    }

    if (!event) {
      console.log('No MongoDB event found. Skipping EVENT approval seed.');
    } else {
      await createApprovalIfMissing(
        'EVENT',
        event._id.toString(),
        requestedBy,
        `Sample approval request for ${event.title}`
      );
    }

    console.log('Admin approval sample data is ready.');
  } catch (error) {
    console.error('Admin approval seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await mongoose.connection.close();
  }
}

seedAdminApprovals();
