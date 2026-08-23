import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';
import { env } from '../config/env.js';
import { OTPService } from './otp.service.js';

export interface JWTPayload {
  userId: string;
  email?: string | null;
  phoneNumber?: string | null;
  name: string;
}

export class AuthService {
  /**
   * Validates strong password rules:
   * Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
   */
  static isStrongPassword(password: string): boolean {
    if (!password || password.length < 8) return false;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    return hasUpper && hasLower && hasNumber && hasSpecial;
  }

  /**
   * Normalises an email address
   */
  static normalizeEmail(email?: string): string | null {
    if (!email) return null;
    const cleaned = email.trim().toLowerCase();
    return cleaned.length > 0 ? cleaned : null;
  }

  /**
   * Normalises phone number to international standard (default India +91)
   */
  static normalizePhone(phone?: string): string | null {
    if (!phone) return null;
    let cleaned = phone.replace(/[\s\-()]/g, '');
    if (!cleaned) return null;

    if (!cleaned.startsWith('+')) {
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        cleaned = '+' + cleaned;
      } else if (cleaned.length === 10) {
        cleaned = '+91' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }
    return cleaned;
  }

  /**
   * Generates a signed JWT token
   */
  static generateToken(user: { id: string; email?: string | null; phoneNumber?: string | null; name: string }): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      phoneNumber: user.phoneNumber,
      name: user.name,
    };
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
  }

  /**
   * Hashes a password with bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Verifies password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Register User with Email or Phone or Both
   */
  static async register({
    name,
    email,
    phoneNumber,
    password,
  }: {
    name: string;
    email?: string;
    phoneNumber?: string;
    password: string;
  }) {
    if (!name || name.trim().length === 0) {
      throw new Error('Please enter your full name.');
    }

    const normEmail = this.normalizeEmail(email);
    const normPhone = this.normalizePhone(phoneNumber);

    if (!normEmail && !normPhone) {
      throw new Error('Please enter a valid email address or phone number.');
    }

    if (!this.isStrongPassword(password)) {
      throw new Error('Your password does not meet the security requirements (min 8 chars, uppercase, lowercase, number, special char).');
    }

    // Check duplicate email
    if (normEmail) {
      const existingEmail = await prisma.user.findUnique({ where: { email: normEmail } });
      if (existingEmail) {
        throw new Error('This email address is already registered.');
      }
    }

    // Check duplicate phone
    if (normPhone) {
      const existingPhone = await prisma.user.findUnique({ where: { phoneNumber: normPhone } });
      if (existingPhone) {
        throw new Error('This phone number is already registered.');
      }
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user (unverified initially)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normEmail,
        phoneNumber: normPhone,
        passwordHash,
        emailVerified: false,
        phoneVerified: false,
      },
    });

    // Send OTP to primary contact (Email preferred if both, else Phone)
    const channel: 'EMAIL' | 'SMS' = normEmail ? 'EMAIL' : 'SMS';
    const destination = normEmail || normPhone!;

    const otpResult = await OTPService.createAndSendOTP({
      userId: user.id,
      channel,
      purpose: 'REGISTRATION',
      destination,
    });

    return {
      userId: user.id,
      name: user.name,
      channel,
      destination,
      maskedDestination: otpResult.maskedDestination,
      otpResult,
    };
  }

  /**
   * Verify Registration OTP
   */
  static async verifyRegistrationOTP({
    userId,
    code,
  }: {
    userId: string;
    code: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    const verification = await OTPService.verifyOTP({
      userId,
      purpose: 'REGISTRATION',
      code,
    });

    if (!verification.success) {
      throw new Error(verification.message || 'The OTP is incorrect.');
    }

    // Mark as verified
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: Boolean(user.email),
        phoneVerified: Boolean(user.phoneNumber),
      },
    });

    const token = this.generateToken(updatedUser);
    return { user: updatedUser, token };
  }

  /**
   * Sign In with Password
   */
  static async loginWithPassword({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }) {
    if (!identifier || !password) {
      throw new Error('Please enter your credentials.');
    }

    const normEmail = this.normalizeEmail(identifier);
    const normPhone = this.normalizePhone(identifier);

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(normEmail ? [{ email: normEmail }] : []),
          ...(normPhone ? [{ phoneNumber: normPhone }] : []),
        ],
      },
    });

    if (!user) {
      throw new Error('No WayGo account was found with this email address or phone number. Please create an account.');
    }

    // Check account lockout
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const remainingSecs = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
      const remainingMins = Math.ceil(remainingSecs / 60);
      return {
        locked: true,
        remainingMinutes: remainingMins,
        remainingSeconds: remainingSecs,
        message: `Account is temporarily locked due to 5 consecutive failed attempts. Please try again in ${remainingMins} minute(s) or login using OTP.`,
        canLoginWithOtp: true,
        userId: user.id,
        maskedDestination: OTPService.maskDestination(user.email || user.phoneNumber || ''),
        hasEmail: Boolean(user.email),
        hasPhone: Boolean(user.phoneNumber),
      };
    }

    // Verify password
    const isMatch = await this.verifyPassword(password, user.passwordHash);

    if (!isMatch) {
      const newFailedCount = user.failedLoginAttempts + 1;
      let lockedUntil: Date | null = null;

      if (newFailedCount >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes lockout
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: newFailedCount,
          lockedUntil,
        },
      });

      if (lockedUntil) {
        return {
          locked: true,
          remainingMinutes: 15,
          remainingSeconds: 900,
          message: 'Account is temporarily locked for 15 minutes due to 5 consecutive failed attempts. You may login using OTP.',
          canLoginWithOtp: true,
          userId: user.id,
          maskedDestination: OTPService.maskDestination(user.email || user.phoneNumber || ''),
          hasEmail: Boolean(user.email),
          hasPhone: Boolean(user.phoneNumber),
        };
      }

      return {
        success: false,
        message: 'Wrong password. Please try again.',
        failedAttempts: newFailedCount,
        canLoginWithOtp: true,
        userId: user.id,
        maskedDestination: OTPService.maskDestination(user.email || user.phoneNumber || ''),
        hasEmail: Boolean(user.email),
        hasPhone: Boolean(user.phoneNumber),
      };
    }

    // Password is correct: reset failed counters
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const token = this.generateToken(updatedUser);
    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
      },
      token,
    };
  }

  /**
   * Request OTP for Login
   */
  static async requestLoginOTP({
    identifier,
    channelPreference,
  }: {
    identifier: string;
    channelPreference?: 'EMAIL' | 'SMS';
  }) {
    const normEmail = this.normalizeEmail(identifier);
    const normPhone = this.normalizePhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(normEmail ? [{ email: normEmail }] : []),
          ...(normPhone ? [{ phoneNumber: normPhone }] : []),
        ],
      },
    });

    if (!user) {
      throw new Error('No WayGo account was found with this email address or phone number. Please create an account.');
    }

    let channel: 'EMAIL' | 'SMS' = 'EMAIL';
    let destination = user.email;

    if (channelPreference === 'SMS' && user.phoneNumber) {
      channel = 'SMS';
      destination = user.phoneNumber;
    } else if (channelPreference === 'EMAIL' && user.email) {
      channel = 'EMAIL';
      destination = user.email;
    } else if (user.email) {
      channel = 'EMAIL';
      destination = user.email;
    } else if (user.phoneNumber) {
      channel = 'SMS';
      destination = user.phoneNumber;
    }

    if (!destination) {
      throw new Error('No valid contact method found for this user.');
    }

    const otpResult = await OTPService.createAndSendOTP({
      userId: user.id,
      channel,
      purpose: 'LOGIN',
      destination,
    });

    return {
      userId: user.id,
      channel,
      maskedDestination: otpResult.maskedDestination,
      hasEmail: Boolean(user.email),
      hasPhone: Boolean(user.phoneNumber),
      otpResult,
    };
  }

  /**
   * Verify Login OTP
   */
  static async verifyLoginOTP({
    userId,
    code,
  }: {
    userId: string;
    code: string;
  }) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found.');
    }

    const verification = await OTPService.verifyOTP({
      userId,
      purpose: 'LOGIN',
      code,
    });

    if (!verification.success) {
      throw new Error(verification.message || 'The OTP is incorrect.');
    }

    // Reset lockout counters upon successful OTP login
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    const token = this.generateToken(updatedUser);
    return {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
      },
      token,
    };
  }

  /**
   * Request Password Reset OTP
   */
  static async requestPasswordResetOTP({
    identifier,
  }: {
    identifier: string;
  }) {
    const normEmail = this.normalizeEmail(identifier);
    const normPhone = this.normalizePhone(identifier);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...(normEmail ? [{ email: normEmail }] : []),
          ...(normPhone ? [{ phoneNumber: normPhone }] : []),
        ],
      },
    });

    // Security: Do not reveal account absence directly
    if (!user) {
      return {
        success: true,
        message: 'If an account exists, a password reset code has been sent.',
        maskedDestination: OTPService.maskDestination(identifier),
      };
    }

    const channel: 'EMAIL' | 'SMS' = user.email ? 'EMAIL' : 'SMS';
    const destination = user.email || user.phoneNumber!;

    const otpResult = await OTPService.createAndSendOTP({
      userId: user.id,
      channel,
      purpose: 'PASSWORD_RESET',
      destination,
    });

    return {
      success: true,
      userId: user.id,
      channel,
      maskedDestination: otpResult.maskedDestination,
      otpResult,
    };
  }

  /**
   * Reset Password with Verified OTP
   */
  static async resetPassword({
    userId,
    code,
    newPassword,
  }: {
    userId: string;
    code: string;
    newPassword: string;
  }) {
    if (!this.isStrongPassword(newPassword)) {
      throw new Error('Your password does not meet the security requirements (min 8 chars, uppercase, lowercase, number, special char).');
    }

    const verification = await OTPService.verifyOTP({
      userId,
      purpose: 'PASSWORD_RESET',
      code,
    });

    if (!verification.success) {
      throw new Error(verification.message || 'The OTP is incorrect or expired.');
    }

    const passwordHash = await this.hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    });

    return { success: true, message: 'Password changed successfully. You can now sign in.' };
  }
}
