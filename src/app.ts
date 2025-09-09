import express, { Application, NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import router from '@/routes';
import logger from '@/logger/logger';
import { StatusCodes } from 'http-status-codes';
import errorHandler from '@/utils/error-handler';
import ApiError from '@/utils/api-error';

const app: Application = express();

// Middleware
app.use(helmet());

// cors
app.use(cors());

// If you want to restrict the access to specific origins, uncomment and configure the following:
// app.use(
//     cors({
//         methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'HEAD'],
//         origin: ['https://client.com'],
//         credentials: true
//     })
// )

// parse json request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/', router);

// Route handler with explicit types for req and res
app.get('/health', (req: Request, res: Response): void => {
  logger.info('Everything good');
  res.status(StatusCodes.OK).json({ message: 'Everything Good!' });
});

// 404 Handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(404, 'Route not found', 404));
});

// Error Handler
app.use(errorHandler);

export default app;
