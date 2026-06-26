import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validateRequest = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validationErrors,
        });
      } else {
        res.status(400).json({
          success: false,
          error: 'Invalid request',
          message: error instanceof Error ? error.message : 'Unknown validation error',
        });
      }
    }
  };
};

// Specific validators for common schemas
export const validateBody = (schema: AnyZodObject) => {
  return validateRequest(schema.pick({ body: schema }));
};

export const validateQuery = (schema: AnyZodObject) => {
  return validateRequest(schema.pick({ query: schema }));
};

export const validateParams = (schema: AnyZodObject) => {
  return validateRequest(schema.pick({ params: schema }));
};