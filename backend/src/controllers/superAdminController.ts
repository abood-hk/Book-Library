import { Request, Response } from 'express';
import mongoose from 'mongoose';
import UserModel from '../models/User';

export const promoteToAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ message: 'User does not exist' });
  }

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: userId, role: 'user' },
      { role: 'admin' },
      { new: true },
    );

    if (!result) {
      return res.status(409).json({ message: 'User cannot be promoted' });
    }
    return res.status(200).json({ user: result });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const demoteAdmin = async (req: Request, res: Response) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ message: 'User does not exist' });
  }

  try {
    const result = await UserModel.findOneAndUpdate(
      { _id: userId, role: 'admin' },
      { role: 'user' },
      { new: true },
    );

    if (!result) {
      return res.status(409).json({ message: 'User can not be demoted' });
    }

    return res.status(200).json({ user: result });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};
