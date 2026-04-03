import { test, createBdd } from 'playwright-bdd';

export { test };
export const { Given, When, Then } = createBdd(test);
