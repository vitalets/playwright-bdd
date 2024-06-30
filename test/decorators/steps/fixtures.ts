import { test as base } from 'playwright-bdd';
import { AdminPage, AdminPage2, AdminPage3, IntermediatePage, TodoPage, TodoPage2 } from './poms';
import { PomWithCustomParam } from './pomWithCustomParam';

type Fixtures = {
  usedFixtures: string[];
  todoPage: TodoPage;
  todoPage2: TodoPage2;
  adminPage: AdminPage;
  adminPage2: AdminPage2;
  adminPage3: AdminPage3;
  intermediatePage: IntermediatePage;
  pomWithCustomParam: PomWithCustomParam;
};

export const test = base.extend<Fixtures>({
  usedFixtures: ({}, use) => use([]),
  todoPage: ({ usedFixtures }, use) => use(new TodoPage(usedFixtures)),
  todoPage2: ({ usedFixtures }, use) => use(new TodoPage2(usedFixtures)),
  adminPage: ({ usedFixtures }, use) => use(new AdminPage(usedFixtures)),
  adminPage2: ({ usedFixtures }, use) => use(new AdminPage2(usedFixtures)),
  adminPage3: ({ usedFixtures }, use) => use(new AdminPage3(usedFixtures)),
  intermediatePage: ({ usedFixtures }, use) => use(new IntermediatePage(usedFixtures)),
  pomWithCustomParam: ({}, use) => use(new PomWithCustomParam()),
});
