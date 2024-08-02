import { Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';
import { expectTypeOf } from 'expect-type';

const { Given } = createBdd();

Given('some step', async ({ page, $tags }) => {
  expectTypeOf($tags).toEqualTypeOf<string[]>();
  expectTypeOf(page).toEqualTypeOf<Page>();
});
