import { expect } from '@playwright/test';
import { After, AfterStep } from './fixtures';

// After hooks run in reverse registration order.
AfterStep({ tags: '@error-in-after-step-hook' }, () => {
  throw new Error('real after error');
});

AfterStep({ name: 'named failure', tags: '@error-in-named-after-step-hook' }, () => {
  throw new Error('real after error');
});

AfterStep({ tags: '@skip-in-after-step-hook' }, ({ $step }) => {
  $step.skip();
});

AfterStep({ name: 'named skip', tags: '@skip-in-named-after-step-hook' }, ({ $step }) => {
  $step.skip();
});

AfterStep(({ $step, log }) => {
  expect($step.title).not.toBe('the body must not run');
  expect($step.error).toBeUndefined();
  log('unnamed after');
});

AfterStep({ name: 'named after' }, ({ $step, log }) => {
  expect($step.title).not.toBe('the body must not run');
  expect($step.error).toBeUndefined();
  log('named after');
});

After(({ $step }) => {
  expect(() => $step.info).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.attach('outside')).toThrow('available only in BDD steps and step hooks');
  expect(() => $step.skip()).toThrow('available only in BDD steps and step hooks');
});
