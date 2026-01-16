import mongoose, { Schema, Document } from 'mongoose';

interface IReviews extends Document {
  book: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewsSchema = new Schema<IReviews>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'books', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    rating: {
      type: Number,
      trim: true,
      min: [1, 'Rating can not be less than 1'],
      max: [5, 'Rating can not be more than 5'],
      required: true,
      validate: {
        validator: Number.isInteger,
        message: 'Rating must be an integer',
      },
    },
    content: {
      type: String,
      trim: true,
      minLength: 3,
      maxLength: 400,
      required: false,
    },
  },
  { timestamps: true }
);

reviewsSchema.index({ user: 1, book: 1 }, { unique: true });

const ReviewsModel = mongoose.model<IReviews>('reviews', reviewsSchema);

export default ReviewsModel;
