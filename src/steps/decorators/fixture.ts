/**
 * Class level @Fixture decorator.
 */

import { TestType } from '@playwright/test';
import { KeyValue, PwBuiltInFixturesTest } from '../../playwright/types';
import { createPomNode } from './pomGraph';

// These types allow to restrict fixture name to only defined in test
// T can be typeof test or fixtures type itself
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AvailableFixtures<T extends KeyValue> = T extends TestType<infer U, any> ? U : T;
type CustomTestFixtureName<T extends KeyValue> = Exclude<
  keyof AvailableFixtures<T>,
  keyof PwBuiltInFixturesTest | number | symbol
>;

export function Fixture<T extends KeyValue>(fixtureName: CustomTestFixtureName<T>) {
  // context parameter is required for decorator by TS even though it's not used
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (Ctor: Function, _context: ClassDecoratorContext) => {
    createPomNode(Ctor, fixtureName as string);
  };
}
