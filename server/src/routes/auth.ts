import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { row } from '../lib/db';
import { requireAuth } from '../middleware/auth';
import { Role } from '../types/domain';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function signToken(user: { id: number; email: string; role: Role }) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
    ...options
  });
}

authRouter.post('/admin/login', async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const admin = await row<any>('SELECT * FROM Admin WHERE email = ? LIMIT 1', [data.email]);

    if (!admin || !admin.isActive || !(await bcrypt.compare(data.password, admin.password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    return res.json({
      user: { id: admin.id, name: admin.name, email: admin.email, role: Role.ADMIN },
      token: signToken({ id: admin.id, email: admin.email, role: Role.ADMIN })
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  if (req.user!.role !== Role.ADMIN) {
    return res.status(403).json({ message: 'Acces administrateur requis.' });
  }

  const user = await row<any>('SELECT id, name, email, role FROM Admin WHERE id = ? LIMIT 1', [req.user!.id]);
  return res.json({ user });
});
