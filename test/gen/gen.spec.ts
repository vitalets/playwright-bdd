import { test } from '@playwright/test';
import { createTest } from './helpers';

test('scenario', createTest());
test('scenario-outline', createTest());
test('background', createTest());
test('doc-string', createTest());
test('data-table', createTest());
