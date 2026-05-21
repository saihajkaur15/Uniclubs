jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
}));

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth API', () => {
  const testUser = {
    id: 'user-123',
    name: 'Test Student',
    email: 'test-student@uniclubs.test',
    password: 'hashed-password',
    role: 'student',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  });

  it('returns a token for valid login', async () => {
    User.findOne.mockResolvedValue(testUser);
    bcrypt.compare.mockResolvedValue(true);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'TestPass123!' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user.email).toBe(testUser.email);
  });

  it('rejects wrong password', async () => {
    User.findOne.mockResolvedValue(testUser);
    bcrypt.compare.mockResolvedValue(false);

    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects missing fields', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
