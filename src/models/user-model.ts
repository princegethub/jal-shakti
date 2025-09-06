import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { toJSON, paginate } from '@/plugins/index';
import { userValidation } from '@/validation/user-validation';
import { USER_ROLE } from '@/constants/enum';
import { authErrors } from '@/utils/api-error';

type SchemaPlugin = <T extends Document, U extends Model<T>>(
  schema: Schema<T, U>,
) => void;
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  isDeleted: boolean;
  role: USER_ROLE;
  isEmailVerified: boolean;
  isPasswordMatch(password: string): Promise<boolean>;
}

interface IUserModel extends Model<IUser> {
  isEmailTaken(email: string, excludeUserId?: Types.ObjectId): Promise<boolean>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      validate(value: string) {
        if (value && !value.match(/^\+?[1-9]\d{1,14}$/)) {
          throw authErrors.invalidPhoneNumber;
        }
      },
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLE),
      default: USER_ROLE.USER,
      required: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    location: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

userSchema.plugin(toJSON as SchemaPlugin);
userSchema.plugin(paginate as SchemaPlugin);

userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: Types.ObjectId,
) {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

userSchema.methods.isPasswordMatch = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.pre<IUser>('save', async function (next) {
  try {
    await userValidation.validateAsync({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
      isEmailVerified: this.isEmailVerified,
    });
  } catch (err) {
    return next(err as Error);
  }
  if (this.isModified('password') && this.password) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

const User = mongoose.model<IUser, IUserModel>('User', userSchema);
export default User;
