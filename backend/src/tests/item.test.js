import { jest } from '@jest/globals';
import { connectTestDB, clearCollections } from './helpers.js';

// ── ESM-compatible mocks (must be declared before dynamic imports) ────────────
jest.unstable_mockModule('../utils/sendEmail.js', () => ({
  default: jest.fn().mockResolvedValue(true),
}));

jest.unstable_mockModule('../middlewares/rateLimiter.js', () => ({
  authLimiter: (_req, _res, next) => next(),
}));

// Mock S3 so createItem doesn't need real AWS credentials
jest.unstable_mockModule('../config/s3.js', () => ({
  default: {
    send: jest.fn().mockResolvedValue({}),
  },
}));

// Dynamic imports AFTER mocks are registered
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: bcrypt } = await import('bcrypt');

// ─────────────────────────────────────────────────────────────────────────────

let token;

beforeAll(async () => {
  await connectTestDB();
});

beforeEach(async () => {
  await clearCollections();

  // Create a verified user directly — bypasses email verification flow
  const hashedPassword = await bcrypt.hash('password123', 10);
  await User.create({
    name: 'Test User',
    email: 'testuser@iskolarngbayan.pup.edu.ph',
    password: hashedPassword,
    isVerified: true,
  });

  const res = await request(app)
    .post('/api/auth/login')
    .send({
      email: 'testuser@iskolarngbayan.pup.edu.ph',
      password: 'password123',
    });

  token = res.body.data.token;
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/items/createItem', () => {
  it('creates an item and returns 201 with the saved document', async () => {
    const res = await request(app)
      .post('/api/items/createItem')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Lost Wallet')
      .field('description', 'Black leather wallet found near the library')
      .field('category', 'wallet')
      .field('status', 'lost')
      .field('locationId', 'QR-LIB-01');

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Lost Wallet');
    expect(res.body.data.category).toBe('wallet');
    expect(res.body.data.imageUrl).toBeNull();
  });

  it('returns 401 when no token is provided', async () => {
    const res = await request(app)
      .post('/api/items/createItem')
      .field('title', 'Lost Wallet')
      .field('description', 'Test')
      .field('category', 'wallet')
      .field('status', 'lost')
      .field('locationId', 'QR-LIB-01');

    expect(res.statusCode).toBe(401);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/items/createItem')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Lost Wallet');

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/items/getItems', () => {
  beforeEach(async () => {
    // Seed two items
    await request(app)
      .post('/api/items/createItem')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Lost Keys')
      .field('description', 'Car keys with a blue keychain')
      .field('category', 'other')
      .field('status', 'lost')
      .field('locationId', 'QR-GATE-01');

    await request(app)
      .post('/api/items/createItem')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Found ID')
      .field('description', 'Student ID found near canteen')
      .field('category', 'id')
      .field('status', 'found')
      .field('locationId', 'QR-CAN-02');
  });

  it('returns 200 with a paginated list of all items', async () => {
    const res = await request(app)
      .get('/api/items/getItems')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.page).toBe(1);
    expect(res.body.data.pages).toBe(1);
  });

  it('filters items by status correctly', async () => {
    const res = await request(app)
      .get('/api/items/getItems?status=lost')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.items[0].status).toBe('lost');
  });

  it('respects pagination params', async () => {
    const res = await request(app)
      .get('/api/items/getItems?page=1&limit=1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.items).toHaveLength(1);
    expect(res.body.data.total).toBe(2);
    expect(res.body.data.pages).toBe(2);
  });

  it('returns 200 without a token (public route)', async () => {
    const res = await request(app).get('/api/items/getItems');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.items).toHaveLength(2);
  });
});
