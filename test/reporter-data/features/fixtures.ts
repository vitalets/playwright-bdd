import { test as base } from 'playwright-bdd';
import { MyPage } from './pom';

export const test = base.extend<{ myPage: MyPage }>({
  myPage: ({ page }, use) => use(new MyPage(page)),
});
