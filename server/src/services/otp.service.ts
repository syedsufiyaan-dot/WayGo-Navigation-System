import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { prisma } from '../prisma/client.js';
import { env } from '../config/env.js';

export class OTPService {
  /**
   * Hashes an OTP with a server salt for secure storage
   */
  static hashOTP(code: string): string {
    return crypto
      .createHmac('sha256', env.OTP_SECRET)
      .update(code.trim())
      .digest('hex');
  }

  /**
   * Generates a 6-digit cryptographic random OTP code
   */
  static generateCode(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Masks email or phone number for privacy
   * Example: user@example.com -> u***@example.com
   * Example: +919876543210 -> +91 ******3210
   */
  static maskDestination(dest: string): string {
    if (!dest) return '';
    if (dest.includes('@')) {
      const [user, domain] = dest.split('@');
      if (user.length <= 2) {
        return `${user.charAt(0)}***@${domain}`;
      }
      return `${user.charAt(0)}${'*'.repeat(Math.min(user.length - 2, 4))}${user.slice(-1)}@${domain}`;
    }
    // Phone number
    const cleaned = dest.replace(/\s+/g, '');
    if (cleaned.length >= 8) {
      const prefix = cleaned.startsWith('+91') ? '+91 ' : cleaned.slice(0, 3) + ' ';
      const suffix = cleaned.slice(-4);
      return `${prefix}******${suffix}`;
    }
    return dest.slice(0, 2) + '****' + dest.slice(-2);
  }

  /**
   * Creates, stores and dispatches an OTP
   */
  static async createAndSendOTP({
    userId,
    channel,
    purpose,
    destination,
  }: {
    userId: string;
    channel: 'EMAIL' | 'SMS';
    purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET';
    destination: string;
  }) {
    // 1. Check for 30-second resend cooldown
    const latestOTP = await prisma.oTPVerification.findFirst({
      where: {
        userId,
        purpose,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (latestOTP) {
      const timeSinceCreation = (Date.now() - new Date(latestOTP.createdAt).getTime()) / 1000;
      if (timeSinceCreation < 30) {
        const waitTime = Math.ceil(30 - timeSinceCreation);
        throw new Error(`Please wait ${waitTime} seconds before requesting a new OTP.`);
      }
    }

    // 2. Invalidate previous active OTPs for this user and purpose
    await prisma.oTPVerification.updateMany({
      where: {
        userId,
        purpose,
        usedAt: null,
      },
      data: {
        usedAt: new Date(), // Mark previous as expired/used
      },
    });

    // 3. Generate new 6-digit OTP
    const code = this.generateCode();
    const codeHash = this.hashOTP(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity

    // 4. Save in DB
    const otpRecord = await prisma.oTPVerification.create({
      data: {
        userId,
        channel,
        purpose,
        codeHash,
        expiresAt,
        attemptCount: 0,
      },
    });

    // 5. Send via configured channel
    let deliverySuccess = true;
    let deliveryMessage = '';

    if (channel === 'EMAIL') {
      deliverySuccess = await this.sendEmail(destination, code, purpose);
    } else {
      deliverySuccess = await this.sendSMS(destination, code, purpose);
    }

    // 6. Development logging fallback
    if (env.NODE_ENV !== 'production') {
      console.log(`\n======================================================`);
      console.log(`[WAYGO DEV OTP] To: ${destination} (${channel}) | Purpose: ${purpose}`);
      console.log(`[WAYGO DEV OTP] Code: >>> ${code} <<< (Valid for 5 mins)`);
      console.log(`======================================================\n`);
    }

    return {
      otpId: otpRecord.id,
      channel,
      purpose,
      maskedDestination: this.maskDestination(destination),
      expiresAt,
      // Only attach devOtp in development/test mode for rapid testing convenience
      ...(env.NODE_ENV !== 'production' ? { devOtp: code } : {}),
      deliverySuccess,
    };
  }

  /**
   * Verifies an entered OTP
   */
  static async verifyOTP({
    userId,
    purpose,
    code,
  }: {
    userId: string;
    purpose: 'REGISTRATION' | 'LOGIN' | 'PASSWORD_RESET';
    code: string;
  }): Promise<{ success: boolean; message?: string }> {
    const cleanCode = (code || '').trim();
    if (!cleanCode || cleanCode.length !== 6) {
      return { success: false, message: 'Please enter a valid 6-digit OTP code.' };
    }

    // Find the latest active OTP for this user and purpose
    const activeOTP = await prisma.oTPVerification.findFirst({
      where: {
        userId,
        purpose,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!activeOTP) {
      return {
        success: false,
        message: 'No active OTP found. Please request a new verification code.',
      };
    }

    // Check maximum attempts (5)
    if (activeOTP.attemptCount >= 5) {
      await prisma.oTPVerification.update({
        where: { id: activeOTP.id },
        data: { usedAt: new Date() },
      });
      return {
        success: false,
        message: 'Too many OTP attempts. Please request a new code.',
      };
    }

    // Check expiration (5 minutes)
    if (new Date() > new Date(activeOTP.expiresAt)) {
      await prisma.oTPVerification.update({
        where: { id: activeOTP.id },
        data: { usedAt: new Date() },
      });
      return {
        success: false,
        message: 'The OTP has expired. Request a new OTP.',
      };
    }

    // Verify Hash
    const providedHash = this.hashOTP(cleanCode);
    if (providedHash !== activeOTP.codeHash) {
      // Increment attempt count
      await prisma.oTPVerification.update({
        where: { id: activeOTP.id },
        data: { attemptCount: { increment: 1 } },
      });

      const remainingAttempts = 5 - (activeOTP.attemptCount + 1);
      return {
        success: false,
        message:
          remainingAttempts > 0
            ? `The OTP is incorrect. (${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining)`
            : 'Too many OTP attempts. Please request a new code.',
      };
    }

    // Success! Mark as single-use consumed
    await prisma.oTPVerification.update({
      where: { id: activeOTP.id },
      data: { usedAt: new Date() },
    });

    return { success: true };
  }

  /**
   * Helper to send email via nodemailer
   */
  private static async sendEmail(to: string, code: string, purpose: string): Promise<boolean> {
    if (!env.SMTP_HOST || !env.SMTP_USER) {
      // In development without real SMTP, we log and return true
      return true;
    }

    try {
      const transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });

      const subject =
        purpose === 'REGISTRATION'
          ? 'WayGo - Verify Your Account'
          : purpose === 'LOGIN'
          ? 'WayGo - One-Time Login Code'
          : 'WayGo - Password Reset Code';

      await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h2 style="color: #2563eb; margin: 0;">WayGo – Your Friendly Path Partner</h2>
              <p style="color: #64748b; font-size: 14px; margin: 5px 0;">Compare routes. Save time. Travel smart.</p>
            </div>
            <p>Hello,</p>
            <p>Your verification code for <strong>${purpose.replace('_', ' ')}</strong> is:</p>
            <div style="text-align: center; padding: 16px; background-color: #f1f5f9; border-radius: 6px; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #0f172a; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #64748b; font-size: 13px;">This code will expire in 5 minutes. If you did not request this code, please ignore this email.</p>
          </div>
        `,
      });
      return true;
    } catch (err) {
      console.error('[OTPService] Failed to send email via SMTP:', err);
      return false;
    }
  }

  /**
   * Helper to send real-time SMS via Fast2SMS or Twilio
   */
  private static async sendSMS(to: string, code: string, purpose: string): Promise<boolean> {
    // 1. Fast2SMS (Instant India SMS Gateway)
    if (env.FAST2SMS_API_KEY) {
      try {
        const rawNumber = to.replace(/\D/g, '').slice(-10); // Extract 10-digit Indian number
        const response = await fetch(
          `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(
            env.FAST2SMS_API_KEY
          )}&route=q&message=${encodeURIComponent(`[WayGo] Your verification code is ${code}. Valid for 5 minutes.`)}&language=english&numbers=${encodeURIComponent(
            rawNumber
          )}`,
          { method: 'GET' }
        );
        const data = (await response.json()) as any;
        if (data.return) {
          console.log(`[OTPService] Real-time SMS dispatched via Fast2SMS to ${to}`);
          return true;
        } else {
          console.log(`[OTPService] Fast2SMS Notice: ${data.message}`);
        }
      } catch (err) {
        console.error('[OTPService] Failed to send SMS via Fast2SMS:', err);
      }
    }

    // 2. Twilio (Global SMS Gateway)
    if (env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER) {
      try {
        const auth = Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString('base64');
        const body = new URLSearchParams({
          To: to,
          From: env.TWILIO_PHONE_NUMBER,
          Body: `[WayGo] Your verification code is ${code}. Valid for 5 minutes. Do not share with anyone.`,
        });

        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`,
          {
            method: 'POST',
            headers: {
              Authorization: `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
          }
        );

        if (response.ok) {
          console.log(`[OTPService] Real-time SMS dispatched via Twilio to ${to}`);
          return true;
        } else {
          const errData = await response.text();
          console.error('[OTPService] Twilio SMS Error:', errData);
          return false;
        }
      } catch (err) {
        console.error('[OTPService] Failed to send SMS via Twilio:', err);
        return false;
      }
    }

    // Fallback: In development without active API keys, returns true and prints in dev terminal
    return true;
  }
}
