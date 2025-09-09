import User from '@/models/user-model';

export const getUser = async (where: { email?: string; phone?: string }) => {
  return User.findOne({
    ...where,
    isDeleted: false,
  });
};

export interface CreateUserInput {
  name: string;
  email: string;
  phone: string;
  role: string;
  password: string;
  isEmailVerified?: boolean;
  location?: string;
}

export const createUser = async (userData: CreateUserInput) => {
  const user = new User(userData);
  await user.save();
  return user;
};
