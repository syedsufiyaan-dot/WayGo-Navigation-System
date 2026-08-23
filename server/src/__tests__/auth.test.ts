import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../index.js';
import { prisma } from '../prisma/client.js';
import { AuthService } from '../services/auth.service.js';
import { OTPService } from '../services/otp.service.js';

describe('WayGo Authentication & Security Test Suite', () => {
  const testEmail = `testuser_${Date.now()}@waygo.app`;
  const testPhone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
  const testPassword = 'Password123!@#';

  let registeredUserId: string = '';
  let registrationOtp: string = '';

  it('should reject weak passwords during registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Weak Pass User',
        email: 'weakpass@waygo.app',
        password: 'weak',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should register a new user with email and generate registration OTP', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Chennai Commuter',
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.userId).toBeDefined();
    expect(res.body.data.maskedDestination).toBeDefined();

    registeredUserId = res.body.data.userId;
    registrationOtp = res.body.data.otpResult.devOtp;
    expect(registrationOtp).toBeDefined();
    expect(registrationOtp.length).toBe(6);
  });

  it('should reject duplicate email registration', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate Commuter',
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('already registered');
  });

  it('should reject incorrect OTP during registration verification', async () => {
    const res = await request(app)
      .post('/api/auth/verify-registration-otp')
      .send({
        userId: registeredUserId,
        code: '000000',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('incorrect');
  });

  it('should successfully verify registration with correct OTP', async () => {
    const res = await request(app)
      .post('/api/auth/verify-registration-otp')
      .send({
        userId: registeredUserId,
        code: registrationOtp,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.emailVerified).toBe(true);
  });

  it('should enforce single-use OTP and reject reusing the same code', async () => {
    const res = await request(app)
      .post('/api/auth/verify-registration-otp')
      .send({
        userId: registeredUserId,
        code: registrationOtp,
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should allow sign in using registered email and password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.token).toBeDefined();
  });

  it('should return wrong password error message on invalid credentials and offer OTP', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testEmail,
        password: 'IncorrectPassword123!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Wrong password. Please try again.');
    expect(res.body.canLoginWithOtp).toBe(true);
  });

  it('should track failed attempts and lock out account after 5 consecutive strikes', async () => {
    // 4 more failed attempts (1 already executed in previous test)
    for (let i = 0; i < 4; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({
          identifier: testEmail,
          password: 'WrongPassword999!',
        });
    }

    // 5th failed attempt should trigger lockout
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        identifier: testEmail,
        password: 'WrongPassword999!',
      });

    expect(res.status).toBe(423); // 423 Locked
    expect(res.body.locked).toBe(true);
    expect(res.body.remainingMinutes).toBeDefined();
    expect(res.body.canLoginWithOtp).toBe(true);
  });

  it('should allow OTP login even while password login is locked out', async () => {
    // 1. Request Login OTP
    const reqRes = await request(app)
      .post('/api/auth/request-login-otp')
      .send({ identifier: testEmail });

    expect(reqRes.status).toBe(200);
    expect(reqRes.body.success).toBe(true);
    const loginOtp = reqRes.body.data.otpResult.devOtp;

    // 2. Verify Login OTP
    const verifyRes = await request(app)
      .post('/api/auth/verify-login-otp')
      .send({
        userId: registeredUserId,
        code: loginOtp,
      });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.token).toBeDefined();
  });

  it('should support instant 1-click Demo Explorer login', async () => {
    const res = await request(app).post('/api/auth/demo-login');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe('demo@waygo.app');
  });

  it('should protect /api/auth/me against unauthenticated access', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
