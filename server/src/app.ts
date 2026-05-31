import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { uploadDir } from './config/uploads';
import { adminRouter } from './routes/admin';
import { authRouter } from './routes/auth';
import { adminCategoriesRouter, categoriesRouter } from './routes/categories';
import { checkoutRouter } from './routes/checkout';
import { adminCouponsRouter, couponsRouter } from './routes/coupons';
import { inventoryRouter } from './routes/inventory';
import { adminOrdersRouter } from './routes/orders';
import { adminProductsRouter, productsRouter } from './routes/products';
import { adminSettingsRouter, settingsRouter } from './routes/settings';
import { errorHandler, notFound } from './middleware/error';

export const app = express();

const allowedOrigins = (env.CORS_ORIGINS || env.CLIENT_URL)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOriginSet = new Set(allowedOrigins);
const devClientPorts = new Set(['3000', '3001', '3002']);

function isPrivateNetworkHost(hostname: string) {
  return /^(localhost|127\.0\.0\.1|\[::1\]|::1)$/.test(hostname)
    || /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)
    || /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)
    || /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);
}

function isAllowedDevOrigin(origin: string) {
  if (env.NODE_ENV === 'production') return false;

  try {
    const url = new URL(origin);
    return url.protocol === 'http:' && devClientPorts.has(url.port) && isPrivateNetworkHost(url.hostname);
  } catch {
    return false;
  }
}

app.disable('x-powered-by');
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOriginSet.has(origin) || isAllowedDevOrigin(origin)) return callback(null, true);
      return callback(new Error(`Origine CORS non autorisee: ${origin}`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GoldenShifa API' });
});

app.use(
  '/api/auth',
  rateLimit({
    windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
    max: env.AUTH_RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Trop de tentatives. Veuillez reessayer plus tard.' }
  }),
  authRouter
);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/checkout', checkoutRouter);
app.use('/api/coupons', couponsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/admin/products', adminProductsRouter);
app.use('/api/admin/categories', adminCategoriesRouter);
app.use('/api/admin/orders', adminOrdersRouter);
app.use('/api/admin/coupons', adminCouponsRouter);
app.use('/api/admin/inventory', inventoryRouter);
app.use('/api/admin/settings', adminSettingsRouter);

app.use(notFound);
app.use(errorHandler);
