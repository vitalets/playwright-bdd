/** Extract literal words that must appear in a matching step. */
import { CucumberExpression, Node, NodeType } from '@cucumber/cucumber-expressions';
import type { Node as BddNode } from 'bdd-expressions' with { 'resolution-mode': 'import' };
import type { StepDefinition } from '../stepDefinition';

export function getRequiredLiterals(definition: StepDefinition): string[] {
  // RegExp stays on the scan list: source parsing has edge cases (e.g. /abcdefghij{foo|bar}/ matches "bar}").
  if (typeof definition.pattern !== 'string') return [];
  return definition.usesBddExpression()
    ? getBddExprRequiredLiterals(definition.expression.ast)
    : getCucumberExprRequiredLiterals((definition.expression as CucumberExpression).ast);
}

function getBddExprRequiredLiterals(node: BddNode): string[] {
  // Block arguments can restrict which branches match, so only use literals shared across all branches.
  switch (node.kind) {
    case 'literal':
      return textLiterals(node.value);
    case 'sequence':
      return node.children.flatMap(getBddExprRequiredLiterals);
    case 'choice':
      return intersectionOfBranches(node.branches, getBddExprRequiredLiterals);
    case 'parameter':
      return intersectionOfBranches(node.alternatives, textLiterals);
    default:
      return [];
  }
}

function getCucumberExprRequiredLiterals(node: Node): string[] {
  switch (node.type) {
    case NodeType.text:
      return textLiterals(node.text());
    case NodeType.expression:
    case NodeType.alternative:
      return unionOfChildren(node);
    case NodeType.alternation:
      return intersectionOfBranches(node.nodes, getCucumberExprRequiredLiterals);
    default:
      return [];
  }
}

function textLiterals(text: string): string[] {
  return text.match(/\S+/g) ?? [];
}

function unionOfChildren(node: Node): string[] {
  return [...new Set((node.nodes ?? []).flatMap(getCucumberExprRequiredLiterals))];
}

function intersectionOfBranches<T>(
  branches: readonly T[] = [],
  getLiterals: (branch: T) => string[],
): string[] {
  const [firstBranch = [], ...otherBranches] = branches.map(getLiterals);
  return firstBranch.filter((literal) => otherBranches.every((branch) => branch.includes(literal)));
}
