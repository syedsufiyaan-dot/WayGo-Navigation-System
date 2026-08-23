import { Router, Request, Response } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { AuthService } from '../services/auth.service.js';
import { OTPService } from '../services/otp.service.js';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';

const router = Router();

// Rate limiter for auth actions
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again in a few minutes.' },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many OTP requests. Please wait a few minutes before trying again.' },
});

/**
 * Cookie options helper for secure sessions
 */
const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: '/',
});

// ==========================================
// 1. REGISTER
// ==========================================
router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(1, 'Please enter your full name.'),
      email: z.string().email('Please enter a valid email address.').optional().or(z.literal('')),
      phoneNumber: z.string().optional().or(z.literal('')),
      password: z.string().min(8, 'Your password must be at least 8 characters long.'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Invalid input data.',
      });
      return;
    }

    const { name, email, phoneNumber, password } = parsed.data;

    const result = await AuthService.register({
      name,
      email: email || undefined,
      phoneNumber: phoneNumber || undefined,
      password,
    });

    res.status(201).json({
      success: true,
      message: `Verification code sent to ${result.maskedDestination}.`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Registration failed. Please try again.',
    });
  }
});

// ==========================================
// 2. VERIFY REGISTRATION OTP
// ==========================================
router.post('/verify-registration-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      userId: z.string().min(1, 'User ID is required.'),
      code: z.string().length(6, 'Please enter a 6-digit OTP code.'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Invalid OTP.',
      });
      return;
    }

    const { userId, code } = parsed.data;
    const { user, token } = await AuthService.verifyRegistrationOTP({ userId, code });

    // Set secure HTTP-only cookie
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Account verified successfully! Welcome to WayGo.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed.',
    });
  }
});

// ==========================================
// 3. LOGIN WITH PASSWORD
// ==========================================
router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      identifier: z.string().min(1, 'Please enter your email address or phone number.'),
      password: z.string().min(1, 'Please enter your password.'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Invalid input data.',
      });
      return;
    }

    const { identifier, password } = parsed.data;
    const result = await AuthService.loginWithPassword({ identifier, password });

    if (result.locked) {
      res.status(423).json({
        success: false,
        locked: true,
        remainingMinutes: result.remainingMinutes,
        remainingSeconds: result.remainingSeconds,
        message: result.message,
        canLoginWithOtp: result.canLoginWithOtp,
        userId: result.userId,
        maskedDestination: result.maskedDestination,
        hasEmail: result.hasEmail,
        hasPhone: result.hasPhone,
      });
      return;
    }

    if (!result.success) {
      res.status(401).json({
        success: false,
        message: result.message || 'Wrong password. Please try again.',
        failedAttempts: result.failedAttempts,
        canLoginWithOtp: result.canLoginWithOtp,
        userId: result.userId,
        maskedDestination: result.maskedDestination,
        hasEmail: result.hasEmail,
        hasPhone: result.hasPhone,
      });
      return;
    }

    // Set secure HTTP-only cookie
    res.cookie('token', result.token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Login failed.',
    });
  }
});

// ==========================================
// 4. REQUEST LOGIN OTP
// ==========================================
router.post('/request-login-otp', otpLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      identifier: z.string().min(1, 'Please enter your registered email address or phone number.'),
      channelPreference: z.enum(['EMAIL', 'SMS']).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Invalid input.',
      });
      return;
    }

    const { identifier, channelPreference } = parsed.data;
    const result = await AuthService.requestLoginOTP({ identifier, channelPreference });

    res.status(200).json({
      success: true,
      message: `Login code sent to ${result.maskedDestination}.`,
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to send login OTP.',
    });
  }
});

// ==========================================
// 5. VERIFY LOGIN OTP
// ==========================================
router.post('/verify-login-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      userId: z.string().min(1, 'User ID is required.'),
      code: z.string().length(6, 'Please enter a 6-digit OTP code.'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Invalid OTP.',
      });
      return;
    }

    const { userId, code } = parsed.data;
    const { user, token } = await AuthService.verifyLoginOTP({ userId, code });

    // Set secure cookie
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Signed in successfully via OTP.',
      user,
      token,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'OTP verification failed.',
    });
  }
});

// ==========================================
// 6. REQUEST PASSWORD RESET OTP
// ==========================================
router.post('/request-reset-otp', otpLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      identifier: z.string().min(1, 'Please enter your registered email or phone.'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Please enter your identifier.' });
      return;
    }

    const result = await AuthService.requestPasswordResetOTP({ identifier: parsed.data.identifier });
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to process request.' });
  }
});

// ==========================================
// 7. VERIFY RESET OTP
// ==========================================
router.post('/verify-reset-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      code: z.string().length(6),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid OTP format.' });
      return;
    }

    const verification = await OTPService.verifyOTP({
      userId: parsed.data.userId,
      purpose: 'PASSWORD_RESET',
      code: parsed.data.code,
    });

    if (!verification.success) {
      res.status(400).json({ success: false, message: verification.message || 'Invalid or expired OTP.' });
      return;
    }

    res.status(200).json({ success: true, message: 'OTP verified. Please enter your new password.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Verification failed.' });
  }
});

// ==========================================
// 8. RESET PASSWORD
// ==========================================
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      code: z.string().length(6),
      newPassword: z.string().min(8, 'New password must be at least 8 characters long.'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: parsed.error.errors[0]?.message || 'Invalid input.' });
      return;
    }

    const { userId, code, newPassword } = parsed.data;
    const result = await AuthService.resetPassword({ userId, code, newPassword });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Password reset failed.' });
  }
});

// ==========================================
// 9. RESEND OTP
// ==========================================
router.post('/resend-otp', otpLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      userId: z.string().min(1),
      purpose: z.enum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET']),
      channel: z.enum(['EMAIL', 'SMS']).optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid resend request.' });
      return;
    }

    const { userId, purpose, channel } = parsed.data;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const chosenChannel = channel || (user.email ? 'EMAIL' : 'SMS');
    const destination = chosenChannel === 'EMAIL' ? user.email : user.phoneNumber;

    if (!destination) {
      res.status(400).json({ success: false, message: 'Destination contact not found.' });
      return;
    }

    const otpResult = await OTPService.createAndSendOTP({
      userId: user.id,
      channel: chosenChannel,
      purpose,
      destination,
    });

    res.status(200).json({
      success: true,
      message: `A new verification code has been sent to ${otpResult.maskedDestination}.`,
      data: otpResult,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Failed to resend OTP.' });
  }
});

// ==========================================
// 10. DEMO EXPLORER LOGIN (1-Click)
// ==========================================
router.post('/demo-login', async (_req: Request, res: Response): Promise<void> => {
  try {
    const demoEmail = 'demo@waygo.app';
    let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!demoUser) {
      // Auto create demo user if not yet created
      const hash = await AuthService.hashPassword('WayGo123!');
      demoUser = await prisma.user.create({
        data: {
          name: 'WayGo Explorer',
          email: demoEmail,
          phoneNumber: '+919876543210',
          passwordHash: hash,
          emailVerified: true,
          phoneVerified: true,
        },
      });
    }

    const token = AuthService.generateToken(demoUser);
    res.cookie('token', token, getCookieOptions());

    res.status(200).json({
      success: true,
      message: 'Signed in as Demo Explorer.',
      user: {
        id: demoUser.id,
        name: demoUser.name,
        email: demoUser.email,
        phoneNumber: demoUser.phoneNumber,
        emailVerified: demoUser.emailVerified,
        phoneVerified: demoUser.phoneVerified,
      },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to initialize demo session.' });
  }
});

// ==========================================
// 11. CURRENT USER SESSION (GET /me)
// ==========================================
router.get('/me', requireAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch session.' });
  }
});

// ==========================================
// 12. LOGOUT
// ==========================================
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: (env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
  });
  res.status(200).json({ success: true, message: 'Signed out successfully.' });
});

export default router;
