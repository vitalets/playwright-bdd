import path from 'node:path';
import { removeDuplicates } from '../../utils';

export function isWatchedFile(
  filePath: string,
  extensions: string[],
  directFilesToWatch: string[],
) {
  const absolutePath = path.resolve(filePath);
  if (directFilesToWatch.includes(absolutePath)) return true;
  return extensions.includes(path.extname(absolutePath).toLowerCase());
}

export function normalizeExtensions(extensions: string[]) {
  return removeDuplicates(
    extensions.map((extension) => {
      const normalized = extension.toLowerCase();
      return normalized.startsWith('.') ? normalized : `.${normalized}`;
    }),
  );
}
