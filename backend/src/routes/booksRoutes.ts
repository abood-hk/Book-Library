import express from 'express';
import { getAllBooks, getBook } from '../controllers/booksController.js';

const booksRouter = express.Router();

booksRouter.get('/', getAllBooks);
booksRouter.get('/:olid', getBook);

export default booksRouter;
