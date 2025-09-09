import config from '@/config/config';
import { tryCatchHandler } from '@/utils/try-catch-handler';
import { Request, Response, NextFunction } from 'express';

import ApiError, { authErrors, commonErrors } from '@/utils/api-error';
import { createUser, getUser } from '@/servies/user-services';
import { successMessages } from '@/utils/api-success';
import { generateJwtToken } from '@/utils/jwt';

export const registerUser = tryCatchHandler(
  async (req: Request, res: Response, _: NextFunction) => {
    try {
      if (!req.body) commonErrors.requestBodyEmpty();

      const {
        name,
        email,
        phone,
        role,
        password = config.DEFAULT_USER_PASSWORD || 'jal-shakti@123',
        isEmailVerified = false,
        location = '',
      } = req.body;

      const where =
        email && phone ? { email, phone } : email ? { email } : { phone };
      // Check if user already exists
      const userExists = await getUser(where);
      if (userExists) throw authErrors.userAlreadyExists();

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

      // Convert to API error
      throw commonErrors.somethingWentWrong(error as Error);
    }
  },
);

export const login = tryCatchHandler(async (req: Request, res: Response) => {
  const { email, password, phone } = req.body;

  // Validate if required fields are present
  if (!((email && password) || phone)) {
    throw commonErrors.missingMandatoryField();
  }

  // Determine login method (email or phone)
  const where = email ? { email } : { phone };
  let user = await getUser(where);

  // Validate user existence
  if (!user) {
    throw authErrors.invalidCredentials();
  }

  // Validate password only for email login
  if (email || phone) {
    // If user exists but has no password in DB, throw error
    if (!user.password) {
      throw authErrors.invalidCredentials();
    }

    // If password is provided, validate it
    if (password) {
      const isPasswordValid = await user.isPasswordMatch(password);
      if (!isPasswordValid) {
        throw authErrors.invalidCredentials();
      }
    }
  }

  // Generate tokens
  const payload = { id: user.id, role: user.role, email: user.email };
  const accessToken = generateJwtToken(
    payload,
    config.jwt.JWT_SECRET,
    config.jwt.JWT_REFRESH_EXPIRATION_DAYS,
  );
  const refreshToken = generateJwtToken(
    payload,
    config.jwt.JWT_SECRET,
    config.jwt.JWT_REFRESH_EXPIRATION_DAYS,
  );
  // Send success response with tokens
  return successMessages
    .userLoggedIn({ user, accessToken, refreshToken })
    .sendResponse(res);
});

///  TODO: refresh token LOGIN_SUCCESS
// export const refreshToken = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ): Promise<void> => {
//   try {
//     const { refreshToken } = req.body;

//     if (!refreshToken) {
//       throw middlewareErrors.missingToken();
//     }

//     const decoded = jwt.verify(refreshToken, config.jwt.JWT_SECRET) as {
//       id: string;
//       role: USER_ROLE;
//       email: string;
//     };
//     const newAccessToken = generateJwtToken(
//       decoded,
//       config.jwt.JWT_SECRET,      config.jwt.JWT_REFRESH_EXPIRATION_DAYS,
//     );
//   } catch (error) {
//     next(error);
//   }
// };
