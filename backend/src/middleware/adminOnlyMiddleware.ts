import { Request, Response, NextFunction } from 'express';

const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

export default adminOnly;
