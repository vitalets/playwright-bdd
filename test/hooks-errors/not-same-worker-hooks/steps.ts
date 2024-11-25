import { createBdd } from 'playwright-bdd';

const { BeforeAll, Given } = createBdd();

BeforeAll({ tags: '@scenario1' }, () => {});

Given('a step', () => {});
