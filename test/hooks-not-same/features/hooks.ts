import { createBdd } from 'playwright-bdd';

const { BeforeAll } = createBdd();

// this hook throw error
BeforeAll({ tags: '@scenario1' }, () => {});
