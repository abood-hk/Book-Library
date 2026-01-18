import mongoose, { Schema, Document } from 'mongoose';

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'super admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 20,
      unique: true,
      required: true,
      lowercase: true,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
      lowercase: true,
      required: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please fill a valid email address.',
      ],
    },
    password: {
      type: String,
      trim: true,
      minLength: 8,
      maxLength: 20,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin', 'super admin'],
      default: 'user',
    },
  },
  { timestamps: true },
);

const UserModel = mongoose.model<IUser>('users', userSchema);

export default UserModel;
