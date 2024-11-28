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
 * NEW (statefulPoms = false): -> resolved fixtures will be A, B and C, each used for own steps (see #102)
 * OLD (statefulPoms = true): -> error, b/c A has 2 possible fixtures.
 *
 * @fixture:xxx tag can provide a hint, which fixture to use in ambiguous situations
 * (especially for Background steps).
 *
 * If test uses steps from classes A, B and C; and has tag @fixture:C
 * NEW (statefulPoms = false): -> resolved fixtures will be B and C (C used for steps from A)
 * OLD (statefulPoms = true): -> error, b/c A has 2 possible fixtures.
 *
 * If test uses steps from classes A and B, and has @fixture:C
 * -> actually @fixture tag has no effect, resolved fixture will be A and B (warning?)
 */
import { PomNode, getPomNodeByFixtureName } from '../../steps/decorators/pomGraph';

const FIXTURE_TAG_PREFIX = '@fixture:';

export type UsedFixtureInfo = {
  name: string;
  byTag: boolean;
};

type PomNodeInfo = {
  byTag: boolean;
  resolvedFixtures?: UsedFixtureInfo[];
};

export class TestPoms {
  // pomNodes used in a test + info about resolved fixtures
  private usedPomNodes = new Map<PomNode, PomNodeInfo>();

  registerPomNode(pomNode: PomNode, { byTag = false } = {}) {
    const usedPom = this.usedPomNodes.get(pomNode);
    if (usedPom) {
      // todo: optimize: if (usedPom && byTag) usedPom.byTag = true
      if (byTag && !usedPom.byTag) usedPom.byTag = true;
    } else {
      this.usedPomNodes.set(pomNode, { byTag });
    }
  }

  registerPomNodeByFixtureName(fixtureName: string) {
    const pomNode = getPomNodeByFixtureName(fixtureName);
    if (pomNode) this.registerPomNode(pomNode, { byTag: false });
  }

  registerPomNodeByTag(tag: string) {
    const fixtureName = extractFixtureNameFromTag(tag);
    if (!fixtureName) return;
    const pomNode = getPomNodeByFixtureName(fixtureName);
    if (pomNode) this.registerPomNode(pomNode, { byTag: true });
  }

  /**
   * Resolve all used pomNodes to fixtures.
   * We need to call this method to handle @fixture: tagged pomNodes
   * that does not have steps in the test, but should be considered.
   */
  resolveAllFixtures() {
    this.usedPomNodes.forEach((_, pomNode) => {
      this.getResolvedFixtures(pomNode);
    });
  }

  /**
   * Returns fixtures suitable for particular pomNode (actually for step).
   */
  // eslint-disable-next-line visual/complexity
  getResolvedFixtures(pomNode: PomNode): UsedFixtureInfo[] {
    const usedPomNodeInfo = this.usedPomNodes.get(pomNode);

    // fixtures already resolved
    if (usedPomNodeInfo?.resolvedFixtures) return usedPomNodeInfo.resolvedFixtures;

    // Recursively resolve all child fixtures (as deep as possible)
    let childFixtures: UsedFixtureInfo[] = [...pomNode.children]
      .map((child) => this.getResolvedFixtures(child))
      .flat()
      // filter out pomNodes with empty fixture name as we can't use it.
      // (they are not marked with @Fixture decorator -> e.g. Base class)
      .filter((f) => Boolean(f.name));

    const taggedFixtures = childFixtures.filter((f) => f.byTag);
    // if tagged fixtures found, use only them as they have higher priority
    if (taggedFixtures.length) childFixtures = taggedFixtures;

    // this pomNode is not used in test, we just return child fixtures
    // b/c no place to save child fixtures
    if (!usedPomNodeInfo) return childFixtures;

    // If some child fixtures found, use them as fixtures for the current pom as well.
    // The idea is to use as deep fixture as possible in teh pom classes inheritance chain.
    if (childFixtures.length) {
      // commented for now, simplify
      // this.verifyChildFixtures(pomNode, usedPom, childFixtures);
      usedPomNodeInfo.resolvedFixtures = childFixtures;
    } else {
      // if there is no child fixtures, else use self as fixtures list
      usedPomNodeInfo.resolvedFixtures = pomNode.fixtureName
        ? [{ name: pomNode.fixtureName, byTag: usedPomNodeInfo.byTag }]
        : [];
    }

    return usedPomNodeInfo.resolvedFixtures;
  }

  /**
   * For scenarios with @fixture:xxx tags verify that there are no steps from fixtures,
   * deeper than xxx.
   * @fixture:xxx tag provides maximum fixture that can be used in the scenario.
   */
  // private verifyChildFixtures(pomNode: PomNode, usedPom: UsedPom, childFixtures: UsedFixture[]) {
  //   if (!usedPom.byTag) return;
  //   const childFixturesBySteps = childFixtures.filter((f) => !f.byTag);
  //   if (childFixturesBySteps.length) {
  //     exit(
  //       `Scenario "${this.testTitle}" contains ${childFixturesBySteps.length} step(s)`,
  //       `not compatible with required fixture "${pomNode.fixtureName}"`,
  //     );
  //   }
  // }
}

function extractFixtureNameFromTag(tag: string) {
  return tag.startsWith(FIXTURE_TAG_PREFIX) ? tag.replace(FIXTURE_TAG_PREFIX, '') : '';
}
