import path from 'node:path';
import { fork } from 'node:child_process';
import { WATCH_CHILD_ENV } from './ipc';

const CLI_PATH = path.resolve(__dirname, '..', 'index.js');

export function forkWatchChild() {
  return fork(CLI_PATH, getChildArgs(), {
    env: getRebuildEnv(),
    stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
  });
}

function getChildArgs() {
  return process.argv.slice(2).filter((arg) => arg !== '--watch');
}

function getRebuildEnv() {
  const env: NodeJS.ProcessEnv = { ...process.env, [WATCH_CHILD_ENV]: '1' };
  // Force the child to rebuild BDD configs from the Playwright config instead of reusing
  // serialized configs inherited from the previous generation.
  delete env.PLAYWRIGHT_BDD_CONFIGS;
  return env;
}
