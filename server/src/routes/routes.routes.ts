import { Router, Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { RoutingService } from '../services/routing.service.js';
import { prisma } from '../prisma/client.js';
import { env } from '../config/env.js';
import { JWTPayload } from '../services/auth.service.js';

const router = Router();

/**
 * Optional user session extraction (to record history if logged in)
 */
const getOptionalUserId = (req: Request): string | null => {
  try {
    const token =
      req.cookies?.token ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.split(' ')[1]
        : null);

    if (!token) return null;
    const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    return decoded.userId || null;
  } catch {
    return null;
  }
};

// ==========================================
// 1. GET ALL LOCATIONS
// ==========================================
router.get('/locations', async (_req: Request, res: Response): Promise<void> => {
  try {
    const locations = await prisma.location.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    res.status(200).json({
      success: true,
      data: locations,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transit locations.',
    });
  }
});

// ==========================================
// 2. CALCULATE ROUTES & COMPARISONS
// ==========================================
router.post('/calculate', async (req: Request, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      source: z.string().min(1, 'Source location is required.'),
      destination: z.string().min(1, 'Destination location is required.'),
      modeFilter: z.enum(['ALL', 'BUS', 'TRAIN', 'METRO', 'AUTO']).optional().default('ALL'),
      preference: z.enum(['FASTEST', 'CHEAPEST', 'SHORTEST']).optional().default('FASTEST'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.errors[0]?.message || 'Invalid route parameters.',
      });
      return;
    }

    const { source, destination, modeFilter, preference } = parsed.data;

    if (source.toLowerCase().trim() === destination.toLowerCase().trim()) {
      res.status(400).json({
        success: false,
        message: 'Source and destination cannot be the same location. Please choose distinct stations.',
      });
      return;
    }

    // Calculate routes via routing engine
    const calculation = RoutingService.calculateRoutes(source, destination);

    // Apply mode filtering if requested
    let filteredRoutes = calculation.allRoutes;
    if (modeFilter && modeFilter !== 'ALL') {
      filteredRoutes = calculation.allRoutes.filter(
        (r) => r.mode === modeFilter || (modeFilter === 'BUS' && r.mode === 'MULTIMODAL')
      );
      if (filteredRoutes.length === 0) {
        filteredRoutes = calculation.allRoutes.filter((r) => r.mode === modeFilter);
      }
    }

    // Sort according to preference
    filteredRoutes.sort((a, b) => {
      if (preference === 'CHEAPEST') return a.totalFareInr - b.totalFareInr;
      if (preference === 'SHORTEST') return a.totalDistanceKm - b.totalDistanceKm;
      return a.totalTimeMins - b.totalTimeMins; // Default FASTEST
    });

    // Record route search history if user is logged in
    const userId = getOptionalUserId(req);
    if (userId) {
      try {
        const sourceLoc = await prisma.location.findUnique({ where: { name: source } });
        const destLoc = await prisma.location.findUnique({ where: { name: destination } });

        if (sourceLoc && destLoc) {
          // Avoid duplicate insertion if searched in the last 15 seconds
          const recent = await prisma.routeHistory.findFirst({
            where: {
              userId,
              sourceLocationId: sourceLoc.id,
              destinationLocationId: destLoc.id,
              searchedAt: {
                gte: new Date(Date.now() - 15 * 1000),
              },
            },
          });

          if (!recent) {
            await prisma.routeHistory.create({
              data: {
                userId,
                sourceLocationId: sourceLoc.id,
                destinationLocationId: destLoc.id,
                selectedMode: modeFilter,
                selectedPreference: preference,
              },
            });
          }
        }
      } catch (err) {
        console.error('[RouteHistory] Failed to log search:', err);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        source: calculation.source,
        destination: calculation.destination,
        summary: calculation.summary,
        routes: filteredRoutes,
        totalRoutesCount: filteredRoutes.length,
        comparisonChart: calculation.comparisonChart,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Unable to calculate routes between selected points.',
    });
  }
});

export default router;
