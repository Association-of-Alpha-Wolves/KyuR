import { jest } from '@jest/globals';
import { connectTestDB, clearCollections } from './helpers.js';

// ── ESM-compatible mocks (must be declared before dynamic imports) ────────────
jest.unstable_mockModule('../utils/sendEmail.js', () => ({
  default: jest.fn().mockResolvedValue(true),
}));

jest.unstable_mockModule('../middlewares/rateLimiter.js', () => ({
  authLimiter: (_req, _res, next) => next(),
}));

// Dynamic imports AFTER mocks are registered
const { default: request } = await import('supertest');
const { default: app } = await import('../app.js');

// ─────────────────────────────────────────────────────────────────────────────

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearCollections();
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201 with a token for a valid PUP email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan dela Cruz',
        email: 'juan.delacruz@iskolarngbayan.pup.edu.ph',
        password: 'password123',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.email).toBe('juan.delacruz@iskolarngbayan.pup.edu.ph');
    expect(res.body.data.isVerified).toBe(false);
  });

  it('returns 400 when a non-PUP email domain is used', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan dela Cruz',
        email: 'juan.delacruz@gmail.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'juan@iskolarngbayan.pup.edu.ph' });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when the email is already registered', async () => {
    const payload = {
      name: 'Juan dela Cruz',
      email: 'juan.delacruz@iskolarngbayan.pup.edu.ph',
      password: 'password123',
    };

    await request(app).post('/api/auth/register').send(payload);
    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Juan dela Cruz',
        email: 'juan.delacruz@iskolarngbayan.pup.edu.ph',
        password: 'password123',
      });
  });

  it('returns 200 with a token for valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan.delacruz@iskolarngbayan.pup.edu.ph',
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('returns 401 for an incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'juan.delacruz@iskolarngbayan.pup.edu.ph',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 for an email that does not exist', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nobody@iskolarngbayan.pup.edu.ph',
        password: 'password123',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
