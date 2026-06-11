import { startServer } from 'next/dist/server/lib/start-server.js';

const port = process.env.PORT || process.env.NEXT_PORT || '3001';
const hostname = process.env.HOSTNAME || '0.0.0.0';

await startServer({
  dir: process.cwd(),
  port: Number(port),
  hostname,
  isDev: false
});
