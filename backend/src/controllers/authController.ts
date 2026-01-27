import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/User.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import redis from '../config/redis.js';
import {
  genAccessToken,
  genRefreshToken,
} from '../services/tokenGeneration.js';
import { IRefreshPayload } from '../interfaces/IPayload.js';

dotenv.config();

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Email or password is wrong' });
    }

    const samePass = await bcrypt.compare(password, user.password);

    if (!samePass) {
      return res.status(401).json({ message: 'Email or password is wrong' });
    }

    const accessToken = genAccessToken({
      _id: user._id.toString(),
      role: user.role,
    });

    const refreshToken = genRefreshToken({ _id: user._id.toString() });

    await redis.set(`rt:${user._id}`, refreshToken, { EX: 60 * 60 * 3 });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 3 * 1000,
    });

    res.status(200).json({ accessToken });
  } catch (err) {
    console.error('login error:', err);

    return res.status(500).json({ message: 'Server error' });
  }
};

export const signupUser = async (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if (password.length < 7 || password.length > 17) {
    return res.status(400).json({
      message: 'Password must be 7-17 characters long',
    });
  }
  const hashedPassword = await bcrypt.hash(password, 11);
  try {
    const user = await userModel.create({
      email,
      username,
      password: hashedPassword,
    });

    const accessToken = genAccessToken({
      _id: user._id.toString(),
      role: user.role,
    });
    const refreshToken = genRefreshToken({ _id: user._id.toString() });

    await redis.set(`rt:${user._id}`, refreshToken, { EX: 60 * 60 * 3 });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 60 * 60 * 3 * 1000,
    });

    return res.status(200).json({ accessToken });
  } catch (err: unknown) {
    console.error('Signup error:', err);
    if (
      typeof err === 'object' &&
      err != null &&
      'code' in err &&
      err.code === 11000 &&
      'keyValue' in err
    ) {
      const keyValue = (err as { keyValue: Record<string, string> }).keyValue;
      const feild = Object.keys(keyValue)[0];
      return res.status(409).json({ message: `${feild} already exists` });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });

    if (refreshToken && process.env.REFRESH_TOKEN_SECRET) {
      try {
        const payload = jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
        ) as IRefreshPayload;

        redis.del(`rt:${payload._id}`);
      } catch {
        return res.status(200).json({ message: 'Logout succesfully' });
      }
    }

    return res.status(200).json({ message: 'Logout succesfully' });
  } catch {
    return res.status(500).json({ message: 'Logout failed' });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      console.log('!refreshtoken');
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    if (!process.env.REFRESH_TOKEN_SECRET) {
      return res
        .status(400)
        .json({ message: 'REFRESH_TOKEN_SECRET is not defined' });
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    ) as IRefreshPayload;

    const user = await userModel.findById(payload._id);

    if (!user) {
      console.log('user not found');
      return res.status(401).json({ message: 'User not found' });
    }

    const storedToken = await redis.get(`rt:${payload._id}`);

    if (refreshToken !== storedToken) {
      console.log('Refresh token revoked');
      return res.status(401).json({ message: 'Refresh token revoked' });
    }

    const accessToken = genAccessToken({
      _id: user._id.toString(),
      role: user.role,
    });
    console.log('new Access Token', accessToken);
    return res.status(200).json({ accessToken });
  } catch {
    return res.status(400).json({ message: 'Invalid refresh token' });
  }
};
