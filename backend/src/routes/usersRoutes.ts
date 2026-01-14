import express from 'express';
import {
  loginUser,
  signupUser,
  regenerateToken,
  logoutUser,
} from '../controllers/authController.js';
import {
  emailValidator,
  passwordValidator,
  usernameValidate,
  validate,
} from '../middleware/validateMiddleware.js';
import {
  addToFavourites,
  showFavourites,
  removeFromFavourites,
} from '../controllers/favouriteController.js';
import auth from '../middleware/authMiddleware.js';

const usersRouter = express.Router();

usersRouter.post(
  '/signup',
  [emailValidator, passwordValidator, usernameValidate, validate],
  signupUser
);

usersRouter.post(
  '/login',
  [emailValidator, passwordValidator, validate],
  loginUser
);

usersRouter.post('/logout', logoutUser);

usersRouter.post('/refresh', regenerateToken);

usersRouter.get('/favourites', auth, showFavourites);

usersRouter.post('/favourites/:bookId', auth, addToFavourites);

usersRouter.delete('/favourites/:bookId', auth, removeFromFavourites);

export default usersRouter;
