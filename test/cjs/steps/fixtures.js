const { test: base } = require('playwright-bdd');
const { TodoPage } = require('./TodoPage');

exports.test = base.extend({
  foo: ['bar', { option: true }],
  todoPage: ({}, use) => use(new TodoPage()),
});
