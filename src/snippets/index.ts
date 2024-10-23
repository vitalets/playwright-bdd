/**
 * Generate and show snippets for missing steps.
 */

import { logger } from '../utils/logger';
import { stepDefinitions } from '../steps/stepRegistry';
import { Snippet, SnippetOptions } from './snippet';
import { MissingStep } from './types';

// if there are too many snippets, it's more like invalid configuration
const MAX_SNIPPETS_TO_SHOW = 10;

export class Snippets {
  private snippets = new Map</* stepText */ string, /* code */ string>();
  private snippetOptions: SnippetOptions;

  constructor(private missingSteps: MissingStep[]) {
    this.snippetOptions = this.buildSnippetOptions();
    this.buildSnippets();
  }

  print() {
    const snippetsToShow = [...this.snippets.values()].slice(0, MAX_SNIPPETS_TO_SHOW);
    const moreSnippetsCount = this.snippets.size - snippetsToShow.length;
    logger.error(
      [
        `Missing step definitions: ${this.snippets.size}`,
        ...snippetsToShow,
        moreSnippetsCount > 0 ? `...and ${moreSnippetsCount} more.` : '',
        `Use snippets above to create missing steps.`,
      ]
        .filter(Boolean)
        .join('\n\n'),
    );
  }

  private buildSnippetOptions(): SnippetOptions {
    return {
      isPlaywrightStyle: !this.hasCucumberStyleSteps(),
      isTypeScript: this.hasTypeScriptSteps(),
      isDecorator: this.hasDecoratorSteps(),
    };
  }

  private buildSnippets() {
    this.missingSteps.forEach((missingStep) => {
      this.buildSnippet(missingStep);
    });
  }

  private buildSnippet(missingStep: MissingStep) {
    const snippet = new Snippet(missingStep, this.snippetOptions);
    // use snippet code as unique key
    if (this.snippets.has(snippet.code)) return;
    const { uri, line, column } = missingStep.location;
    const snippetWithLocation = snippet.code
      .replace('{step}', `Step: ${missingStep.textWithKeyword}`)
      .replace('{location}', `From: ${uri}:${line}:${column}`);
    this.snippets.set(snippet.code, snippetWithLocation);
  }

  private hasTypeScriptSteps() {
    return stepDefinitions.some((s) => s.uri.endsWith('.ts'));
  }

  private hasDecoratorSteps() {
    const decoratorSteps = stepDefinitions.filter((step) => step.isDecorator());
    return decoratorSteps.length > stepDefinitions.length / 2;
  }

  private hasCucumberStyleSteps() {
    const cucumberStyleSteps = stepDefinitions.filter((step) => step.isCucumberStyle());
    return cucumberStyleSteps.length > stepDefinitions.length / 2;
  }
}
