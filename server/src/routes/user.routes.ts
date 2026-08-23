import { Router, Response } from 'express';
import { z } from 'zod';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { prisma } from '../prisma/client.js';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

// ==========================================
// 1. GET FAVORITE ROUTES
// ==========================================
router.get('/favorites', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const favorites = await prisma.favoriteRoute.findMany({
      where: { userId: req.user!.id },
      include: {
        sourceLocation: true,
        destinationLocation: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch favorite routes.' });
  }
});

// ==========================================
// 2. SAVE FAVORITE ROUTE
// ==========================================
router.post('/favorites', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      sourceName: z.string().min(1),
      destName: z.string().min(1),
      preferredMode: z.string().optional().default('ALL'),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Invalid favorite parameters.' });
      return;
    }

    const { sourceName, destName, preferredMode } = parsed.data;

    const sourceLoc = await prisma.location.findUnique({ where: { name: sourceName } });
    const destLoc = await prisma.location.findUnique({ where: { name: destName } });

    if (!sourceLoc || !destLoc) {
      res.status(404).json({ success: false, message: 'Source or destination location not found.' });
      return;
    }

    const favorite = await prisma.favoriteRoute.upsert({
      where: {
        userId_sourceLocationId_destinationLocationId: {
          userId: req.user!.id,
          sourceLocationId: sourceLoc.id,
          destinationLocationId: destLoc.id,
        },
      },
      update: {
        preferredMode,
      },
      create: {
        userId: req.user!.id,
        sourceLocationId: sourceLoc.id,
        destinationLocationId: destLoc.id,
        preferredMode,
      },
      include: {
        sourceLocation: true,
        destinationLocation: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Route saved to your favorites.',
      data: favorite,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to save favorite route.' });
  }
});

// ==========================================
// 3. DELETE FAVORITE ROUTE
// ==========================================
router.delete('/favorites/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    const existing = await prisma.favoriteRoute.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ success: false, message: 'Saved route not found.' });
      return;
    }

    await prisma.favoriteRoute.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Route removed from favorites.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete favorite route.' });
  }
});

// ==========================================
// 4. GET ROUTE SEARCH HISTORY
// ==========================================
router.get('/history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const history = await prisma.routeHistory.findMany({
      where: { userId: req.user!.id },
      include: {
        sourceLocation: true,
        destinationLocation: true,
      },
      orderBy: { searchedAt: 'desc' },
      take: 50,
    });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch route history.' });
  }
});

// ==========================================
// 5. CLEAR ALL ROUTE HISTORY
// ==========================================
router.delete('/history', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await prisma.routeHistory.deleteMany({
      where: { userId: req.user!.id },
    });

    res.status(200).json({
      success: true,
      message: 'Search history cleared successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to clear history.' });
  }
});

// ==========================================
// 6. DELETE SINGLE HISTORY ITEM
// ==========================================
router.delete('/history/:id', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);

    await prisma.routeHistory.deleteMany({
      where: { id, userId: req.user!.id },
    });

    res.status(200).json({
      success: true,
      message: 'History record deleted.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
});

export default router;
