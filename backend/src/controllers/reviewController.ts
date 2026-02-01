import { Request, Response } from 'express';
import ReviewsModel from '../models/Reviews.js';
import BooksModel from '../models/Book.js';
import type { IBook } from '../models/Book.js';

export const getMyReviews = async (req: Request, res: Response) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }
  try {
    const reviews = await ReviewsModel.find({
      user: user._id,
    }).populate<{ book: IBook }>('book');

    const reviewedBooks = reviews.map((review) => review.book);

    res.status(200).json(reviewedBooks);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const addReview = async (req: Request, res: Response) => {
  const user = req.user;
  const { content, rating } = req.body;
  const bookOlid = req.params.bookId;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (!bookOlid) {
    return res.status(400).json({ message: 'Provide a valid book olid' });
  }

  try {
    const book = await BooksModel.findOne({ olid: bookOlid });

    if (!book) {
      return res.status(400).json({ message: 'Provide a valid book olid' });
    }

    const review = await ReviewsModel.create({
      user: user._id,
      book: book._id,
      rating,
      content,
    });
    await review.populate('user', 'username');
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
  const bookOlid = req.params.bookId;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (!bookOlid) {
    return res.status(400).json({ message: 'Provide a valid book olid' });
  }
  try {
    const book = await BooksModel.findOne({ olid: bookOlid });

    if (!book) {
      return res.status(400).json({ message: 'Provide a valid book olid' });
    }

    const review = await ReviewsModel.findOneAndDelete({
      user: user._id,
      book: book._id,
    }).populate('user', 'username');

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

export const getReviews = async (req: Request, res: Response) => {
  const bookOlid = req.params.bookId;

  if (!bookOlid) {
    return res.status(400).json({ message: 'Provide a valid book olid' });
  }

  try {
    const book = await BooksModel.findOne({ olid: bookOlid });

    if (!book) {
      return res.status(400).json({ message: 'Provide a valid book olid' });
    }

    const reviews = await ReviewsModel.find({ book: book._id })
      .sort({ createdAt: -1 })
      .populate('user', 'username');
    return res.status(200).json({ reviews });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const updateReview = async (req: Request, res: Response) => {
  const user = req.user;
  const { content, rating } = req.body;
  const bookOlid = req.params.bookId;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  if (!bookOlid) {
    return res.status(400).json({ message: 'Provide a valid book olid' });
  }

  try {
    const book = await BooksModel.findOne({ olid: bookOlid });

    if (!book) {
      return res.status(400).json({ message: 'Provide a valid book olid' });
    }

    const review = await ReviewsModel.findOneAndUpdate(
      { user: user._id, book: book._id },
      { rating, content },
      { new: true, runValidators: true },
    ).populate('user', 'username');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    return res
      .status(200)
      .json({ message: 'Review updated successfully', review });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};
