import { USER_ROLE } from '@/constants/enum';
import { validationMessages } from '@/constants/schema-message';
import Joi from 'joi';

export const registerUserSchema = Joi.object({
  name: Joi.string().trim().required().messages(validationMessages.name),
  email: Joi.string().email().required().messages(validationMessages.email),
  phone: Joi.string()
    .trim()
    .pattern(/^[0-9]{10}$/)
    .optional()
    .messages(validationMessages.phone),
  role: Joi.string()
    .valid(...Object.values(USER_ROLE))
    .uppercase() // Convert input to uppercase
    .required()
    .messages({
      ...validationMessages.role,
      'string.uppercase': 'Role must be in uppercase',
    }),
  password: Joi.string()
    .min(8)
    .pattern(/[a-zA-Z]/, 'letters')
    .pattern(/\d/, 'numbers')
    .required()
    .messages(validationMessages.password),
  isEmailVerified: Joi.boolean()
    .default(false)
    .messages(validationMessages.isEmailVerified),
  location: Joi.string().allow('').messages(validationMessages.location),
}).messages({
  'object.unknown': 'Invalid field: {#key}',
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages(validationMessages.refreshToken),
});

export const logoutSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages(validationMessages.refreshToken),
});
