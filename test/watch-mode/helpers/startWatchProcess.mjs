import { fileURLToPath } from 'node:url';
import { BDDGEN_CMD, startProcess } from '../../_helpers/index.mjs';

export function startWatchProcess({ cwd = watchModeDir, args = [], env = {} } = {}) {
  return startProcess(BDDGEN_CMD, {
    args: ['--watch', ...args],
    cwd,
    env,
  });
}

const watchModeDir = fileURLToPath(new URL('../', import.meta.url));
