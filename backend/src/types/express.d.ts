import { IAccessPayload } from '../interfaces/IPayload';

declare global {
  namespace Express {
    interface Request {
      user?: IAccessPayload;
    }
  }
}

export {};
