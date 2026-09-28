import { Given, When, Then, Before, BeforeStep, AfterStep } from './fixtures';

Given('a passing step', ({ log }) => {
  log('a passing step');
});

When('a step that skips itself', ({ log, $step }) => {
  log('before skip');
  $step.skip(true, 'Skipped on purpose');
  log('after skip');
});

Given('a step with a false skip condition', ({ log, $step }) => {
  $step.skip(false, 'Not skipped');
  log('a step with a false skip condition');
});

When('a step skipped in BeforeStep', ({ log }) => {
  log('a step skipped in BeforeStep');
});

Then('the next step runs', ({ log }) => {
  log('the next step runs');
});

BeforeStep({ tags: '@skip-in-before-step' }, ({ $step }) => {
  $step.skip($step.title === 'a step skipped in BeforeStep', 'Skipped in BeforeStep');
});

AfterStep({ tags: '@log-after-step' }, ({ log, $step }) => {
  log(`AfterStep: ${$step.title}, error: ${$step.error ? 'set' : 'unset'}`);
});

Before({ tags: '@skip-in-before-hook' }, ({ $step }) => {
  $step.skip();
});
