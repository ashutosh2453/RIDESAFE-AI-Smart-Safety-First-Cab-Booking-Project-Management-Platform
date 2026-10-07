import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import apiRouter from './routes';
import { errorHandler } from './middleware/error';

const app = express();

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
      // Allow mobile apps (no origin header) or listed web origins
      if (!origin || config.corsOrigin.includes(origin) || process.env.NODE_ENV === 'development') {
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

// Mount API routes
app.use('/api', apiRouter);

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

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 RideSafe AI Backend running on http://0.0.0.0:${config.port}`);
    console.log(`🛡️ Health check available at http://localhost:${config.port}/api/health`);
  });
}

export default app;
