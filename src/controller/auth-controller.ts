import config from '@/config/config';
import { tryCatchHandler } from '@/utils/try-catch-handler';
import { Request, Response, NextFunction } from 'express';

import ApiError, { authErrors, commonErrors } from '@/utils/api-error';
import { createUser, findUserByEmail } from '@/servies/user-services';
import { successMessages } from '@/utils/api-success';

export const registerUser = tryCatchHandler(
  async (req: Request, res: Response, _: NextFunction) => {
    try {
      if (!req.body) {
        throw commonErrors.somethingWentWrong(
          new Error('Request body is empty'),
        );
      }

      const {
        name,
        email,
        phone,
        role,
        password = config.DEFAULT_USER_PASSWORD || 'jal-shakti@123',
        isEmailVerified = false,
        location = '',
      } = req.body;

      // Debug log in development
      if (process.env.NODE_ENV === 'development') {
        console.error('📝 Processing registration for:', {
          name,
          email,
          phone,
          role,
          isEmailVerified,
          location,
        });
      }

      // Check if user already exists
      const userExists = await findUserByEmail(email, phone);
      if (userExists) {
        throw authErrors.userAlreadyExists();
      }

      // Create user
      const user = await createUser({
        name,
        email,
        phone,
        role,
        password,
        isEmailVerified,
        location,
      });

      // Send success response
      return successMessages.userCreated(user).sendResponse(res);
    } catch (error) {
      // If it's already an ApiError, rethrow it
      if (error instanceof ApiError) {
        throw error;
      }

      // Log the actual error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ Registration Error:', error);
      }

      // Convert to API error
      throw commonErrors.somethingWentWrong(error as Error);
    }
  },
);
