import { Given } from './fixtures';

Given('cucumber step with omitted parameters {int}', function () {});
Given('cucumber doc step with omitted parameters', function () {});
Given(
  'cucumber step with too many args {int}',
  function (_value: number, _docString: string, _extra: string) {},
);
Given('cucumber doc step with too many args', function (_docString: string, _extra: string) {});
