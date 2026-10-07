import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((e) => {
          const path = e.path.join('.') || 'body';
          if (!errors[path]) errors[path] = [];
          errors[path].push(e.message);
        });

        return res.status(422).json({
          success: false,
          message: 'Validation failed for request parameters',
          error: 'VALIDATION_ERROR',
          errors,
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid request body format',
        error: 'BAD_REQUEST',
      });
    }
  };
}
