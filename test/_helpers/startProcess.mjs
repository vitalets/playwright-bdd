import { spawn } from 'node:child_process';

export function startProcess(commandInput, { args = [], cwd, env = {} } = {}) {
  const [command, ...commandArgs] = Array.isArray(commandInput)
    ? commandInput
    : commandInput.split(' ');
  const child = spawn(command, [...commandArgs, ...args], {
    cwd,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => (output += chunk));
  child.stderr.on('data', (chunk) => (output += chunk));

  return {
    get exitCode() {
      return child.exitCode;
    },
    get output() {
      return output;
    },
    async waitForOutput(expected, offset = 0) {
      const start = Date.now();
      while (!output.slice(offset).includes(expected)) {
        if (child.exitCode !== null) throw new Error(`Process exited.\n${output}`);
        if (Date.now() - start > 10_000) throw new Error(`Timed out waiting for: ${expected}`);
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    },
    async waitForExit() {
      if (child.exitCode === null) await new Promise((resolve) => child.once('exit', resolve));
    },
    async stop() {
      if (child.exitCode !== null) return;
      child.kill('SIGTERM');
      await new Promise((resolve) => child.once('exit', resolve));
    },
  };
}
