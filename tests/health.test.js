const request = require('supertest');
const app = require('../src/app');

describe('Health API', () => {
  it('returns API health status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('UniClubs API running');
  });
});
