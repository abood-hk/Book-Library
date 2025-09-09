import mongoose, { Schema, Document } from 'mongoose';

interface IReviews extends Document {
  book: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rate: number;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewsSchema = new Schema<IReviews>(
  {
    book: { type: Schema.Types.ObjectId, ref: 'books', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    rate: { type: Number, trim: true, min: 1, max: 10, required: true },
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

const ReviewsModel = mongoose.model<IReviews>('reviews', reviewsSchema);

export default ReviewsModel;
