import { Request, Response } from 'express';
import FavouriteModel from '../models/Favourites.js';
import mongoose from 'mongoose';

export const addToFavourites = async (req: Request, res: Response) => {
  const user = req.user;
  const bookId = req.params.bookId;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }

  try {
    await FavouriteModel.create({ user: user._id, book: bookId });
    return res.status(200).json({ message: 'Added to favourites' });
  } catch (err: unknown) {
    if (
      typeof err === 'object' &&
      err != null &&
      'code' in err &&
      err.code === 11000
    ) {
      return res.status(400).json({ message: 'Book already in favourites' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

export const showFavourites = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }
  try {
    const favouriteBooks = await FavouriteModel.find({
      user: user._id,
    }).populate('book');

    res.status(200).json(favouriteBooks);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromFavourites = async (req: Request, res: Response) => {
  const user = req.user;
  const bookId = req.params.bookId;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }

  try {
    await FavouriteModel.deleteOne({ user: user._id, book: bookId });
    return res.status(200).json({ message: 'Book removed from favourites' });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};
