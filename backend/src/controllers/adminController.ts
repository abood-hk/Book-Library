import { Request, Response } from 'express';
import mongoose from 'mongoose';
import ReviewsModel from '../models/Reviews.js';
import BooksModel from '../models/Book.js';
import BlacklistModel from '../models/Blacklist.js';
import FavouriteModel from '../models/Favourites.js';

export const getBlacklistedBooks = async (req: Request, res: Response) => {
  try {
    const blacklisted = await BlacklistModel.find({});

    res.status(200).json(blacklisted);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const adminRemoveReview = async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    return res.status(400).json({ message: 'Invalid review id' });
  }

  try {
    const review = await ReviewsModel.findByIdAndDelete({ _id: reviewId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }
    return res
      .status(200)
      .json({ message: 'Review deleted successfully', review });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const blacklistBook = async (req: Request, res: Response) => {
  const { bookOlid } = req.params;
  const user = req.user!;

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const book = await BooksModel.findOne({ olid: bookOlid })
      .session(session)
      .select('-_id -__v -createdAt -updatedAt')
      .lean();

    if (!book) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Book not found' });
    }

    const alreadyBlacklisted = await BlacklistModel.exists({
      olid: bookOlid,
    }).session(session);

    if (alreadyBlacklisted) {
      await session.abortTransaction();
      return res.status(409).json({ message: 'Book already blacklisted' });
    }

    const fullBook = await BooksModel.findOne({ olid: bookOlid }).session(
      session,
    );

    await FavouriteModel.deleteMany({ book: fullBook?._id }).session(session);
    await ReviewsModel.deleteMany({ book: fullBook?._id }).session(session);

    await BlacklistModel.create([{ ...book, addedBy: user._id }], { session });
    await BooksModel.deleteOne({ olid: bookOlid }).session(session);

    await session.commitTransaction();

    return res.status(201).json({ message: 'Book added to blacklist' });
  } catch {
    await session.abortTransaction();
    return res.status(500).json({ message: 'Server error' });
  } finally {
    await session.endSession();
  }
};

export const removeFromBlacklist = async (req: Request, res: Response) => {
  const { bookOlid } = req.params;
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const book = await BlacklistModel.findOneAndDelete({ olid: bookOlid })
      .session(session)
      .select('-_id -__v -createdAt -updatedAt -addedBy')
      .lean();
    if (!book) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Book not found' });
    }

    await BooksModel.create([book], { session });

    await session.commitTransaction();

    return res.status(200).json({ message: 'Book removed from blacklist' });
  } catch {
    await session.abortTransaction();
    return res.status(500).json({ message: 'Server error' });
  } finally {
    session.endSession();
  }
};
