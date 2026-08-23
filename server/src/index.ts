import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import authRoutes from './routes/auth.routes.js';
import routeRoutes from './routes/routes.routes.js';
import userRoutes from './routes/user.routes.js';

export const app = express();

// Trust proxy for secure cookie handling in local and reverse proxies
app.set('trust proxy', 1);

// Global middleware
// Production serves the frontend from this same Express origin, so CORS is
// only required for the separate Vite development server.
if (env.NODE_ENV !== 'production') {
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
    })
  );
}

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global rate limiting
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    appName: 'WayGo – Your Friendly Path Partner',
    tagline: 'Compare routes. Save time. Travel smart.',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/user', userRoutes);

// 404 fallback
app.use('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `API endpoint not found: ${req.originalUrl}` });
});

// Serve the production React bundle and support client-side routes.
if (env.NODE_ENV === 'production') {
  const clientDistPath = path.resolve(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error. Please try again later.',
    ...(env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
});

// Only start listening if not running inside a test runner (e.g. Supertest)
if (process.env.NODE_ENV !== 'test') {
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`🚀 WayGo Server running on http://localhost:${env.PORT}`);
    console.log(`🌐 Environment: ${env.NODE_ENV}`);
    console.log(`🛣️  Chennai Transit Engine: Active`);
    console.log(`======================================================\n`);
  });
}
