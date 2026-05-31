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

Avant de lancer le backend, importer `goldenshifa.sql` dans phpMyAdmin ou avec la CLI MySQL.

Frontend: `http://localhost:3001`

API: `http://localhost:4000/api`

Si les ports de developpement restent bloques apres un arret force:

```bash
npm run dev:free-ports
```

## Base de donnees

Pour XAMPP en local avec l'utilisateur `root` sans mot de passe:

```env
DATABASE_URL="mysql://root@127.0.0.1:3306/goldenshifa"
```

Import phpMyAdmin:

1. Ouvrir phpMyAdmin.
2. Creer ou selectionner la base `goldenshifa`.
3. Aller dans l'onglet Importer.
4. Choisir `goldenshifa.sql`.
5. Lancer l'import.

Import CLI:

```bash
mysql -u root < goldenshifa.sql
```

## Variables d'environnement

Voir:

- `.env.example`
- `client/.env.example`
- `server/.env.example`

Variables principales:

```env
NODE_ENV="production"
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/goldenshifa"
JWT_SECRET="replace-with-a-long-random-production-secret"
JWT_EXPIRES_IN="7d"
SERVER_PORT="4000"
CLIENT_URL="https://votre-domaine.com"
CORS_ORIGINS="https://votre-domaine.com,https://www.votre-domaine.com"
NEXT_PUBLIC_API_URL="https://api.votre-domaine.com/api"
NEXT_PUBLIC_SITE_URL="https://votre-domaine.com"
PAYMENT_PROVIDER="manual"
AUTH_RATE_LIMIT_WINDOW_MS="900000"
AUTH_RATE_LIMIT_MAX="20"
MAX_IMAGE_SIZE_MB="5"
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
