import { Given } from './fixtures';

Given('cucumber step with missing args {int}', function () {});
Given('cucumber doc step with missing args', function () {});
Given('cucumber step with too many args {int}', function (_value: number, _extra: string) {});
Given('cucumber doc step with too many args', function (_docString: string, _extra: string) {});
