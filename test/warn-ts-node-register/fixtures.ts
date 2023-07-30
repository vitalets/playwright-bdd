import { test as base } from '../../dist';

class MyPage {
  constructor() {}
}

export const test = base.extend<{ myPage: MyPage }>({
  myPage: ({}, use) => use(new MyPage()),
});
