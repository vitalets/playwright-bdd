export function log(...args: unknown[]) {
  // eslint-disable-next-line no-console
  console.log(...args);
}

export function exitWithMessage(...messages: string[]) {
  log('ERROR:\n', ...messages);
  process.exit(1);
}

// See: https://stackoverflow.com/questions/50453640/how-can-i-get-the-value-of-a-symbol-property
export function getSymbolByName<T extends object>(target: T, name?: string) {
  const ownKeys = Reflect.ownKeys(target);
  const symbol = ownKeys.find((key) => key.toString() === `Symbol(${name})`);
  if (!symbol) {
    throw new Error(`Symbol "${name}" not found in target. ownKeys: ${ownKeys}`);
  }
  return symbol as keyof T;
}
