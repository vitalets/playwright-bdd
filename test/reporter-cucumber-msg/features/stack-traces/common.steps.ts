import { When } from '../fixtures';

When('a step throws an exception', function () {
  throw new Error('BOOM');
});
