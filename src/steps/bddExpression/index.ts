/** Load the ESM-only expression engine before synchronous step matching starts. */
import type { BddExpression, ParameterTypeRegistry } from 'bdd-expressions' with {
  'resolution-mode': 'import',
};
import { DataTable } from '../../cucumber/DataTable';
import { parameterTypeRegistry as cucumberExpressionsRegistry } from '../parameterTypes';

let Expression: typeof BddExpression;
let bddExpressionRegistry: ParameterTypeRegistry<DataTable>;

// Cucumber provides the text parameter types but has no built-in DocString or DataTable types.
// Fall back to the BDD registry for those types, while keeping user-defined types authoritative,
// including custom text types named DocString or DataTable.
const bddExpressionRegistryFacade: ParameterTypeRegistry<DataTable> = {
  lookupByTypeName: (name) =>
    cucumberExpressionsRegistry.lookupByTypeName(name) ??
    bddExpressionRegistry.lookupByTypeName(name),
};

export async function importBddExpressions() {
  const library = await import('bdd-expressions');
  Expression = library.BddExpression;
  bddExpressionRegistry = library.createParameterTypeRegistry<DataTable>();
}

export function createBddExpression(pattern: string) {
  // Runtime compilation does not need the type-level parser.
  return new Expression<Record<string, unknown>>(pattern, bddExpressionRegistryFacade);
}
