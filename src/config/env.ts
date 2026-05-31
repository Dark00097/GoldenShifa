import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

const envFiles = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env')
];

for (const file of envFiles) {
  dotenv.config({ path: file, override: false });
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(20, 'JWT_SECRET doit contenir au moins 20 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SERVER_PORT: z.coerce.number().default(4000),
  CLIENT_URL: z.string().url().default('http://localhost:3001'),
  CORS_ORIGINS: z.string().optional(),
  PAYMENT_PROVIDER: z.string().default('manual'),
  AUTH_RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),
  MAX_IMAGE_SIZE_MB: z.coerce.number().default(5),
  UPLOAD_DIR: z.string().optional()
});

export const env = envSchema.parse(process.env);
