import { USER_ROLE } from './enum';

// Custom error messages for each field
export const validationMessages = {
  name: {
    'string.empty': 'Name is required',
    'any.required': 'Name is required',
  },
  email: {
    'string.empty': 'Email is required',
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  },
  phone: {
    'string.pattern.base': 'Please provide a valid phone number',
  },
  role: {
    'any.only': `Role must be one of: ${Object.values(USER_ROLE).join(', ')}`,
    'any.required': 'Role is required',
  },
  password: {
    'string.empty': 'Password is required',
    'string.min': 'Password must be at least 8 characters long',
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
