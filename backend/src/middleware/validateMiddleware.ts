import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const emailValidator = body('email')
  .trim()
  .notEmpty()
  .withMessage('Email is required')
  .isEmail()
  .withMessage('Email is invalid')
  .normalizeEmail();

export const passwordValidator = body('password')
  .notEmpty()
  .withMessage('Password is required')
  .isLength({ min: 7, max: 17 })
  .withMessage('Password must be 7-17 characters long')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[a-z]/)
  .withMessage('Password must contain at least one lowercase letter')
  .matches(/[0-9]/)
  .withMessage('Password must contain at least one number')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain at least one special character');

export const usernameValidate = body('username')
  .trim()
  .notEmpty()
  .withMessage('Username is required')
  .isLength({ min: 3, max: 15 })
  .withMessage('Username must be 3-15 characters')
  .matches(/^[a-zA-Z0-9_]+$/)
  .withMessage('Username can only contain letters, numbers, and underscores');

export const ratingValidate = body('rating')
  .exists()
  .withMessage('rating is required')
  .isNumeric()
  .withMessage('Rating must be a number')
  .custom((value) => {
    if (!Number.isInteger(value)) {
      throw new Error('Rating must be an integer');
    }
    if (value < 1 || value > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
    return true;
  });

export const contentValidate = body('content')
  .optional()
  .isString()
  .isLength({ min: 1, max: 700 })
  .withMessage('Comment must be between 1 and 700 characters');

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  next();
};
