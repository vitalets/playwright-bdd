import { test, Fixtures } from '@playwright/test';
import { Location } from '@playwright/test/reporter';
import { getSymbolByName } from '../utils';
import { TestTypeCommon } from './types';

export type FixturesWithLocation = {
  fixtures: Fixtures;
  location: Location;
};

const testTypeSymbol = getSymbolByName(test, 'testType');

export function getLastFixtureLocation(test: TestTypeCommon) {
  // @ts-expect-error testTypeSymbol
  const fixtures = test[testTypeSymbol].fixtures as FixturesWithLocation[];
  return fixtures.slice(-1)[0].location;
}
