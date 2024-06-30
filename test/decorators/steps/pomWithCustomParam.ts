import { Given, Fixture } from 'playwright-bdd/decorators';
import { defineParameterType } from 'playwright-bdd';
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
  @Given('step with custom param {color}')
  step(color: Color) {
    expect(color).toMatch(/red|blue|yellow/);
  }
}
