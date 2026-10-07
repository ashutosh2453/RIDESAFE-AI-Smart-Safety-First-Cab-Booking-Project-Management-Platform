import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/error';

const app = express();

// Trust proxy for reverse proxies and Vercel edge
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow mobile apps (no origin header), development, listed web origins, or Vercel preview domains
      if (
        !origin ||
        config.corsOrigin.includes(origin) ||
        process.env.NODE_ENV === 'development' ||
        origin.endsWith('.vercel.app')
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Logging
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount API routes (supports both direct /api/* and root /* rewrites)
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Catch-all 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'API route not found',
    error: 'NOT_FOUND',
  });
});

// Centralized error handling
app.use(errorHandler);

export default app;

