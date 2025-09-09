import { MongoError } from 'mongodb';
import { commonErrors, databaseErrors } from './api-error';

interface MongoServerError extends MongoError {
  code?: number;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
}

interface MongoCastError extends Error {
  path?: string;
  value?: unknown;
}

/**
 * A utility function to handle MongoDB errors in a consistent way across the application
 * @param error The error caught from MongoDB operation
 * @returns Never returns, always throws an ApiError
 */
export const handleMongoError = (error: unknown): never => {
  // If it's not an Error instance, convert it to one
  if (!(error instanceof Error)) {
    throw commonErrors.somethingWentWrong(new Error(String(error)));
  }

  // Handle specific MongoDB errors
  if (error instanceof Error) {
    // Handle duplicate key errors (E11000)
    const mongoError = error as MongoServerError;
    if (
      mongoError.code === 11000 &&
      mongoError.keyPattern &&
      mongoError.keyValue
    ) {
      const field = Object.keys(mongoError.keyPattern)[0];
      const value = mongoError.keyValue[field];
      throw databaseErrors.duplicateKey(field, String(value), error);
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      throw databaseErrors.validationError(error.message, error);
    }

    // Handle casting errors (invalid ObjectId, etc)
    if (error.name === 'CastError') {
      const castError = error as MongoCastError;
      throw databaseErrors.castError(
        castError.path || 'unknown',
        String(castError.value || ''),
        error,
      );
    }

    // Handle other database errors
    throw databaseErrors.queryError(error);
  }

  // This should never happen due to the first check, but TypeScript needs it
  throw commonErrors.somethingWentWrong(error as Error);
};

/**
 * A higher-order function that wraps MongoDB operations with error handling
 * @param operation The MongoDB operation to execute
 * @returns The result of the operation if successful, otherwise throws an ApiError
 */
export const withMongoErrorHandler = async <T>(
  operation: () => Promise<T>,
): Promise<T> => {
  try {
    return await operation();
  } catch (error: unknown) {
    return handleMongoError(error);
  }
};
