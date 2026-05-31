import { app } from './app';
import { env } from './config/env';

const port = Number(process.env.PORT || env.SERVER_PORT);

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
