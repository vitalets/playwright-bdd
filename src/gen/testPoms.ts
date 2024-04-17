/**
 * Tracks PomNodes used in the particular scenario.
 * To select correct fixture for decorator steps.
 *
 * Idea: try to use the deepest child fixture for parent steps.
 *
 * Example of POM inheritance tree:
 *      A
 *     / \
 *    B   C
 *
 * Cases:
 * If test uses steps from classes A and B:
 * -> resolved fixture will be B, even for steps from A.
 *
 * If test uses steps from classes B and C:
 * -> resolved fixtures will be B and C
 *
 * If test uses steps from classes A, B and C:
 * NEW (statelessPoms = true): -> resolved fixtures will be A, B and C, each used for own steps (see #102)
 * OLD (statelessPoms = false): -> error, b/c A has 2 possible fixtures.
 *
 * @fixture:xxx tag can provide a hint, which fixture to use in ambiguous situations
 * (especially for Background steps).
 *
 * If test uses steps from classes A, B and C; and has tag @fixture:C
 * NEW (statelessPoms = true): -> resolved fixtures will be B and C (C used for steps from A)
 * OLD (statelessPoms = false): -> error, b/c A has 2 possible fixtures.
 *
 * If test uses steps from classes A and B, and has @fixture:C
 * -> actually @fixture tag has no effect, resolved fixture will be A and B (warning?)
 */
import { PomNode, getPomNodeByFixtureName } from '../steps/decorators/class';
import { exit } from '../utils/exit';

const FIXTURE_TAG_PREFIX = '@fixture:';

type UsedFixture = {
  name: string;
  byTag: boolean;
};

type UsedPom = {
  byTag: boolean;
  fixtures?: UsedFixture[];
};

export class TestPoms {
  // map of poms used in test
  private usedPoms = new Map<PomNode, UsedPom>();

  constructor(private testTitle: string) {}

  addPom(pomNode: PomNode | undefined, { byTag = false } = {}) {
    if (!pomNode) return;
    const usedPom = this.usedPoms.get(pomNode);
    if (usedPom) {
      if (byTag && !usedPom.byTag) usedPom.byTag = true;
    } else {
      this.usedPoms.set(pomNode, { byTag });
    }
  }

  addPomByFixtureName(fixtureName: string) {
    const pomNode = getPomNodeByFixtureName(fixtureName);
    this.addPom(pomNode, { byTag: false });
  }

  addPomByTag(tag: string) {
    const fixtureName = extractFixtureName(tag);
    if (fixtureName) {
      const pomNode = getPomNodeByFixtureName(fixtureName);
      this.addPom(pomNode, { byTag: true });
    }
  }

  /**
   * Resolve all used pomNodes to fixtures.
   * This is needed to handle @fixture: tagged pomNodes
   * that does not have steps in the test, but should be considered.
   */
  resolveFixtures() {
    this.usedPoms.forEach((_, pomNode) => {
      this.getResolvedFixtures(pomNode);
    });
  }

  /**
   * Returns fixtures suitable for particular pomNode (actually for step)
   */
  getResolvedFixtures(pomNode: PomNode) {
    const usedPom = this.usedPoms.get(pomNode);
    // already resolved
    if (usedPom?.fixtures) return usedPom.fixtures;

    // Recursively resolve children fixtures, used in test.
    let childFixtures: UsedFixture[] = [...pomNode.children]
      .map((child) => this.getResolvedFixtures(child))
      .flat();

    if (!usedPom) return childFixtures;

    // if there are deeper poms (child fixtures), use them as fixtures for current pom
    // else set fixtures to self
    if (childFixtures.length) {
      this.verifyChildFixtures(pomNode, usedPom, childFixtures);
      usedPom.fixtures = childFixtures;
    } else {
      usedPom.fixtures = [{ name: pomNode.fixtureName, byTag: usedPom.byTag }];
    }

    return usedPom.fixtures;
  }

  /**
   * For scenarios with @fixture:xxx tags verify that there are no steps from fixtures,
   * deeper than xxx.
   * @fixture:xxx tag provides maximum fixture that can be used in the scenario.
   */
  private verifyChildFixtures(pomNode: PomNode, usedPom: UsedPom, childFixtures: UsedFixture[]) {
    if (!usedPom.byTag) return;
    const childFixturesBySteps = childFixtures.filter((f) => !f.byTag);
    if (childFixturesBySteps.length) {
      exit(
        `Scenario "${this.testTitle}" contains ${childFixturesBySteps.length} step(s)`,
        `not compatible with required fixture "${pomNode.fixtureName}"`,
      );
    }
  }
}

function extractFixtureName(tag: string) {
  return tag.startsWith(FIXTURE_TAG_PREFIX) ? tag.replace(FIXTURE_TAG_PREFIX, '') : '';
}

export function buildFixtureTag(fixtureName: string) {
  return `${FIXTURE_TAG_PREFIX}${fixtureName}`;
}
