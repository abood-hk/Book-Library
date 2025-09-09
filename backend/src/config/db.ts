import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) console.log('Could not connect to database');
else {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log('Mongodb is connected'))
    .catch(() =>
      console.log('Unknown error prevented mongodb form connecting')
    );
}
