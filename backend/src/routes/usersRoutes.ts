import express from 'express';
import {
  loginUser,
  signupUser,
  regenerateToken,
} from '../controllers/usersController.js';
import {
  emailValidator,
  passwordValidator,
  usernameValidate,
  validate,
} from '../middleware/validateMiddleware.js';

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

usersRouter.post('/refresh', regenerateToken);

export default usersRouter;
