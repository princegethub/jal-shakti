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

// // Debug middleware
// authRoutes.use((req, res, next) => {
//   if (process.env.NODE_ENV === 'development') {
//     console.error('\n🔍 Request Debug Info:');
//     console.error('URL:', req.url);
//     console.error('Method:', req.method);
//     console.error('Headers:', {
//       'content-type': req.headers['content-type'],
//       'content-length': req.headers['content-length']
//     });
//     console.error('Raw Body:', req.body);
//   }
//   next();
// });

export default authRoutes;
