const request = require('supertest');
const app = require('../src/app');

describe('Order API Tests', () => {
  test('POST /api/orders rejects missing token', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({});

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      'Access denied. Token is required.'
    );
  });

  test('GET /api/orders/my-orders rejects missing token', async () => {
    const response = await request(app)
      .get('/api/orders/my-orders');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      'Access denied. Token is required.'
    );
  });

  test('GET /api/orders/supplier-orders rejects missing token', async () => {
    const response = await request(app)
      .get('/api/orders/supplier-orders');

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      'Access denied. Token is required.'
    );
  });

  test('PATCH /api/orders/:orderId/status rejects missing token', async () => {
    const response = await request(app)
      .patch('/api/orders/1/status')
      .send({ order_status: 'confirmed' });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe(
      'Access denied. Token is required.'
    );
  });
});
test('POST /api/orders rejects empty items', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testbuyer@example.com',
      password: 'BuyerTest@123'
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send({
      items: [],
      shipping_address: 'Vijayawada'
    });

  expect(response.statusCode).toBe(400);
});
test('POST /api/orders rejects missing shipping address', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testbuyer@example.com',
      password: 'BuyerTest@123'
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send({
      items: [{ product_id: 1, quantity: 1 }]
    });

  expect(response.statusCode).toBe(400);
});
test('POST /api/orders rejects invalid quantity', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testbuyer@example.com',
      password: 'BuyerTest@123'
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await request(app)
    .post('/api/orders')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send({
      items: [{ product_id: 1, quantity: 0 }],
      shipping_address: 'Vijayawada'
    });

  expect(response.statusCode).toBe(400);
});
test('GET /api/orders/supplier-orders rejects buyer access', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testbuyer@example.com',
      password: 'BuyerTest@123'
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await request(app)
    .get('/api/orders/supplier-orders')
    .set('Authorization', `Bearer ${loginResponse.body.token}`);

  expect(response.statusCode).toBe(403);
});
test('PATCH /api/orders/1/status rejects buyer access', async () => {
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testbuyer@example.com',
      password: 'BuyerTest@123'
    });

  expect(loginResponse.statusCode).toBe(200);

  const response = await request(app)
    .patch('/api/orders/1/status')
    .set('Authorization', `Bearer ${loginResponse.body.token}`)
    .send({
      order_status: 'shipped'
    });

  expect(response.statusCode).toBe(403);
});
