import Joi from 'joi';

export const userValidation = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/[a-zA-Z]/)
    .pattern(/\d/)
    .required(),
  role: Joi.string()
    .valid('admin', 'scientist', 'researcher', 'user')
    .required(),
  isEmailVerified: Joi.boolean(),
});
