import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import request from 'supertest';

const ADMIN_TOKEN = 'test-token-that-is-long-enough-1234567890';

process.env.NODE_ENV = 'test';
process.env.ADMIN_TOKEN = ADMIN_TOKEN;
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/jeebhar-test';

const { createApp } = await import('../src/app.js');
const app = createApp();

describe('security headers and CORS', () => {
  it('does not advertise Express and sets Helmet headers', async () => {
    const response = await request(app).get('/api/does-not-exist');

    assert.equal(response.headers['x-powered-by'], undefined);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
  });
});

describe('PUT /api/content authorisation', () => {
  const body = { brandName: 'Jeebhar' };

  it('returns 401 when no token is supplied', async () => {
    const response = await request(app).put('/api/content').send(body).expect(401);

    assert.equal(response.body.ok, false);
    assert.match(response.body.message, /token missing/i);
  });

  it('returns 403 for a token of the same length but wrong value', async () => {
    const response = await request(app)
      .put('/api/content')
      .set('Authorization', `Bearer ${'x'.repeat(ADMIN_TOKEN.length)}`)
      .send(body)
      .expect(403);

    assert.match(response.body.message, /invalid admin token/i);
  });

  it('returns 403 for a token of a different length', async () => {
    await request(app).put('/api/content').set('x-admin-token', 'short').send(body).expect(403);
  });

  it('accepts the token via x-admin-token and proceeds to validation', async () => {
    // A correct token gets past the guard; the empty body then fails the schema,
    // which proves the middleware order is auth -> validate.
    const response = await request(app)
      .put('/api/content')
      .set('x-admin-token', ADMIN_TOKEN)
      .send({})
      .expect(400);

    assert.equal(response.body.ok, false);
    assert.ok(response.body.details.some((detail) => detail.field === 'heroHeading'));
  });
});

describe('POST /api/contact validation', () => {
  it('returns 400 naming every invalid field', async () => {
    const response = await request(app)
      .post('/api/contact')
      .send({ name: 'A', email: 'nope', phone: '!!', subject: 'y', body: 'z' })
      .expect(400);

    const fields = [...new Set(response.body.details.map((detail) => detail.field))].sort();
    assert.deepEqual(fields, ['body', 'email', 'name', 'phone', 'subject']);
    assert.ok(response.body.details.every((detail) => typeof detail.message === 'string'));
  });

  it('returns 400 for malformed JSON rather than crashing', async () => {
    const response = await request(app)
      .post('/api/contact')
      .set('Content-Type', 'application/json')
      .send('{"name":')
      .expect(400);

    assert.equal(response.body.ok, false);
  });
});

describe('GET /api/health', () => {
  it('reports degraded with a 503 while the database is not connected', async () => {
    const response = await request(app).get('/api/health').expect(503);

    assert.equal(response.body.ok, false);
    assert.equal(response.body.data.status, 'degraded');
  });
});

describe('unknown routes', () => {
  it('answers 404 in the shared error envelope', async () => {
    const response = await request(app).get('/api/nope').expect(404);

    assert.equal(response.body.ok, false);
    assert.match(response.body.message, /Route not found: GET \/api\/nope/);
  });
});
