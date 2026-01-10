import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

interface IJwtPayload {
  userId: string;
  role: 'user' | 'admin';
}

interface IAuthenticatedRequest extends Request {
  user: { id: string; role: 'user' | 'admin' };
}

const auth = async (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Berear ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error('ACCESS_TOKEN_SECRET not provided');
    }

    const payload = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    ) as IJwtPayload;

    req.user = { id: payload.userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default auth;
