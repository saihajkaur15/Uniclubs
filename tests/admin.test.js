jest.mock('../src/models/User', () => ({
  findById: jest.fn(),
  countDocuments: jest.fn(),
}));

jest.mock('../src/models/Club', () => ({
  countDocuments: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/models/Event', () => ({
  countDocuments: jest.fn(),
  findById: jest.fn(),
  schema: { path: jest.fn(() => true) },
}));

jest.mock('../src/config/prisma', () => ({
  approvalRequest: {
    count: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  adminActionLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  venueAssignment: {
    create: jest.fn(),
  },
  announcement: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  $disconnect: jest.fn(),
}));

const jwt = require('jsonwebtoken');
const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Club = require('../src/models/Club');
const Event = require('../src/models/Event');
const prisma = require('../src/config/prisma');

describe('Admin protection API', () => {
  const secret = 'test-secret';
  const studentToken = jwt.sign({ id: 'student-id' }, secret);
  const adminToken = jwt.sign({ id: 'admin-id' }, secret);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = secret;
    Club.countDocuments.mockResolvedValue(2);
    Event.countDocuments.mockResolvedValue(3);
    User.countDocuments.mockResolvedValue(4);
    prisma.approvalRequest.count.mockResolvedValue(1);
  });

  function mockUserLookup(user) {
    User.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue(user),
    });
  }

  it('fails without token', async () => {
    const response = await request(app).get('/api/admin/stats');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('fails with student token', async () => {
    mockUserLookup({ id: 'student-id', _id: 'student-id', role: 'student' });

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('passes with admin token', async () => {
    mockUserLookup({ id: 'admin-id', _id: 'admin-id', role: 'admin' });

    const response = await request(app)
      .get('/api/admin/stats')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.objectContaining({
      totalClubs: 2,
      totalEvents: 3,
      totalUsers: 4,
    }));
  });
});
