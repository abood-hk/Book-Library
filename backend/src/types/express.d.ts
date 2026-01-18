import { IAccessPayload } from '../interfaces/IPayload.js';

declare global {
  namespace Express {
    interface Request {
      user?: IAccessPayload;
    }
  }
}

export {};
