import express from 'express';
import auth from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnlyMiddleware.js';
import {
  adminRemoveReview,
  blacklistBook,
  removeFromBlacklist,
} from '../controllers/adminController.js';
import superAdminOnly from '../middleware/superAdminsOnlyMiddleware.js';
import {
  promoteToAdmin,
  demoteAdmin,
} from '../controllers/superAdminController.js';

const adminRouter = express.Router();

adminRouter.delete('/reviews/:reviewId', [auth, adminOnly], adminRemoveReview);
adminRouter.post('/books/:bookOlid', [auth, adminOnly], blacklistBook);
adminRouter.delete(
  '/blacklist/:bookOlid',
  [auth, adminOnly],
  removeFromBlacklist,
);

adminRouter.put('/users/:userId', [auth, superAdminOnly], promoteToAdmin);
adminRouter.put('/users/:userId', [auth, superAdminOnly], demoteAdmin);

export default adminRouter;
