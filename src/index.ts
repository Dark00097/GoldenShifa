import { app } from './app';
import { env } from './config/env';
import { ensureSchema } from './lib/schema';

const port = Number(process.env.PORT || env.SERVER_PORT);

async function start() {
  await ensureSchema();

  const server = app.listen(port, () => {
    console.log(`GoldenShifa API demarree sur http://localhost:${port}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `Le port ${port} est deja utilise. Fermez l'ancien serveur ou changez SERVER_PORT dans .env.`
      );
      process.exit(1);
    }

    throw error;
  });
}

start().catch((error) => {
  console.error('Initialisation API impossible.', error);
  process.exit(1);
});
