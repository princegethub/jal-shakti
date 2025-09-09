import { USER_ROLE } from './enum';

// Custom error messages for each field
export const validationMessages = {
  name: {
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  },
  email: {
    'string.base': 'Email should be a text value',
    'string.empty': 'Email cannot be empty',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  },
  phone: {
    'string.pattern.base': 'Please provide a valid phone number',
    'any.invalid':
      'Phone number must be a valid 10 digit number (with or without +91).',
  },
  role: {
    'any.only': `Role must be one of: ${Object.values(USER_ROLE).join(', ')}`,
    'any.required': 'Role is required',
  },
  password: {
    'string.base': 'Password should be a text value',
    'string.empty': 'Password cannot be empty',
    'string.min': 'Password should be at least {#limit} characters long',
    'string.pattern.base': 'Password must contain both letters and numbers',
    'any.required': 'Password is required',
  },
  isEmailVerified: {
    'boolean.base': 'Email verification status must be true or false',
  },
  location: {
    'string.base': 'Location must be a string',
  },
};
