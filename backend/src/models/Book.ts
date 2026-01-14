import mongoose, { Schema, Document } from 'mongoose';

interface IBook extends Document {
  olid: string;
  isbns?: [string];
  primaryEditionOlid?: string;
  cover_i?: number;
  title: string;
  author_name: string;
  description: string;
  categories: string[];
}

export const bookSchema = new Schema<IBook>(
  {
    olid: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      uppercase: true,
    },
    isbns: {
      type: [String],
    },
    primaryEditionOlid: {
      type: String,
    },
    cover_i: {
      type: Number,
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      required: true,
    },
    author_name: {
      type: String,
      trim: true,
      required: true,
    },
    description: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String],
      trim: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BooksModel = mongoose.model<IBook>('books', bookSchema);

export default BooksModel;
