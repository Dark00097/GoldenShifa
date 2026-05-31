import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route introuvable: ${req.method} ${req.path}` });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: 'Donnees invalides.', errors: error.flatten() });
  }

  const message = error instanceof Error ? error.message : 'Erreur serveur.';
  const status = message.includes('CORS') ? 403 : 500;

  console.error(error);
  return res.status(status).json({ message: status === 500 ? 'Erreur serveur.' : message });
}
