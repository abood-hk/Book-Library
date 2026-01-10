import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import userModel from '../models/User.js';
// import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const loginUser = (req: Request, res: Response) => {
  res.status(200).send('Hello user');
};

export const signupUser = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    const exsitingEmail = await userModel.exists({ email });
    const exsitingUsername = await userModel.exists({
      username,
    });

    if (exsitingEmail) {
      return res.status(400).json({ message: 'Email already used' });
    }
    if (exsitingUsername) {
      return res.status(400).json({ message: 'Username already used' });
    }
    const hashedPassword = await bcrypt.hash(password, 11);

    await userModel.create({
      email,
      username,
      password: hashedPassword,
    });

    return res.status(201).json({ message: 'New user created' });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err != null &&
      'code' in err &&
      err.code === 11000 &&
      'keyValue' in err
    ) {
      const keyValue = (err as { keyValue: Record<string, string> }).keyValue;
      const feild = Object.keys(keyValue)[0];
      return res.status(400).json({ message: `${feild} already exists` });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};
