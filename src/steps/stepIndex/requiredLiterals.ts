/** Extract required literal words from a CucumberExpression AST. */
import { CucumberExpression, Node, NodeType } from '@cucumber/cucumber-expressions';

export function requiredLiterals(expression: CucumberExpression): string[] {
  return getRequiredLiterals(expression.ast);
}

function getRequiredLiterals(node: Node): string[] {
  switch (node.type) {
    case NodeType.text:
      return textLiterals(node);
    case NodeType.expression:
    case NodeType.alternative:
      return unionOfChildren(node);
    case NodeType.alternation:
      return intersectionOfBranches(node);
    default:
      return [];
  }
}

function textLiterals(node: Node): string[] {
  return node.text().match(/\S+/g) ?? [];
}

function unionOfChildren(node: Node): string[] {
  return [...new Set((node.nodes ?? []).flatMap(getRequiredLiterals))];
}

function intersectionOfBranches(node: Node): string[] {
  const branches = (node.nodes ?? []).map(getRequiredLiterals);
  const [firstBranch = []] = branches;
  return firstBranch.filter((literal) => branches.every((branch) => branch.includes(literal)));
}
