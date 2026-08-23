import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../prisma/client.js';
import { JWTPayload } from '../services/auth.service.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email?: string | null;
    phoneNumber?: string | null;
  };
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
      });
      return;
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Your session has expired. Please sign in again.',
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Your session has expired. Please sign in again.',
    });
  }
};
