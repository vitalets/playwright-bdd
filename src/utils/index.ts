export function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

export function exitWithMessage(...messages: string[]) {
  log(...messages);
  process.exit(1);
}
