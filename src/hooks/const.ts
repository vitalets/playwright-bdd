/**
 * Some constants used in hooks.
 * Keep this file separate as it is used in the reporter.
 */

/**
 * The title used in test.beforeAll() call,
 * shown in the reporter as a parent for all BeforeWorker hooks.
 */
export const BEFORE_ALL_HOOKS_GROUP_NAME = 'BeforeAll Hooks';

/**
 * The title used in test.afterAll() call,
 * shown in the reporter as a parent for all AfterWorker hooks.
 */
export const AFTER_ALL_HOOKS_GROUP_NAME = 'AfterAll Hooks';

/**
 * The title used in test.beforeEach() call,
 * shown in the reporter as a parent for all BeforeScenario hooks.
 */
export const BEFORE_EACH_HOOKS_GROUP_NAME = 'BeforeEach Hooks';

/**
 * The title used in test.afterEach() call,
 * shown in the reporter as a parent for all AFterScenario hooks.
 */
export const AFTER_EACH_HOOKS_GROUP_NAME = 'AfterEach Hooks';
