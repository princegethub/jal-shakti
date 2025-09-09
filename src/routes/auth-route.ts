import { login, registerUser } from '@/controller/auth-controller';
import express from 'express';
import { loginUserSchema, validate } from '@/middlewares/validate-middleware';
import { registerUserSchema } from '@/schema/user-schema';

/**
 * Creates an instance of an Express router to handle admin-related routes.
 */
const authRoutes = express.Router();

authRoutes.post('/register', validate(registerUserSchema), registerUser);
authRoutes.post('/login', validate(loginUserSchema), login);

export default authRoutes;
