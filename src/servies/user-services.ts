import User from '@/models/user-model';
import { withMongoErrorHandler } from '@/utils/mongo-error-handler';

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  isEmailVerified?: boolean;
  location?: string;
}

export const getUser = async (where: { email?: string; phone?: string }) => {
  return withMongoErrorHandler(async () => {
    return User.findOne({
      ...where,
      isDeleted: false,
    });
  });
};

export const createUser = async (userData: CreateUserInput) => {
  return withMongoErrorHandler(async () => {
    const user = new User(userData);
    await user.save();
    return user;
  });
};
