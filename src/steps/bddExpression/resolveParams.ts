/** Resolve positional and named BDD expression parameter values. */
import type { Argument } from 'bdd-expressions' with { 'resolution-mode': 'import' };

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
