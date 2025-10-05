const fs = require('fs');
const path = require('path');
const request = require('supertest');
const app = require('../src/server');

const DATA_FILE = path.join(__dirname, '..', 'src', 'data', 'expenses.json');

function readData() { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
function writeData(d) { fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2), 'utf8'); }

describe('Expense API', () => {
  let backup;
  beforeAll(() => {
    backup = readData();
  });
  afterAll(() => {
    writeData(backup);
  });

  test('GET /api/expenses returns array', async () => {
    const res = await request(app).get('/api/expenses');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/expenses creates and GET by id', async () => {
    const payload = { amount: 9.99, date: '2025-10-05', note: 'Test', category: 'test' };
    const post = await request(app).post('/api/expenses').send(payload);
    expect(post.statusCode).toBe(201);
    expect(post.body.id).toBeDefined();
    const id = post.body.id;
    const get = await request(app).get(`/api/expenses/${id}`);
    expect(get.statusCode).toBe(200);
    expect(get.body.amount).toBeCloseTo(9.99);
  });

  test('PUT /api/expenses/:id updates', async () => {
    const items = readData();
    const item = items[items.length-1];
    const res = await request(app).put(`/api/expenses/${item.id}`).send({ amount: 20 });
    expect(res.statusCode).toBe(200);
    expect(res.body.amount).toBe(20);
  });

  test('DELETE /api/expenses/:id deletes', async () => {
    const items = readData();
    const item = items[items.length-1];
    const del = await request(app).delete(`/api/expenses/${item.id}`);
    expect([200,204]).toContain(del.statusCode);
    const get = await request(app).get(`/api/expenses/${item.id}`);
    expect(get.statusCode).toBe(404);
  });
});
