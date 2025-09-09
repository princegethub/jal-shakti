import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from './api-error';
import process from 'process';

export function errorHandler(
  err: Error | ApiError,
  req: Request,
  res: Response,
  _: NextFunction,
): void {
  let statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let httpStatusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message;

  if (err instanceof ApiError) {
    statusCode = err.code;
    httpStatusCode = err.status;
  }

  // In development, also log to console for easier debugging
  if (process.env.NODE_ENV === 'development') {
    console.error('\n🚨 Error Details:');
    console.error('Path:', req.path);
    console.error('Error Type:', err.constructor.name);
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  }

  res.status(httpStatusCode).json({
    success: false,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
}

export default errorHandler;
