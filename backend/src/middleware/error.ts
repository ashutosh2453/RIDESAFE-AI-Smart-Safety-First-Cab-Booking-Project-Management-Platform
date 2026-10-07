import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';
  const errorKey = err.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'API_ERROR');

  if (process.env.NODE_ENV !== 'production') {
    console.error('⚠️ [ErrorHandler]', {
      path: req.originalUrl,
      method: req.method,
      status,
      message,
      stack: err.stack,
    });
  }

  res.status(status).json({
    success: false,
    message,
    error: errorKey,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
