import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config(); // fallback

const envSchema = z.object({
  PORT: z.coerce.number().default(5000),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  JWT_SECRET: z.string().default('waygo_jwt_secret_development_key_chennai_2026'),
  OTP_SECRET: z.string().default('waygo_otp_secret_development_key_chennai_2026'),
  DATABASE_URL: z.string().default('file:../../prisma/dev.db'),
  
  // SMTP
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().optional().default(587),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  SMTP_FROM: z.string().optional().default('WayGo Chennai <no-reply@waygo.app>'),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().optional().default(''),
  TWILIO_AUTH_TOKEN: z.string().optional().default(''),
  TWILIO_PHONE_NUMBER: z.string().optional().default(''),

  // Fast2SMS (Instant India SMS Gateway)
  FAST2SMS_API_KEY: z.string().optional().default(''),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000), // 15 mins
  RATE_LIMIT_MAX: z.coerce.number().default(500),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(30),
});

export const env = envSchema.parse(process.env);
