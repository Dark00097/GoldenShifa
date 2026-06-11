# GoldenShifa

GoldenShifa est une plateforme ecommerce full-stack en francais pour vendre du miel naturel, des produits de la ruche et des coffrets bien-etre.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Axios
- Backend: Node.js, Express.js, TypeScript
- Base de donnees: MySQL, importable depuis phpMyAdmin avec `goldenshifa.sql`
- Authentification admin: JWT
- Securite: bcrypt, validation Zod, CORS configure, rate limiting auth, uploads images limites et filtres

## Structure

```text
/client          Frontend Next.js
/server          API Express
/uploads         Images produits et accueil
/goldenshifa.sql Schema et donnees initiales MySQL
```

## Installation locale

```bash
npm install
copy .env.example .env
npm run dev
```

## Scripts

```bash
npm run dev
npm run dev:free-ports
npm run dev:reset
npm run build
npm run start:client
npm run start:server
```

## Compte admin initial

```text
Admin: admin@goldenshifa.com / Admin123!
```

## API principale

- `POST /api/auth/admin/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/products/category/:slug`
- `GET /api/categories`
- `POST /api/checkout`
- `POST /api/coupons/validate`
- `GET /api/settings`
- `GET /api/admin/dashboard/stats`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/products/:id`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `POST /api/admin/products/:id/images`
- `GET /api/admin/categories`
- `POST /api/admin/categories`
- `PUT /api/admin/categories/:id`
- `DELETE /api/admin/categories/:id`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PUT /api/admin/orders/:id/status`
- `GET /api/admin/coupons`
- `POST /api/admin/coupons`
- `PUT /api/admin/coupons/:id`
- `DELETE /api/admin/coupons/:id`
- `GET /api/admin/inventory`
- `PUT /api/admin/inventory/:productId`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/admin/settings/homepage-images/:slot`

## Deploiement

1. Creer une base MySQL chez l'hebergeur.
2. Importer `goldenshifa.sql`.
3. Configurer `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `CORS_ORIGINS` et les variables frontend.
4. Builder le backend avec `npm install && npm run build --workspace server`.
5. Builder le frontend avec `npm install && npm run build --workspace client`.

Le backend sert les images depuis `/uploads`. Verifier que le dossier `uploads` est deploye et que l'application Node.js a le droit d'ecrire dedans.
