import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import './config/db.js';
import './config/redis.js';
import booksRouter from './routes/booksRoutes.js';
import logger from './middleware/loggerMiddleware.js';
import usersRouter from './routes/usersRoutes.js';
import adminRouter from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(logger);

app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
