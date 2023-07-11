const { test: base } = require('playwright-bdd');

exports.test = base.extend({
  foo: ['bar', { option: true }],
});
