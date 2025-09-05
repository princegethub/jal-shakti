import { logger } from '@/logger/logger';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ApiError from './api-error';
import process from 'process';

export function errorHandler(
  err: Error,
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

  logger.error(err.message, { error: err });

  res.status(httpStatusCode).json({
    success: false,
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export default errorHandler;
