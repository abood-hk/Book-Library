import BooksModel from '../models/Book.js';
import { Request, Response } from 'express';
import fetchBookIfNotFound from '../services/seedBook.js';
import mongoose from 'mongoose';

interface IBookQuery {
  page?: string;
  limit?: string;
  categories?: string;
  q?: string;
  sort?: 'default' | 'mostReviewed' | 'mostFavourited';
}

interface IBookFilter {
  categories?: {
    $in?: RegExp[];
    $all?: RegExp[];
  };
  $or?: { [key: string]: { $regex: RegExp; $options?: string } }[];
}

export const getAllBooks = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    Record<string, never>,
    IBookQuery
  >,
  res: Response,
) => {
  const categoriesQuery = (req.query.categories as string) || null;
  const filter: IBookFilter = {};
  if (categoriesQuery && categoriesQuery !== '') {
    const categoriesArray = categoriesQuery.split(',').map((c) => c.trim());
    filter.categories = {
      $all: categoriesArray.map((cat) => new RegExp(`^${cat}$`, 'i')),
    };
  }

  const escapeRegExp = (s: string): string => {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const raw = (req.query.q as string | undefined) ?? '';
  if (raw && raw.trim() !== '') {
    const q = raw.trim();

    if (q.length > 100) {
      return res.status(400).json({ error: 'Query too long' });
    }

    const safePattern = escapeRegExp(q);
    const regex = new RegExp(safePattern, 'i');

    filter.$or = [
      { title: { $regex: regex } },
      { author_name: { $regex: regex } },
    ];
  }

  const sort = req.query.sort || 'default';

  const rawPage = parseInt(req.query.page || '1', 10);
  const rawLimit = parseInt(req.query.limit || '30', 10);
  const page = !Number.isNaN(rawPage) ? rawPage : 1;
  const limit = !Number.isNaN(rawLimit) ? rawLimit : 30;
  const totalBooks = await BooksModel.countDocuments(filter);
  const booksToSkip = (page - 1) * limit;

  const sortStage: mongoose.PipelineStage = {
    $sort:
      sort === 'mostReviewed'
        ? { reviewsCount: -1, _id: 1 }
        : sort === 'mostFavourited'
          ? { favouritesCount: -1, _id: 1 }
          : { createdAt: 1, _id: 1 },
  };

  const pipeline: mongoose.PipelineStage[] = [
    { $match: filter },

    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'book',
        as: 'reviews',
      },
    },
    {
      $lookup: {
        from: 'favourites',
        localField: '_id',
        foreignField: 'book',
        as: 'favourites',
      },
    },
    {
      $addFields: {
        reviewsCount: { $size: '$reviews' },
        favouritesCount: { $size: '$favourites' },
      },
    },

    sortStage,
    { $skip: booksToSkip },
    { $limit: limit },
  ];

  let books = await BooksModel.aggregate(pipeline);

  if (books.length === 0 && typeof req.query.q === 'string') {
    await fetchBookIfNotFound(req.query.q);
    books = await BooksModel.find(filter)
      .sort(sortStage.$sort)
      .skip(booksToSkip)
      .limit(limit);
  }

  res.status(200).json({
    books,
    totalPages: Math.ceil(totalBooks / limit),
  });
};

export const getBook = async (req: Request, res: Response) => {
  const olid = req.params.olid;
  const exist = await BooksModel.exists({ olid });
  if (exist) {
    const book = await BooksModel.findOne({ olid });
    return res.status(200).json(book);
  }
  res.status(400).json({ error: 'No book found' });
};
