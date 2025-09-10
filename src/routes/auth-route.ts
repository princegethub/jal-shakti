import {
  login,
  refreshToken,
  registerUser,
  logout,
} from '@/controller/auth-controller';
import express from 'express';
import { loginUserSchema, validate } from '@/middlewares/validate-middleware';
import {
  logoutSchema,
  refreshTokenSchema,
  registerUserSchema,
} from '@/schema/user-schema';

/**
 * Creates an instance of an Express router to handle authentication routes.
 */
const authRoutes = express.Router();

authRoutes.post('/register', validate(registerUserSchema), registerUser);
authRoutes.post('/login', validate(loginUserSchema), login);
authRoutes.post('/refresh-token', validate(refreshTokenSchema), refreshToken);
authRoutes.post('/logout', validate(logoutSchema), logout);

export default authRoutes;
