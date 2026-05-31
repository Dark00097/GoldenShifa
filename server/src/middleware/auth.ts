import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '../types/domain';

type JwtPayload = {
  id: number;
  role: Role;
  email: string;
};

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Connexion requise.' });
  }

  try {
    const token = header.slice('Bearer '.length);
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    return next();
  } catch {
    return res.status(401).json({ message: 'Session invalide ou expiree.' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Acces administrateur requis.' });
  }

  return next();
}
