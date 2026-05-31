import { Role } from './domain';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        role: Role;
        email: string;
      };
    }
  }
}
