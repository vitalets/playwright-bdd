/**
 * Playwright-style snippet syntax for typescript.
 * Important to use separate file as it's simplest way to distinguish between js/ts
 * without hooking into cucumber machinery.
 */
import SnippetSyntax from './snippetSyntax';

export default class extends SnippetSyntax {
  isTypescript = true;
}
