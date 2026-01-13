import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { IAccessPayload } from '../interfaces/IPayload';

dotenv.config();

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET not provided');
    }

    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ) as IAccessPayload;

    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default auth;
