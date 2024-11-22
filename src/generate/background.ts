/**
 * Manages backgrounds: fill info about background steps and fixtures.
 * Note: per gherkin syntax, background section must appear before scenarios.
 */
import { Background, PickleStep, Step } from '@cucumber/messages';
import { StepData } from './test/test';
import { AutofillMap } from '../utils/AutofillMap';
import { Formatter } from './formatter';
import { getKeywordEng, KeywordsMap } from './i18n';

// export type BackgroundData = {
//   bg: Background;
//   steps: Record<string /* gherkin step id */, StepData[]>;
// };

// export class BackgroundsManager {
//   private backgrounds: BackgroundGen[] = [];

// registerBackground(bg: Background) {
//   const bgGen = new BackgroundGen(bg);
//   this.backgrounds.push(bgGen);
//   return bgGen.placeholder;
// }

//   findGherkinStep(pickleStep: PickleStep) {
//     for (const bg of this.backgrounds) {
//       const gherkinStep = bg.findGherkinStep(pickleStep);
//       if (gherkinStep) return { bg, gherkinStep };
//     }
//   }

//   renderBackgrounds(lines: string[]) {
//     this.backgrounds.forEach((bg) => bg.render(lines));
//   }
// }

export class BackgroundGen {
  private steps = new AutofillMap<Step, StepData[]>();

  constructor(
    private formatter: Formatter,
    private i18nKeywordsMap: KeywordsMap | undefined,
    private bg: Background,
  ) {}

  get placeholder() {
    return `// bg: ${this.bg.id}`;
  }

  findGherkinStep(pickleStep: PickleStep) {
    return this.bg.steps.find((step) => pickleStep.astNodeIds.includes(step.id));
  }

  addStepData(stepData: StepData) {
    if (this.bg.steps.includes(stepData.gherkinStep)) {
      this.steps.getOrCreate(stepData.gherkinStep, () => []).push(stepData);
      return true;
    }
  }

  renderInplace(lines: string[]) {
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const pos = line.indexOf(this.placeholder);
      if (pos >= 0) {
        const indent = ' '.repeat(pos);
        const bgLines = this.hasReferencedSteps() ? this.render().map((v) => `${indent}${v}`) : [];
        lines.splice(lineIndex, 1, ...bgLines);
        return;
      }
    }
    // todo: throw
  }

  private render() {
    const bgFixtureNames: string[] = [];
    const stepLines = this.bg.steps.map((gherkinStep) => {
      const keywordEng = getKeywordEng(this.i18nKeywordsMap, gherkinStep.keyword);
      // bg step can have several stepData
      const stepDataArr = this.steps.get(gherkinStep) || [];
      // take first, b/c for bg steps text and argument are the same in all pickle steps
      const firstPickleStep = stepDataArr[0].pickleStep;
      const stepFixtureNames: string[] = [];
      stepDataArr.forEach(({ fixtureNames }) => stepFixtureNames.push(...fixtureNames));
      const pickleStepIds = stepDataArr.map(({ pickleStep }) => pickleStep.id) || [];
      bgFixtureNames.push(keywordEng, ...stepFixtureNames);
      return this.formatter.step(
        keywordEng,
        firstPickleStep.text,
        firstPickleStep.argument,
        new Set(stepFixtureNames),
        pickleStepIds,
      );
    });

    const title = this.getTitle();
    return this.formatter.beforeEach(title, new Set(bgFixtureNames), stepLines);
  }

  private hasReferencedSteps() {
    return this.steps.size > 0;
  }

  private getTitle() {
    return [this.bg.keyword, this.bg.name].filter(Boolean).join(': ');
  }
}
