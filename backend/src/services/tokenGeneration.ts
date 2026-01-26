import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const genAccessToken = (user: { _id: string; role: string }) => {
  if (!process.env.ACCESS_TOKEN_SECRET) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined');
  }

  const token = jwt.sign(
    { _id: user._id.toString(), role: user.role },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '10m' },
  );
  return token;
};

export const genRefreshToken = (user: { _id: string }) => {
  if (!process.env.REFRESH_TOKEN_SECRET) {
    throw new Error('REFRESH_TOKEN_SECRET is not defined');
  }
  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '3h',
    },
  );
  return token;
};
