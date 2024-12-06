import { expect } from '@playwright/test';
import { When, Then } from './fixtures';

When('GET {string}', async ({ request, ctx }, url: string) => {
  ctx.response = await request.get(url);
});

When('POST {string}', async ({ request, ctx }, url: string, data: string) => {
  ctx.response = await request.post(url, { data });
});

Then('status is {int}', async ({ ctx }, status: number) => {
  expect(ctx.response.status()).toEqual(status);
});

Then('response has prop {string}', async ({ ctx }, keyPath: string) => {
  expect(await ctx.response.json()).toHaveProperty(keyPath);
});

Then('response has prop {string} = {int}', async ({ ctx }, keyPath: string, value: number) => {
  expect(await ctx.response.json()).toHaveProperty(keyPath, value);
});

Then('response has prop {string} = {string}', async ({ ctx }, keyPath: string, value: string) => {
  expect(await ctx.response.json()).toHaveProperty(keyPath, value);
});

Then('response object matches:', async ({ ctx }, data: string) => {
  expect(await ctx.response.json()).toMatchObject(JSON.parse(data));
});

Then('response array contains:', async ({ ctx }, data: string) => {
  expect(await ctx.response.json()).toContainEqual(expect.objectContaining(JSON.parse(data)));
});
