import { Fixture } from './fixture';
import { createStepDecorator } from './steps';
import { CreateBddDecoratorsOptions } from './types';

/** Creates step decorators with shared tags and BDD expression defaults. */
export function createBddDecorators<BddExpr extends boolean = false>(
  options: CreateBddDecoratorsOptions<BddExpr> = {},
) {
  // Capture values once so later option mutations cannot change these decorators.
  const defaults = { tags: options.tags, bddExpr: options.bddExpr };
  return {
    Fixture,
    Given: createStepDecorator('Given', defaults),
    When: createStepDecorator('When', defaults),
    Then: createStepDecorator('Then', defaults),
    Step: createStepDecorator('Unknown', defaults),
  };
}
