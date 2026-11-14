import { expect } from '@playwright/test';
import { Before, BeforeStep } from './fixtures';

Before(({ $step }) => {
  expect(() => $step.info).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.attach('outside')).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.skip(false)).toThrow('available only in BDD steps and step hooks');
});

BeforeStep({ tags: '@skip-in-before-step-hook' }, ({ $step, log }) => {
  log('unnamed before gate');
  $step.skip($step.title === 'the body must not run', 'before reason');
});

BeforeStep(
  { name: 'named before gate', tags: '@skip-in-named-before-step-hook' },
  ({ $step, log }) => {
    log('named before gate');
    $step.skip($step.title === 'the body must not run', 'before reason');
  },
);

// These hooks must not run after either skip gate has taken effect.
BeforeStep(({ $step, log }) => {
  expect($step.title).not.toBe('the body must not run');
  log('unnamed before');
});

BeforeStep({ name: 'named before' }, ({ log }) => {
  log('named before');
});
