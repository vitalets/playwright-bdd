import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { BDDGEN_CMD } from '../../_helpers/index.mjs';

export function startWatchProcess({ cwd = watchModeDir, args = [], env = {} } = {}) {
  const [command, ...commandArgs] = BDDGEN_CMD.split(' ');
  const child = spawn(command, [...commandArgs, '--watch', ...args], {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => (output += chunk));
  child.stderr.on('data', (chunk) => (output += chunk));

  return {
    get output() {
      return output;
    },
    async waitForOutput(expected, offset = 0) {
      await waitFor(() => {
        if (output.slice(offset).includes(expected)) return true;
        if (child.exitCode !== null) throw new Error(`Watch process exited.\n${output}`);
        return false;
      });
    },
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => child.once('exit', resolve));
    },
  };
}

const watchModeDir = fileURLToPath(new URL('../', import.meta.url));

async function waitFor(predicate, timeout = 10_000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeout) throw new Error(`Timed out waiting.\n${predicate}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}
