import { Request, Response, NextFunction } from 'express';

const superAdminOnly = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  if (user.role !== 'super admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};

export default superAdminOnly;
