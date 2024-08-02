/**
 * Generate and show snippets for missing steps.
 */

import { TestFile, UndefinedStep } from '../gen/testFile';
import { logger } from '../utils/logger';
import { isCucumberStyleStep, isDecorator } from '../steps/stepConfig';
import { stepDefinitions } from '../steps/registry';
import { Snippet, SnippetOptions } from './snippet';

// if there are too many snippets, it's more like invalid configuration
const MAX_SNIPPETS_TO_SHOW = 10;

export class Snippets {
  private snippets = new Map</* stepText */ string, /* code */ string>();
  private snippetOptions: SnippetOptions;

  constructor(private files: TestFile[]) {
    this.snippetOptions = this.buildSnippetOptions();
    this.buildSnippets();
  }

  hasUndefinedSteps() {
    return this.snippets.size > 0;
  }

  print() {
    const snippetsToShow = [...this.snippets.values()].slice(0, MAX_SNIPPETS_TO_SHOW);
    const moreSnippetsCount = this.snippets.size - snippetsToShow.length;
    logger.error(
      [
        `Some steps are without definition!`,
        ...snippetsToShow,
        moreSnippetsCount > 0 ? `...and ${moreSnippetsCount} more.` : '',
        `Missing step definitions: ${this.snippets.size}.\nUse snippets above to create them.`,
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
    this.files.forEach((file) => {
      file.undefinedSteps.forEach((undefinedStep) => {
        this.buildSnippet(file, undefinedStep);
      });
    });
  }

  private buildSnippet(file: TestFile, undefinedStep: UndefinedStep) {
    const snippet = new Snippet(undefinedStep, this.snippetOptions);
    // use snippet code as unique key
    if (this.snippets.has(snippet.code)) return;
    const { line, column } = undefinedStep.step.location;
    const snippetWithLocation = [
      `// ${this.snippets.size + 1}. Missing step definition for "${file.featureUri}:${line}:${column}"`,
      snippet.code,
    ].join('\n');
    this.snippets.set(snippet.code, snippetWithLocation);
  }

  private hasTypeScriptSteps() {
    return stepDefinitions.some((s) => s.uri.endsWith('.ts'));
  }

  private hasDecoratorSteps() {
    const decoratorSteps = stepDefinitions.filter((step) => isDecorator(step.stepConfig));
    return decoratorSteps.length > stepDefinitions.length / 2;
  }

  private hasCucumberStyleSteps() {
    const cucumberStyleSteps = stepDefinitions.filter((step) =>
      isCucumberStyleStep(step.stepConfig),
    );
    return cucumberStyleSteps.length > stepDefinitions.length / 2;
  }
}
