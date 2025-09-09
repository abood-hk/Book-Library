import express from 'express';
import { getAllBooks, getBook } from '../controllers/booksController.js';

const booksRouter = express.Router();

booksRouter.get('/books', getAllBooks);
booksRouter.get('/books/:olid', getBook);

export default booksRouter;
