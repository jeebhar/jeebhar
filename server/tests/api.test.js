import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';

const ADMIN_TOKEN = 'test-token-that-is-long-enough-1234567890';

process.env.NODE_ENV = 'test';
process.env.ADMIN_TOKEN = ADMIN_TOKEN;

let mongo;
let request;
let app;
let available = true;

before(async () => {
  try {
    const [{ MongoMemoryServer }, mongoose, supertestModule, appModule] = await Promise.all([
      import('mongodb-memory-server'),
      import('mongoose'),
      import('supertest'),
      import('../src/app.js'),
    ]);

    mongo = await MongoMemoryServer.create();
    await mongoose.default.connect(mongo.getUri('jeebhar-test'));

    request = supertestModule.default;
    app = appModule.createApp();
  } catch (error) {
    available = false;
    console.warn(`Skipping API tests — in-memory MongoDB unavailable: ${error.message}`);
  }
});

after(async () => {
  if (!available) {
    return;
  }
  const mongoose = await import('mongoose');
  await mongoose.default.connection.dropDatabase();
  await mongoose.default.connection.close();
  await mongo?.stop();
});

describe('GET /api/health', () => {
  it('reports ok with a connected database', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    const response = await request(app).get('/api/health').expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.data.database, 'connected');
  });
});

describe('GET /api/content', () => {
  it('seeds and returns content on first read', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    const response = await request(app).get('/api/content').expect(200);

    assert.equal(response.body.ok, true);
    assert.equal(response.body.data.brandName, 'Jeebhar');
    assert.ok(response.body.data.services.length > 0);
  });
});

describe('PUT /api/content', () => {
  const payload = () => ({
    brandName: 'Jeebhar',
    heroEyebrow: 'For restaurants',
    heroHeading: 'Updated heading',
    heroSubheading: 'Updated subheading',
    mediaKitUrl: '/brand/jeebhar-kit.pdf',
    services: [],
    work: [
      {
        title: 'New work',
        imageUrl: 'https://example.com/a.jpg',
        description: 'Case study',
      },
    ],
    reels: [],
    mediaKitMetrics: [{ label: 'Partners', value: '40+' }],
    contact: {
      address: 'Somewhere',
      email: 'hello@jeebhar.com',
      phone: '+91-90000-00000',
      facebookUrl: '',
      youtubeUrl: '',
      instagramUrl: '',
      tiktokUrl: '',
    },
  });

  it('rejects an unauthenticated write with 401', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    const response = await request(app).put('/api/content').send(payload()).expect(401);
    assert.equal(response.body.ok, false);
  });

  it('rejects a wrong token with 403', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    await request(app)
      .put('/api/content')
      .set('Authorization', 'Bearer wrong-token-of-the-same-length-000000')
      .send(payload())
      .expect(403);
  });

  it('rejects an invalid payload with 400 and field details', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    const response = await request(app)
      .put('/api/content')
      .set('Authorization', `Bearer ${ADMIN_TOKEN}`)
      .send({ ...payload(), heroHeading: '' })
      .expect(400);

    assert.equal(response.body.ok, false);
    assert.ok(response.body.details.some((detail) => detail.field === 'heroHeading'));
  });

  it('accepts an authenticated valid payload and persists it', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    await request(app)
      .put('/api/content')
      .set('x-admin-token', ADMIN_TOKEN)
      .send(payload())
      .expect(200);

    const response = await request(app).get('/api/content').expect(200);
    assert.equal(response.body.data.heroHeading, 'Updated heading');
    assert.equal(response.body.data.work[0].title, 'New work');
  });
});

describe('POST /api/contact', () => {
  it('stores a valid enquiry and returns 201', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    const response = await request(app)
      .post('/api/contact')
      .send({
        name: 'Asha Rao',
        email: 'asha@example.com',
        phone: '+91 90000 00000',
        subject: 'Campaign enquiry',
        body: 'We would like help launching our new outlet.',
      })
      .expect(201);

    assert.equal(response.body.ok, true);
    assert.ok(response.body.data.id);
  });

  it('rejects an invalid enquiry with 400', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    const response = await request(app)
      .post('/api/contact')
      .send({ name: 'A', email: 'nope', phone: 'x', subject: 'y', body: 'z' })
      .expect(400);

    assert.equal(response.body.ok, false);
    assert.ok(response.body.details.length >= 4);
  });
});

describe('unknown routes', () => {
  it('answers 404 in the standard error envelope', async (t) => {
    if (!available) return t.skip('in-memory MongoDB unavailable');

    const response = await request(app).get('/api/does-not-exist').expect(404);

    assert.equal(response.body.ok, false);
    assert.match(response.body.message, /Route not found/);
  });
});
