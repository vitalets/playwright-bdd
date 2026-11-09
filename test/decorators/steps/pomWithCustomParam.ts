import { Given, Fixture } from 'playwright-bdd/decorators';
import { defineParameterType, type BddTestFixtures } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';
import { test } from './fixtures';
import { expect } from '@playwright/test';

type Color = 'red' | 'blue' | 'yellow';
defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});

export
@Fixture<typeof test>('pomWithCustomParam')
class PomWithCustomParam {
  constructor(private $step: BddTestFixtures['$step']) {}

  @Given('step with custom param {color}')
  step(color: Color) {
    expect(color).toMatch(/red|blue|yellow/);
  }

  @Given('BDD custom color :color{color} with count {int}', { bddExpr: true })
  bddStep(color: Color, count: number) {
    expectTypeOf(color).toEqualTypeOf<Color>();
    expectTypeOf(this.$step.params.color).toEqualTypeOf<unknown>();
    expect(color).toBe('blue');
    expect(count).toBe(2);
    expect(this.$step.params).toEqual({ color: 'blue' });
  }

  @Given('BDD optional color( :color{color})', { bddExpr: true })
  optionalColor(color?: Color) {
    expect(color).toBe(this.$step.title.endsWith('yellow') ? 'yellow' : undefined);
    expect(this.$step.params).toEqual({ color });
  }
}
