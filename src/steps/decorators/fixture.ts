/**
 * Class level @Fixture decorator.
 */

import { CustomFixtures, KeyValue } from '../../playwright/types';
import { createPomNode } from './pomGraph';

export function Fixture<T extends KeyValue>(fixtureName: keyof CustomFixtures<T>) {
  // context parameter is required for decorator by TS even though it's not used
  // eslint-disable-next-line @typescript-eslint/ban-types
  return (Ctor: Function, _context: ClassDecoratorContext) => {
    createPomNode(Ctor, fixtureName);
  };
}
