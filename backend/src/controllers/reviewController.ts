import { Request, Response } from 'express';
import ReviewsModel from '../models/Reviews.js';
import mongoose from 'mongoose';

export const addReview = async (req: Request, res: Response) => {
  const user = req.user;
  const bookId = req.params.bookId;
  const { content, rating } = req.body;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }

  try {
    const review = await ReviewsModel.create({
      user: user._id,
      book: bookId,
      rating,
      content,
    });
    review.populate('user', 'username');
    return res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    if (
      typeof err === 'object' &&
      err != null &&
      'code' in err &&
      err.code === 11000 &&
      'keyValue' in err
    ) {
      return res
        .status(409)
        .json({ message: `You have already reviewed this book ` });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

export const removeReview = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }
  const bookId = req.params.bookId;
  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }

  try {
    const result = await ReviewsModel.deleteOne({
      user: user._id,
      book: bookId,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res.status(200).json({ message: 'Review deleted successfully' });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  const bookId = req.params.bookId;

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }

  try {
    const reviews = await ReviewsModel.find({ book: bookId })
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    return res.status(200).json({ reviews });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const user = req.user;
  const bookId = req.params.bookId;
  const { content, rating } = req.body;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (!mongoose.Types.ObjectId.isValid(bookId)) {
    return res.status(400).json({ message: 'Invalid book id' });
  }

  try {
    const review = await ReviewsModel.findOneAndUpdate(
      { user: user._id, book: bookId },
      { rating, content },
      { new: true, runValidators: true }
    ).populate('user', 'username');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res
      .status(200)
      .json({ message: 'Review updated successfully', updatedReview: review });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};
