const { setWorldConstructor } = require('@cucumber/cucumber');
const { World } = require('playwright-bdd');

class CustomWorld extends World {
  foo = 'bar';
}

setWorldConstructor(CustomWorld);

module.exports = { CustomWorld };
