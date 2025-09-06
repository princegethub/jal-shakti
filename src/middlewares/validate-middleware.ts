import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

import { validationErrors } from '@/utils/api-error';
import { logger } from '@/logger/logger';
import { tryCatchHandler } from '@/utils/try-catch-handler';

export const validate = (schema: Joi.ObjectSchema) =>
  tryCatchHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);

    if (error) {
      // Build detailed error list
      const errorDetails = error.details.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
        value: err.context?.value,
      }));

      // Development mode - show colored console errors
      if (process.env.NODE_ENV === 'development') {
        console.error('\n\x1b[31m%s\x1b[0m', '🚨 Validation Errors:');
        console.error('Request Body:', req.body);
        console.error('\nDetailed Errors:');
        errorDetails.forEach((err) => {
          console.error(`- ${err.field}: ${err.message}`);
          console.error(`  Received value: ${JSON.stringify(err.value)}`);
        });
        console.error('\n');
      }

      // Log validation error
      logger.error('Validation Error in Register User', {
        route: '/api/auth/register',
        method: req.method,
        body: req.body,
        errors: errorDetails,
      });

      // Create detailed error message
      const errorMessage = errorDetails
        .map((err) => `${err.field}: ${err.message}`)
        .join('; ');

      // Throw formatted validation error with details
      throw validationErrors.validationFailed(new Error(errorMessage));
    }
    next();
  });
