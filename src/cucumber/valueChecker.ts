/**
 * Based on: https://github.com/cucumber/cucumber-js/blob/main/src/value_checker.ts
 */

export function doesHaveValue<T>(value: T): value is NonNullable<T> {
  return !doesNotHaveValue(value);
}

export function doesNotHaveValue<T>(value: T): value is Extract<T, null | undefined> {
  return value === null || value === undefined;
}

export function valueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  if (doesHaveValue(value)) {
    return value;
  }
  return defaultValue;
}
