import { test, normalize, TestDir, execPlaywrightTestWithError } from '../_helpers/index.mjs';

const testDir = new TestDir(import.meta);

test(testDir.name, () =>
  execPlaywrightTestWithError(testDir.name, [
    `// 1. Missing step definition for "${normalize('features/one.feature:4:5')}"`,
    `// 10. Missing step definition for "${normalize('features/one.feature:23:5')}"`,
    `Given('Step without parameters', async ({}) => {`,
    `Given('Step with one string parameter {string}', async ({}, arg: string) => {`,
    `Given('Step with two string parameters {string} and {string}', async ({}, arg: string, arg1: string) => {`,
    `Given('Step with one float parameter {float}', async ({}, arg: number) => {`,
    `Given('Step with one int parameter {int}', async ({}, arg: number) => {`,
    `Given('Step with two int parameters {int} and {int}', async ({}, arg: number, arg1: number) => {`,
    `Given('Step with docString', async ({}, docString: string) => {`,
    `Given('Step with dataTable', async ({}, dataTable: DataTable) => {`,
    `When('I click link {string}', async ({}, arg: string) => {`,
    `Then('I see in title {string}', async ({}, arg: string) => {`,
    `Missing step definitions: 10`,
  ]),
);
