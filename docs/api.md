# API

### `defineBddConfig(config)`
Defines BDD config inside Playwright config file.

**Params**
  * `config` *object* - BDD [configuration](configuration.md)

**Returns**: *string* - directory where test files will be generated

### `createBdd(test?)`
Creates `Given`, `When`, `Then`, `Step` functions for defining steps.

**Params**
  * `test` *object* - custom test instance

**Returns**: *object* - `{ Given, When, Then, Step }`

### `Given(pattern, (fixtures, ...args) => void)`
Defines `Given` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fixtures` *object* - Playwright fixtures
  * `...args` *array* - arguments captured from step pattern

### `When(pattern, (fixtures, ...args) => void)`
Defines `When` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fixtures` *object* - Playwright fixtures
  * `...args` *array* - arguments captured from step pattern

### `Then(pattern, (fixtures, ...args) => void)`
Defines `Then` step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fixtures` *object* - Playwright fixtures
  * `...args` *array* - arguments captured from step pattern

### `Step(pattern, (fixtures, ...args) => void)`
Defines universal step implementation.

**Params**
  * `pattern` *string | regexp* - step pattern
  * `fixtures` *object* - Playwright fixtures
  * `...args` *array* - arguments captured from step pattern  

### `@Fixture(fixtureName)`
Class decorator to bind POM with fixture name.

**Params**
  * `fixtureName` *string* - fixture name for the given class.

It is also possible to provide `test` type as a generic parameter to restrict `fixtureName` to available fixture names:
```ts
import { Fixture } from 'playwright-bdd/decorators';
import type { test } from './fixtures';

export
@Fixture<typeof test>('todoPage')
class TodoPage { ... };
```

### `@Given(pattern)`
Method decorator to define `Given` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@When(pattern)`
Method decorator to define `When` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@Then(pattern)`
Method decorator to define `Then` step.

**Params**
  * `pattern` *string | regexp* - step pattern

### `@Step(pattern)`
Method decorator to define universal step.

**Params**
  * `pattern` *string | regexp* - step pattern
