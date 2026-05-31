# Hostinger Deployment

This project has two Node.js apps:

- `client`: Next.js storefront/admin UI
- `server`: Express API

Deploy them as two Hostinger Node.js websites/apps:

1. `api.your-domain.com` -> `server`
2. `your-domain.com` -> `client`

## 1. Create the MySQL Database

In hPanel, open Databases > MySQL Databases and create a database.

Import `goldenshifa.sql` into that database using phpMyAdmin.

Build the connection string like this:

```env
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
```

## 2. Deploy the API App

In hPanel, add a Node.js Web App from GitHub or ZIP.

Use the `server` folder as the app/root folder if Hostinger asks.

Recommended settings:

```text
Framework: Express.js or Other
Install command: npm install
Build command: npm run build
Start command: npm start
Output directory: dist
Entry file: dist/index.js
Node version: 22.x
```

Environment variables:

```env
NODE_ENV=production
DATABASE_URL=mysql://DB_USER:DB_PASSWORD@localhost:3306/DB_NAME
JWT_SECRET=replace-with-a-long-random-secret-at-least-20-characters
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-domain.com
CORS_ORIGINS=https://your-domain.com,https://www.your-domain.com
PAYMENT_PROVIDER=manual
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX=20
MAX_IMAGE_SIZE_MB=5
UPLOAD_DIR=uploads
```

After deployment, test:

```text
https://api.your-domain.com/api/health
```

It should return JSON with `status: ok`.

## 3. Deploy the Next.js App

In hPanel, add another Node.js Web App from GitHub or ZIP.

Use the `client` folder as the app/root folder if Hostinger asks.

Recommended settings:

```text
Framework: Next.js
Install command: npm install
Build command: npm run build
Start command: npm start
Output directory: .next
Node version: 22.x
```

Environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 4. Uploads Note

Product images are served by the API from `/uploads`.

Hostinger deployments can replace application files during redeploys, so keep a backup of uploaded files or move uploads to persistent storage before the site has real users.
