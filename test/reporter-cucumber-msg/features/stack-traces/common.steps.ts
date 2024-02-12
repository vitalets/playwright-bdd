import { When } from '@cucumber/cucumber';

When('a step throws an exception', function () {
  throw new Error('BOOM');
});
