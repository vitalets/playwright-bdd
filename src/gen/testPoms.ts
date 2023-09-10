import { PomNode, getPomNodeByFixtureName } from '../stepDefinitions/decorators/poms';

const FIXTURE_TAG_PREFIX = '@fixture:';

/**
 * Track POMs used in the particular test.
 */
export class TestPoms {
  private usedPoms = new Map<PomNode, string[] | null>();

  add(pomNode?: PomNode) {
    if (pomNode) this.usedPoms.set(pomNode, null);
  }

  addByFixtureName(fixtureName: string) {
    const pomNode = getPomNodeByFixtureName(fixtureName);
    if (pomNode) this.add(pomNode);
  }

  addByTag(tag: string) {
    const fixtureName = extractFixtureName(tag);
    if (fixtureName) this.addByFixtureName(fixtureName);
  }

  resolveFixtureNames(pomNode: PomNode) {
    const resolvedFixtureNames = this.usedPoms.get(pomNode);
    if (resolvedFixtureNames) return resolvedFixtureNames;

    const fixtureNames: string[] = [...pomNode.children]
      .map((child) => this.resolveFixtureNames(child))
      .flat();

    if (this.usedPoms.has(pomNode)) {
      // if nothing returned from children, use own fixtureName,
      // otherwise use what returned from child
      if (!fixtureNames.length) fixtureNames.push(pomNode.fixtureName);
      this.usedPoms.set(pomNode, fixtureNames);
    }

    return fixtureNames;
  }
}

function extractFixtureName(tag: string) {
  return tag.startsWith(FIXTURE_TAG_PREFIX) ? tag.replace(FIXTURE_TAG_PREFIX, '') : '';
}

export function buildFixtureTag(fixtureName: string) {
  return `${FIXTURE_TAG_PREFIX}${fixtureName}`;
}
