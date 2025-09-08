import Joi from 'joi';
import { USER_ROLE } from '@/constants/enum';

export const userValidation = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/[a-zA-Z]/)
    .pattern(/\d/)
    .required(),
  role: Joi.string()
    .valid(...Object.values(USER_ROLE)) // This will use the uppercase values from enum
    .uppercase() // Convert input to uppercase
    .required(),
  isEmailVerified: Joi.boolean(),
});
