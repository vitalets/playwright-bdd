/**
 * Tree-structure of all POM classes.
 * Allows to guess correct fixture for decorator steps.
 */

/* eslint-disable @typescript-eslint/no-unsafe-function-type */

import { linkStepsWithPomNode } from './steps';
import { exit } from '../../utils/exit';

type PomClass = Function;

// POM class with inherited children POMs: representation of classes inheritance.
export type PomNode = {
  fixtureName: string;
  className: string;
  children: Set<PomNode>;
};

const pomGraph = new Map<PomClass, PomNode>();

export function createPomNode(Ctor: PomClass, fixtureName: string) {
  const pomNode: PomNode = {
    fixtureName,
    className: Ctor.name,
    children: new Set(),
  };
  ensureUniqueFixtureName(pomNode);
  pomGraph.set(Ctor, pomNode);
  linkStepsWithPomNode(Ctor, pomNode);
  linkParentWithPomNode(Ctor, pomNode);
  return pomNode;
}

function ensureUniqueFixtureName({ fixtureName, className }: PomNode) {
  if (!fixtureName) return;
  const existingPom = getPomNodeByFixtureName(fixtureName);
  if (existingPom)
    exit(
      `Duplicate fixture name "${fixtureName}"`,
      `defined for classes: ${existingPom.className}, ${className}`,
    );
}

function linkParentWithPomNode(Ctor: PomClass, pomNode: PomNode) {
  const parentCtor = Object.getPrototypeOf(Ctor);
  if (!parentCtor) return;
  // if parentCtor is not in pomGraph, add it.
  // Case: parent class is not marked with @Fixture, but has decorator steps (base class)
  const parentPomNode = pomGraph.get(parentCtor) || createPomNode(parentCtor, '');
  parentPomNode.children.add(pomNode);
}

export function getPomNodeByFixtureName(fixtureName: string) {
  for (const pomNode of pomGraph.values()) {
    if (pomNode.fixtureName === fixtureName) return pomNode;
  }
}
