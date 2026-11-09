import { createBddDecorators } from 'playwright-bdd';

type Color = 'red' | 'blue' | 'yellow';

declare const runtimeFlag: boolean;
declare const dynamicPattern: string;

const configured = createBddDecorators({ tags: '@cart', bddExpr: true });
const defaults = createBddDecorators();
const disabled = createBddDecorators({ bddExpr: false });
const dynamic = createBddDecorators({ bddExpr: runtimeFlag });

export class ConfiguredDecoratorParameters {
  @configured.Given('count :count{int}', { tags: '@extra' })
  valid(_count: number) {}

  // @ts-expect-error The factory enables validation when the step omits bddExpr.
  @configured.Given('count {int}')
  incompatible(_count: string) {}

  // @ts-expect-error Other step options preserve the factory's validation default.
  @configured.When('count {int}', { tags: '@extra', timeout: 1000 })
  incompatibleWithOptions(_count: string) {}

  // @ts-expect-error All configured step keywords validate signatures.
  @configured.Then('color {red/blue}')
  incompatibleChoice(_color: 'red') {}

  // @ts-expect-error Optional captures still require undefined support.
  @configured.Step('count( {int})')
  incompatibleOptional(_count: number) {}

  @configured.Given('custom {color} with {int}')
  custom(_color: Color, _count: number) {}

  @configured.Given('count {int}', { bddExpr: false })
  optOut(_count: string) {}

  @configured.Given('count {int}', { bddExpr: runtimeFlag })
  dynamicOverride(_count: string) {}

  @defaults.Given('count {int}')
  defaultDisabled(_count: string) {}

  @disabled.Given('count {int}')
  explicitlyDisabled(_count: string) {}

  // @ts-expect-error Explicit opt-in overrides the disabled factory default.
  @disabled.Given('count {int}', { bddExpr: true })
  explicitOptIn(_count: string) {}

  @dynamic.Given('count {int}')
  unknownDefault(_count: string) {}

  // @ts-expect-error A literal true override enables validation with a dynamic default.
  @dynamic.Given('count {int}', { bddExpr: true })
  knownOverride(_count: string) {}

  @configured.Given(dynamicPattern)
  unknownPattern(_count: string) {}

  @configured.Given(/^count (\d+)$/)
  regex(_count: string) {}
}
