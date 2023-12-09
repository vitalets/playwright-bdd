import { test as base } from 'playwright-bdd';

class MyPage {
  constructor() {}
}

export const test = base.extend<{ myPage: MyPage }>({
  myPage: ({}, use) => use(new MyPage()),
});
