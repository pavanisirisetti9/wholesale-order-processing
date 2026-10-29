const request = require('supertest');
const app = require('../src/app');

describe('Supplier API Tests', () => {
  test('POST /api/suppliers/register rejects missing token', async () => {
    const response = await request(app)
      .post('/api/suppliers/register')
      .send({});

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      'Access denied. Token is required.'
    );
  });

  test('POST /api/suppliers/register rejects invalid token', async () => {
    const response = await request(app)
      .post('/api/suppliers/register')
      .set('Authorization', 'Bearer invalid-token')
      .send({ company_name: 'Test Company' });

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Invalid or expired token');
  });

  test('POST /api/suppliers/register rejects missing company name', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testbuyer@example.com',
        password: 'BuyerTest@123'
      });

    expect(loginResponse.statusCode).toBe(200);

    const response = await request(app)
      .post('/api/suppliers/register')
      .set('Authorization', `Bearer ${loginResponse.body.token}`)
      .send({});

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe('Company name is required');
  });
});
