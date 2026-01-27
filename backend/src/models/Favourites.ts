import mongoose, { Schema, Document } from 'mongoose';
import { IBook } from './Book';

interface IFavourites extends Document {
  user: mongoose.Types.ObjectId;
  book: mongoose.Types.ObjectId | IBook;
  createdAt: Date;
  updatedAt: Date;
}

const favouritesSchema = new Schema<IFavourites>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    book: { type: Schema.Types.ObjectId, ref: 'books', required: true },
  },
  { timestamps: true },
);

favouritesSchema.index({ user: 1 });
favouritesSchema.index({ user: 1, book: 1 }, { unique: true });

const FavouriteModel = mongoose.model<IFavourites>(
  'favourites',
  favouritesSchema,
);

export default FavouriteModel;
