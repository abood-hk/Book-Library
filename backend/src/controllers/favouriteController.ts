import { Request, Response } from 'express';
import FavouriteModel from '../models/Favourites.js';
import BooksModel, { IBook } from '../models/Book.js';

export const addToFavourites = async (req: Request, res: Response) => {
  const user = req.user;
  const bookOlid = req.params.bookId;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  const book = await BooksModel.findOne({ olid: bookOlid });

  if (!book) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }

  try {
    await FavouriteModel.create({ user: user._id, book: book._id });
    return res.status(200).json({ message: 'Added to favourites' });
  } catch (err: unknown) {
    console.error('add to favourite error :', err);
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
    const favourites = await FavouriteModel.find({
      user: user._id,
    }).populate<{ book: IBook }>('book');

    const favouriteBooks = favourites.map((favourite) => favourite.book);

    res.status(200).json(favouriteBooks);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const removeFromFavourites = async (req: Request, res: Response) => {
  const user = req.user;
  const bookOlid = req.params.bookId;

  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  const book = await BooksModel.findOne({ olid: bookOlid });

  if (!book) {
    return res.status(400).json({ message: 'Invalid book ID' });
  }

  try {
    await FavouriteModel.deleteOne({ user: user._id, book: book._id });
    return res.status(200).json({ message: 'Book removed from favourites' });
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getFavouritesIds = async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'User not authorized' });
  }

  try {
    const favourites = await FavouriteModel.find({ user: user._id })
      .select('book -_id')
      .populate<{ book: IBook }>('book');

    const favouritesIds = favourites.map((favourite) => favourite.book.olid);

    return res.status(200).json(favouritesIds);
  } catch {
    return res.status(500).json({ message: 'Server error' });
  }
};
