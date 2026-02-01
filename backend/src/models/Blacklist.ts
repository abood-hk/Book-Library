import { IBook } from './Book.js';
import mongoose, { Schema } from 'mongoose';

interface IBlacklist extends IBook {
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const blacklistSchema = new Schema<IBlacklist>(
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
      required: true,
    },
    addedBy: { type: Schema.Types.ObjectId, ref: 'users', required: true },
  },
  {
    timestamps: true,
  },
);

const BlacklistModel = mongoose.model<IBlacklist>(
  'blacklists',
  blacklistSchema,
);

export default BlacklistModel;
