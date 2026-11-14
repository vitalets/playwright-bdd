/**
 * Class level @Fixture decorator.
 *
 * This decorator is needed to get access to class Constructor,
 * that in turn is needed to build POM inheritance graph using prototype chain.
 * Method decorators don't have access to Constructor in decoration phase,
 * only in runtime (that is too late).
 *
 * An earlier proposal would have eliminated @Fixture:
 * const { Given, When, Then } = createBddDecorators(test, { pomFixture: 'myPOM' });
 * This cannot provide the constructor during decoration, for the reason above.
 * Passing test also creates cyclic dependencies: the fixture imports test,
 * and test imports the fixture.
 *
 * Current implementation of createBddDecorators() configures method decorators
 * but still requires @Fixture to register the class in the POM inheritance graph.
 * `Fixture` is returned from createBddDecorators() just for convenience, to avoid having additional import.
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

type FixtureOptions<T extends KeyValue> = {
  name?: CustomTestFixtureName<T>;
  tags?: string;
};

export function Fixture<T extends KeyValue>(arg: CustomTestFixtureName<T> | FixtureOptions<T>) {
  const { name, tags } = resolveFixtureOptions(arg);
  // context parameter is required for decorator by TS even though it's not used
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  return (Ctor: Function, _context: ClassDecoratorContext) => {
    createPomNode(Ctor, name as string, tags);
  };
}

function resolveFixtureOptions<T extends KeyValue>(
  arg: CustomTestFixtureName<T> | FixtureOptions<T>,
): FixtureOptions<T> {
  return typeof arg === 'string' ? { name: arg } : arg;
}
