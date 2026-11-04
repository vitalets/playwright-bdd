/** Load the ESM-only expression engine before synchronous step matching starts. */
import type { Argument, BddExpression } from 'bdd-expressions' with { 'resolution-mode': 'import' };
import { parameterTypeRegistry } from '../parameterTypes';

let Expression: typeof BddExpression;

export async function loadBddExpressions() {
  ({ BddExpression: Expression } = await import('bdd-expressions'));
}

export function createBddExpression(pattern: string) {
  // Runtime compilation does not need the type-level parser.
  return new Expression<Record<string, unknown>>(pattern, parameterTypeRegistry);
}

export async function resolveBddExpressionParams(
  args: readonly Pick<Argument, 'name' | 'getValue'>[],
  world: unknown,
) {
  const values = await Promise.all(args.map((arg) => arg.getValue(world)));
  const params: Record<string, unknown> = Object.create(null);
  // Reuse resolved values in argument order, regardless of transformer completion order.
  args.forEach((arg, index) => {
    if (arg.name !== undefined) params[arg.name] = values[index];
  });
  return Object.defineProperty(values, 'params', { value: params }) as unknown[] & {
    readonly params: Record<string, unknown>;
  };
}
