import express from 'express';
import {
  loginUser,
  signupUser,
  regenerateToken,
  logoutUser,
} from '../controllers/authController.js';
import {
  contentValidate,
  emailValidator,
  passwordValidator,
  ratingValidate,
  usernameValidate,
  validate,
} from '../middleware/validateMiddleware.js';
import {
  addToFavourites,
  showFavourites,
  removeFromFavourites,
  getFavouritesIds,
} from '../controllers/favouriteController.js';
import {
  addReview,
  removeReview,
  getReviews,
  updateReview,
} from '../controllers/reviewController.js';
import auth from '../middleware/authMiddleware.js';

const usersRouter = express.Router();

usersRouter.post(
  '/signup',
  [emailValidator, passwordValidator, usernameValidate, validate],
  signupUser,
);
usersRouter.post(
  '/login',
  [emailValidator, passwordValidator, validate],
  loginUser,
);
usersRouter.post('/logout', logoutUser);

usersRouter.get('/favourites', auth, showFavourites);
usersRouter.get('/favouritesIds', auth, getFavouritesIds);
usersRouter.post('/refresh', regenerateToken);
usersRouter.post('/favourites/:bookId', auth, addToFavourites);
usersRouter.delete('/favourites/:bookId', auth, removeFromFavourites);

usersRouter.get('/reviews/:bookId', getReviews);
usersRouter.post(
  '/reviews/:bookId',
  [auth, ratingValidate, contentValidate, validate],
  addReview,
);
usersRouter.put(
  '/reviews/:bookId',
  [auth, ratingValidate, contentValidate, validate],
  updateReview,
);
usersRouter.delete('/reviews/:bookId', auth, removeReview);

export default usersRouter;
