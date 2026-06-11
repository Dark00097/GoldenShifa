import { createRequire } from 'module';
import { spawn } from 'child_process';

const require = createRequire(import.meta.url);
const port = process.env.PORT || process.env.NEXT_PORT || '3001';

const child = spawn(
  process.execPath,
  [require.resolve('next/dist/bin/next'), 'start', '-H', '0.0.0.0', '-p', port],
  { stdio: 'inherit' }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
