import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './config/db.js';
import booksRouter from './routes/booksRoutes.js';
import logger from './middleware/loggerMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use(logger);

app.use('/api', booksRouter);

app.listen(PORT, () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);
});
