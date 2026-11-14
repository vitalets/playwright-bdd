import { Given } from './fixtures';

Given('the body skips', ({ $step, log }) => {
  log('body skips');
  $step.skip(true, 'body reason');
  throw new Error('body continued after skip');
});

Given('the body skips unconditionally', ({ $step, log }) => {
  log('body skips unconditionally');
  $step.skip();
  throw new Error('body continued after skip');
});

Given('the body must not run', () => {
  throw new Error('skipped body ran');
});

Given('the next step runs', ({ $step, log }) => {
  $step.skip(false, 'must not skip');
  log('next step');
});
