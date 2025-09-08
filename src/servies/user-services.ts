import User from '@/models/user-model';

export const findUserByEmail = async (email: string, phone: string) => {
  return User.findOne({
    email,
    phone,
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
