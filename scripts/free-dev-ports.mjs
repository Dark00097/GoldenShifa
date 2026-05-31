import { execFileSync } from 'node:child_process';
import { existsSync, rmSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const envPath = resolve(root, '.env');
const envText = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';

function envValue(name) {
  const match = envText.match(new RegExp(`^${name}=(.+)$`, 'm'));
  return match?.[1]?.trim().replace(/^["']|["']$/g, '');
}

const serverPort = Number(process.env.SERVER_PORT || envValue('SERVER_PORT') || 4000);
const cleanNext = process.argv.includes('--clean-next');
const serverOnly = process.argv.includes('--server-only');
const clientOnly = process.argv.includes('--client-only');
const ports = [
  ...new Set([
    clientOnly || (!serverOnly && !clientOnly) ? 3001 : null,
    serverOnly || (!serverOnly && !clientOnly) ? serverPort : null
  ].filter(Boolean))
];

function findWindowsListeners(port) {
  const output = execFileSync('netstat.exe', ['-ano', '-p', 'tcp'], { encoding: 'utf8' });
  const listeners = new Set();

  for (const line of output.split(/\r?\n/)) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 5 || parts[0] !== 'TCP') continue;

    const [protocol, localAddress, , state, pid] = parts;
    if (protocol === 'TCP' && state === 'LISTENING' && localAddress.endsWith(`:${port}`)) {
      listeners.add(pid);
    }
  }

  return [...listeners];
}

function findUnixListeners(port) {
  try {
    const output = execFileSync('lsof', ['-ti', `tcp:${port}`], { encoding: 'utf8' });
    return output.split(/\r?\n/).map((pid) => pid.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function killPid(pid) {
  if (process.platform === 'win32') {
    execFileSync('taskkill.exe', ['/PID', pid, '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  execFileSync('kill', ['-TERM', pid], { stdio: 'ignore' });
}

for (const port of ports) {
  const pids = process.platform === 'win32' ? findWindowsListeners(port) : findUnixListeners(port);

  for (const pid of pids) {
    try {
      killPid(pid);
      console.log(`Freed port ${port} by stopping process ${pid}.`);
    } catch (error) {
      console.warn(`Could not stop process ${pid} on port ${port}: ${error.message}`);
    }
  }
}

if (cleanNext) {
  const nextDir = resolve(root, 'client', '.next');
  if (existsSync(nextDir)) {
    rmSync(nextDir, { recursive: true, force: true });
    console.log('Removed client/.next cache.');
  }
}
