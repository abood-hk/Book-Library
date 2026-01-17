import express from 'express';
import auth from '../middleware/authMiddleware';
import adminOnly from '../middleware/adminOnlyMiddleware';
import {
  adminRemoveReview,
  blacklistBook,
  removeFromBlacklist,
} from '../controllers/adminController';

const adminRouter = express.Router();

adminRouter.delete('/reviews/:reviewId', [auth, adminOnly], adminRemoveReview);
adminRouter.post('/books/:bookOlid', [auth, adminOnly], blacklistBook);
adminRouter.delete(
  '/blacklist/:bookOlid',
  [auth, adminOnly],
  removeFromBlacklist
);

export default adminRouter;
