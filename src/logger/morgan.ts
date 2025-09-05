const morgan = require('morgan');
const config = require('./config');
const logger = require('./logger');
import type { Request, Response } from 'express';

morgan.token(
  'message',
  (req: Request, res: Response) =>
    (res as import('express').Response).locals.errorMessage || '',
);

const getIpFormat = () =>
  config.env === 'production' ? ':remote-addr - ' : '';
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

const successHandler = morgan(successResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode >= 400,
  stream: { write: (message: string) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req: Request, res: Response) => res.statusCode < 400,
  stream: { write: (message: string) => logger.error(message.trim()) },
});

module.exports = {
  successHandler,
  errorHandler,
};
