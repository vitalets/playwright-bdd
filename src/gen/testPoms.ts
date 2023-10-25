/**
 * Track PomNodes used in the particular test.
 * To select correct fixture for decorator steps.
 *
 * Idea: try to use the deepest child fixture for parent steps.
 *
 * Example inheritance tree:
 *      A
 *     / \
 *    B   C
 *   / \   \
 *  D   E   F
 *
 * If test uses steps from classes A and D:
 * -> resolved fixture will be D, even for steps from A.
 *
 * If test uses steps from classes A, D and C:
 * -> error, b/c A has 2 possible fixtures.
 *
 * If test uses steps from classes A and C, but @fixture tag is D:
 * -> error, b/c A has 2 possible fixtures.
 */
import { PomNode, getPomNodeByFixtureName } from '../stepDefinitions/decorators/class';
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

  constructor(private title: string) {}

  addByStep(pomNode?: PomNode) {
    this.addUsedPom(pomNode, { byTag: false });
  }

  addByFixtureName(fixtureName: string) {
    const pomNode = getPomNodeByFixtureName(fixtureName);
    this.addUsedPom(pomNode, { byTag: false });
  }

  addByTag(tag: string) {
    const fixtureName = extractFixtureName(tag);
    if (fixtureName) {
      const pomNode = getPomNodeByFixtureName(fixtureName);
      this.addUsedPom(pomNode, { byTag: true });
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
    if (usedPom?.fixtures) return usedPom.fixtures;

    // Recursively resolve children fixtures, used in test.
    let childFixtures: UsedFixture[] = [...pomNode.children]
      .map((child) => this.getResolvedFixtures(child))
      .flat();

    if (!usedPom) return childFixtures;

    if (childFixtures.length) {
      this.verifyChildFixtures(pomNode, usedPom, childFixtures);
      usedPom.fixtures = childFixtures;
    } else {
      usedPom.fixtures = [{ name: pomNode.fixtureName, byTag: usedPom.byTag }];
    }

    return usedPom.fixtures;
  }

  private addUsedPom(pomNode: PomNode | undefined, { byTag }: { byTag: boolean }) {
    if (!pomNode) return;
    const usedPom = this.usedPoms.get(pomNode);
    if (usedPom) {
      if (byTag && !usedPom.byTag) usedPom.byTag = true;
    } else {
      this.usedPoms.set(pomNode, { byTag });
    }
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
        `Scenario "${this.title}" contains ${childFixturesBySteps.length} step(s)`,
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
