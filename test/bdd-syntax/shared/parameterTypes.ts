import { defineParameterType } from 'playwright-bdd';

export type Color = 'red' | 'blue' | 'yellow';

defineParameterType({
  name: 'color',
  regexp: /red|blue|yellow/,
  transformer: (s) => s.toLowerCase() as Color,
});

defineParameterType({
  name: 'param-no-transformer',
  regexp: /"(dog|cat)"/,
});

defineParameterType({
  name: 'world-value',
  regexp: /"([^"]+)"/,
  transformer(this: Record<string, unknown>, key: string) {
    return this[key];
  },
});
