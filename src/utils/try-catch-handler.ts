import { NextFunction, Request, Response } from 'express';

type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<unknown>;

/**
 * A higher-order function that wraps an asynchronous controller function
 * with a try-catch block to handle errors and pass them to the next middleware.
 *
 * @param fn - The asynchronous controller function to be wrapped. It should
 *             follow the signature of an Express middleware function.
 *
 * @returns A new asynchronous middleware function that executes the provided
 *          controller function and catches any errors, passing them to the
 *          `next` function for centralized error handling.
 *
 * @example
 * ```typescript
 * const myController: AsyncController = async (req, res, next) => {
 *     // Your controller logic here
 * };
 *
 * app.get('/endpoint', tryCatchHandler(myController));
 * ```
 */
export const tryCatchHandler = (fn: AsyncController) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await fn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
};
