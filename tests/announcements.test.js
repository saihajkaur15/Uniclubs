jest.mock('../src/config/prisma', () => ({
  announcement: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
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
  $disconnect: jest.fn(),
}));

const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

describe('Announcements API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns announcements list', async () => {
    prisma.announcement.findMany.mockResolvedValue([
      {
        id: 'announcement-1',
        title: 'Test Announcement',
        description: 'Test description',
        imageUrl: 'https://example.com/poster.png',
        createdBy: 'admin-id',
        createdAt: new Date(),
      },
    ]);

    const response = await request(app).get('/api/announcements');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data).toHaveLength(1);
  });
});
