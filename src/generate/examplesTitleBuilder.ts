/**
 * Class to build examples title.
 */
import { Examples, Scenario, TableRow } from '@cucumber/messages';
import { GherkinDocumentWithPickles } from '../gherkin/types';
import { BDDConfig } from '../config/types';
import { GherkinTemplate } from '../utils/GherkinTemplate';

type ExamplesTitleBuilderOptions = {
  config: BDDConfig;
  gherkinDocument: GherkinDocumentWithPickles;
  isEnglish: boolean;
  scenario: Scenario;
};

export class ExamplesTitleBuilder {
  private exampleIndex = 0;

  constructor(private options: ExamplesTitleBuilderOptions) {}

  buildTitle(examples: Examples, exampleRow: TableRow) {
    this.exampleIndex++;
    const titleTemplate = this.getTitleTemplate(examples);
    return this.fillTemplate(titleTemplate, examples, exampleRow);
  }

  private getTitleTemplate(examples: Examples) {
    return (
      this.getTitleFromComment(examples) ||
      this.getTitleFromExamplesName(examples) ||
      this.getTitleFromScenarioName(examples) ||
      this.getTitleFromConfig() ||
      this.getDefaultTitle(examples)
    );
  }

  private fillTemplate(titleTemplate: string, examples: Examples, exampleRow: TableRow) {
    const params: Record<string, unknown> = {
      _index_: this.exampleIndex,
    };

    exampleRow.cells.forEach((cell, index) => {
      const colName = examples.tableHeader?.cells[index]?.value;
      if (colName) params[colName] = cell.value;
    });

    return new GherkinTemplate(titleTemplate).fill(params);
  }

  private getTitleFromComment(examples: Examples) {
    const { gherkinDocument } = this.options;
    const { line } = examples.location;
    const titleFormatCommentLine = line - 1;
    const comment = gherkinDocument.comments.find((c) => {
      return c.location.line === titleFormatCommentLine;
    });
    const commentText = comment?.text?.trim();
    const prefix = '# title-format:';
    return commentText?.startsWith(prefix) ? commentText.replace(prefix, '').trim() : '';
  }

  /**
   * If Examples block is named with columns from Examples, use it as title format:
   * Examples: test user with <name> and <age>
   */
  private getTitleFromExamplesName(examples: Examples) {
    return this.getTitleFromString(examples, examples.name);
  }

  /**
   * If scenario is named with columns from Examples, use it as title format:
   * Scenario: test user with <name> and <age>
   */
  private getTitleFromScenarioName(examples: Examples) {
    return this.getTitleFromString(examples, this.options.scenario.name);
  }

  /**
   * Check if string can be an examples title template:
   * Contains at least one column name in <>.
   * E.g.: test user with <name> and <age>
   */
  private getTitleFromString(examples: Examples, str = '') {
    const columns = new GherkinTemplate(str).extractParams();
    const hasColumnsInStr =
      columns.length &&
      examples.tableHeader?.cells?.some((cell) => {
        return cell.value && columns.includes(cell.value);
      });
    return hasColumnsInStr ? str : '';
  }

  private getTitleFromConfig() {
    return this.options.config.examplesTitleFormat;
  }

  private getDefaultTitle(examples: Examples) {
    return this.options.isEnglish
      ? `Example #<_index_>` // for english use 'Example' not 'Examples', and without ':'
      : `${examples.keyword}: #<_index_>`;
  }
}
