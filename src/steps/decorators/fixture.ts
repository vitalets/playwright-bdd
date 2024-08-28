/**
 * Class level @Fixture decorator.
 */

import { TestType } from '@playwright/test';
import { KeyValue } from '../../playwright/types';
import { createPomNode } from './pomGraph';

// These types allow to restrict fixture name to only defined in test
// T can be typeof test or fixtures type itself
type AvailableFixtures<T extends KeyValue> = T extends TestType<infer U, infer W> ? U & W : T;
type AvailableFixtureName<T extends KeyValue> = Omit<keyof AvailableFixtures<T>, number | symbol>;

export function Fixture<T extends KeyValue>(fixtureName: AvailableFixtureName<T>) {
  // context parameter is required for decorator by TS even though it's not used
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (Ctor: Function, _context: ClassDecoratorContext) => {
    createPomNode(Ctor, fixtureName as string);
  };
}
