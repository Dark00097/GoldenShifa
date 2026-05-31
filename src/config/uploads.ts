import fs from 'fs';
import path from 'path';
import { env } from './env';

function resolveUploadDir() {
  if (env.UPLOAD_DIR) {
    return path.resolve(process.cwd(), env.UPLOAD_DIR);
  }

  const candidates = [
    path.resolve(process.cwd(), 'uploads'),
    path.resolve(process.cwd(), '../uploads'),
    path.resolve(__dirname, '../../../uploads')
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0];
}

export const uploadDir = resolveUploadDir();

fs.mkdirSync(uploadDir, { recursive: true });
