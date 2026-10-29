const request = require('supertest');
const app = require('../src/app');

describe('Authentication API', () => {
  test('GET /api/health should return healthy status', async () => {
    const response = await request(app).get('/api/health');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Server is healthy');
  });

  test('POST /api/auth/login should reject invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid-user@example.com',
        password: 'WrongPassword@123',
      });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid email or password');
  });

  test('POST /api/auth/login should return a token for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testbuyer@example.com',
        password: 'BuyerTest@123',
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body.data.role).toBe('buyer');
  });

  test('GET /api/auth/profile should accept a valid token', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testbuyer@example.com',
        password: 'BuyerTest@123',
      });

    expect(loginResponse.statusCode).toBe(200);

    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Token verified successfully');
    expect(response.body.user.user_id).toBe(4);
    expect(response.body.user.role).toBe('buyer');
  });

  test('GET /api/auth/profile should reject a missing token', async () => {
    const response = await request(app).get('/api/auth/profile');

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Access denied. Token is required.');
  });

  test('GET /api/auth/profile should reject an invalid token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', 'Bearer invalid-token-123');

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired token');
  });
});
