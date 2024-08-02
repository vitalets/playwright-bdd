import { defineParameterType } from 'playwright-bdd';

type Color = 'red' | 'blue' | 'yellow';

defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});
