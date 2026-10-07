import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/db';

describe('RideSafe AI Backend End-to-End API Suite', () => {
  let authToken = '';
  let userId = '';
  let testProjectId = '';
  let testTaskId = '';
  let testRideId = '';
  let ridePin = '';

  const testEmail = `test_${Date.now()}@ridesafe.ai`;
  const testPassword = 'Password123!';

  afterAll(async () => {
    // Cleanup test user and associated records
    if (userId) {
      await prisma.user.delete({ where: { id: userId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  // 1. Health check
  it('GET /api/health should return online status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('online');
  });

  // 2. Authentication
  describe('Authentication Module', () => {
    it('POST /api/auth/register should create a new user', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Supertest User',
        email: testEmail,
        password: testPassword,
        phoneNumber: '+91 99999 88888',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
      expect(res.body.data.user.passwordHash).toBeUndefined();

      authToken = res.body.data.token;
      userId = res.body.data.user.id;
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Duplicate User',
        email: testEmail,
        password: testPassword,
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/login should authenticate user and return token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: testPassword,
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login should reject invalid credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: testEmail,
        password: 'WrongPassword!',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should return authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(userId);
      expect(res.body.data.email).toBe(testEmail);
    });
  });

  // 3. Project Management
  describe('Project Management Module', () => {
    it('POST /api/projects should create a new trip project', async () => {
      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Chennai Airport Trip',
          description: 'Flight 6E-204 travel coordination',
          status: 'IN_PROGRESS',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Chennai Airport Trip');
      testProjectId = res.body.data.id;
    });

    it('GET /api/projects should list user projects with task progress', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  // 4. Task Management
  describe('Task Management Module', () => {
    it('POST /api/tasks should create a task under project', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          projectId: testProjectId,
          name: 'Book Cab',
          description: 'Reserve ride via RideSafe',
          priority: 'HIGH',
          status: 'PENDING',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Book Cab');
      testTaskId = res.body.data.id;
    });

    it('PUT /api/tasks/:id should update task status', async () => {
      const res = await request(app)
        .put(`/api/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: 'IN_PROGRESS',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  // 5. Dashboard
  describe('Dashboard Module', () => {
    it('GET /api/dashboard should return unified user analytics', async () => {
      const res = await request(app)
        .get('/api/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overview.totalProjects).toBeGreaterThanOrEqual(1);
      expect(res.body.data.overview.totalTasks).toBeGreaterThanOrEqual(1);
    });
  });

  // 6. SmartMatch & Ride Booking
  describe('RideSafe Cab Booking & Safety Flow', () => {
    it('POST /api/drivers/smartmatch should return ranked candidates', async () => {
      const res = await request(app)
        .post('/api/drivers/smartmatch')
        .send({
          pickup: 'SRM Main Gate',
          destination: 'Chennai Airport',
          rideType: 'SEDAN',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.recommendedDriver).toBeDefined();
      expect(res.body.data.fareDetails.estimatedFare).toBeGreaterThan(0);
    });

    it('POST /api/rides should book ride and generate 4-digit PIN', async () => {
      const res = await request(app)
        .post('/api/rides')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pickup: 'SRM Main Gate',
          destination: 'Chennai Airport',
          landmark: 'Gate 2',
          rideType: 'SEDAN',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.pin).toMatch(/^\d{4}$/);
      expect(res.body.data.driverId).toBeDefined();

      testRideId = res.body.data.id;
      ridePin = res.body.data.pin;
    });

    it('POST /api/rides/:id/verify-pin should start ride when PIN matches', async () => {
      const res = await request(app)
        .post(`/api/rides/${testRideId}/verify-pin`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ pin: ridePin });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('STARTED');
    });

    it('POST /api/rides/:id/verify-vehicle should register verification', async () => {
      const res = await request(app)
        .post(`/api/rides/${testRideId}/verify-vehicle`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ matches: true });

      expect(res.status).toBe(200);
      expect(res.body.data.vehicleMatches).toBe(true);
    });

    it('POST /api/rides/:id/complete should complete the ride', async () => {
      const res = await request(app)
        .post(`/api/rides/${testRideId}/complete`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('POST /api/rides/:id/rating should record rating', async () => {
      const res = await request(app)
        .post(`/api/rides/${testRideId}/rating`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          rating: 5,
          review: 'Excellent ride and verification experience!',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.rating).toBe(5);
    });
  });

  // 7. Safety & AI Assistant
  describe('Safety Center & AI Assistant', () => {
    it('POST /api/trusted-contacts should add a trusted contact', async () => {
      const res = await request(app)
        .post('/api/trusted-contacts')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Guardian Contact',
          phoneNumber: '+91 91234 56789',
          relationship: 'PARENT',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Guardian Contact');
    });

    it('POST /api/ai/chat should return helpful assistance', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'How does Visual Pickup Assistance work?',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.reply).toBeDefined();
    });
  });
});
