import { createBddDecorators } from 'playwright-bdd';

const configured = createBddDecorators({ bddExpr: true });
const defaults = createBddDecorators();

export class DecoratorParameters {
  @configured.Given('count {int}')
  valid(_count: number) {}

  // @ts-expect-error Built-in types are validated even without strict null checking.
  @configured.Given('count {int}')
  invalid(_count: string) {}

  @configured.Given('count {int}', { bddExpr: false })
  disabled(_count: string) {}

  @defaults.Given('count {int}')
  defaultDisabled(_count: string) {}
}
