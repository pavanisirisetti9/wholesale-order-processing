const request = require('supertest');
const app = require('../src/app');

describe('Products API', () => {
  test('GET /api/products should return a products list', async () => {
    const response = await request(app).get('/api/products');

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.any(Array));
    expect(response.body).toHaveProperty('page');
    expect(response.body).toHaveProperty('limit');
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('totalPages');
    expect(response.body).toHaveProperty('count');
  });

  test('GET /api/products should support pagination', async () => {
    const response = await request(app)
      .get('/api/products')
      .query({ page: 1, limit: 2 });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.page).toBe(1);
    expect(response.body.limit).toBe(2);
    expect(response.body.data.length).toBeLessThanOrEqual(2);
  });

  test('GET /api/products/search should return search results', async () => {
    const response = await request(app)
      .get('/api/products/search')
      .query({ search: 'Java' });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(expect.any(Array));
  });
});
