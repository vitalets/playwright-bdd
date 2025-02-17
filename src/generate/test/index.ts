/**
 * Class to generate single test from pickle.
 */
import { PickleStep, Step } from '@cucumber/messages';
import { formatDuplicateStepsMessage, StepFinder } from '../../steps/finder';
import { Formatter } from '../formatter';
import { getKeywordEng, KeywordsMap } from '../i18n';
import { getStepTextWithKeyword } from '../../gherkin/helpers';
import { stringifyLocation } from '../../utils';
import { exit } from '../../utils/exit';
import { MatchedStepDefinition } from '../../steps/matchedStepDefinition';
import { PomNode } from '../../steps/decorators/pomGraph';
import { fixtureParameterNames } from '../../playwright/fixtureParameterNames';
import { isBddAutoInjectFixture } from '../../runtime/bddTestFixturesAuto';
import { PickleWithLocation } from '../../gherkin/types';
import { BackgroundGen } from '../background';
import { BDDConfig } from '../../config/types';
import {
  isTestSkippedByCollectedTags,
  isTestSlowByCollectedTags,
  SpecialTags,
} from '../specialTags';
import { DecoratorFixtureResolver } from './decoratorFixtureResolver';
import { getStepHooksFixtureNames, getStepHooksToRun } from '../../hooks/step';

export type StepData = {
  pickleStep: PickleStep;
  gherkinStep: Step;
  location: string; // full location with feature file path
  fixtureNames: string[];
  matchedDefinition?: MatchedStepDefinition; // empty for missing steps
  pomNode?: PomNode; // for decorator steps
  pomFixtureName?: string; // for decorator steps
  isBg?: boolean;
};

// todo: class StepGen ?

/**
 * Generates steps for a single scenario (test) and updates background steps.
 */
export class TestGen {
  public stepsData = new Map<string /* pickle step id */, StepData>();
  private specialTags: SpecialTags;
  public skippedByTag: boolean;
  private skippedByMissingSteps = false;
  public slow: boolean;
  private stepHooksFixtureNames: string[] = [];

  // eslint-disable-next-line max-params
  constructor(
    private config: BDDConfig,
    public featureUri: string,
    private i18nKeywordsMap: KeywordsMap | undefined,
    private stepFinder: StepFinder,
    private formatter: Formatter,
    private backgrounds: BackgroundGen[],
    public pickle: PickleWithLocation,
    public testTitle: string,
    private scenarioSteps: readonly Step[],
    public tags: string[], // all tags of test (including tags from path)
    ownTestTags: string[], // tags from scenario (without inherited)
  ) {
    this.specialTags = new SpecialTags(ownTestTags);
    this.skippedByTag = isTestSkippedByCollectedTags(this.tags);
    this.slow = isTestSlowByCollectedTags(this.tags);
    this.fillStepHooksFixtureNames();
    this.fillStepsData();
    this.resolveFixtureNamesForDecoratorSteps();
  }

  get ownTimeout() {
    return this.specialTags.timeout;
  }

  get skipped() {
    return this.skippedByTag || this.skippedByMissingSteps;
  }

  render() {
    const testFixtureNames: string[] = [];
    const stepLines = [...this.stepsData.values()]
      .filter((stepData) => this.scenarioSteps.includes(stepData.gherkinStep))
      .map((stepData) => {
        const { pickleStep, gherkinStep, fixtureNames } = stepData;
        const keywordEng = getKeywordEng(this.i18nKeywordsMap, gherkinStep.keyword);
        const pickleStepIds = [pickleStep.id];
        testFixtureNames.push(keywordEng, ...fixtureNames);
        return this.formatter.step(
          keywordEng,
          pickleStep.text,
          pickleStep.argument,
          new Set(fixtureNames),
          pickleStepIds,
        );
      });

    this.handleMissingDefinitions();

    return this.formatter.test(
      this.testTitle,
      this.tags,
      this.specialTags,
      new Set(testFixtureNames),
      this.pickle.id,
      stepLines,
    );
  }

  private fillStepsData() {
    this.pickle.steps.forEach((pickleStep) => {
      const { gherkinStep, bg } = this.findGherkinStep(pickleStep);
      const location = `${this.featureUri}:${stringifyLocation(gherkinStep.location)}`;
      const matchedDefinition = this.findMatchedDefinition(pickleStep, gherkinStep);
      const fixtureNames = this.getStepFixtureNames(matchedDefinition);
      fixtureNames.push(...this.stepHooksFixtureNames);
      const pomNode = matchedDefinition?.definition.pomNode;
      const stepData: StepData = {
        pickleStep,
        gherkinStep,
        location,
        matchedDefinition,
        fixtureNames,
        pomNode,
        isBg: Boolean(bg),
      };

      this.stepsData.set(pickleStep.id, stepData);
      bg?.addStepData(stepData);
    });
  }

  private fillStepHooksFixtureNames() {
    const beforeStepHooksToRun = getStepHooksToRun('beforeStep', this.tags);
    const afterStepHooksToRun = getStepHooksToRun('afterStep', this.tags);
    this.stepHooksFixtureNames = getStepHooksFixtureNames([
      ...beforeStepHooksToRun,
      ...afterStepHooksToRun,
    ]);
  }

  private handleMissingDefinitions() {
    if (
      !this.skippedByTag &&
      this.hasMissingDefinitions() &&
      this.config.missingSteps === 'skip-scenario'
    ) {
      this.skippedByMissingSteps = true;
      this.specialTags.forceFixme();
    }
  }

  private findGherkinStep(pickleStep: PickleStep) {
    const { bg, bgGherkinStep } = this.findBackgroundStep(pickleStep) || {};
    const gherkinStep = bgGherkinStep || this.findScenarioStep(pickleStep);
    if (!gherkinStep) exit(`Gherkin step not found for pickle step: ${pickleStep.text}`);
    return { gherkinStep, bg };
  }

  private findBackgroundStep(pickleStep: PickleStep) {
    for (const bg of this.backgrounds) {
      const bgGherkinStep = bg.findGherkinStep(pickleStep);
      if (bgGherkinStep) return { bg, bgGherkinStep };
    }
  }

  private findScenarioStep(pickleStep: PickleStep) {
    return this.scenarioSteps.find(({ id }) => pickleStep.astNodeIds.includes(id));
  }

  private hasMissingDefinitions() {
    return [...this.stepsData.values()].some((stepData) => !stepData.matchedDefinition);
  }

  private findMatchedDefinition(pickleStep: PickleStep, gherkinStep: Step) {
    // for skipped tests don't search for definition
    if (this.skipped) return;

    const matchedDefinitions = this.stepFinder.findDefinitions(
      pickleStep.type,
      pickleStep.text,
      this.tags,
    );

    if (matchedDefinitions.length === 0) return;

    if (matchedDefinitions.length > 1) {
      const stepTextWithKeyword = getStepTextWithKeyword(gherkinStep.keyword, pickleStep.text);
      const stepLocation = `${this.featureUri}:${stringifyLocation(gherkinStep.location)}`;
      // exit immediately, b/c with multiple step definitions we can't proceed
      exit(formatDuplicateStepsMessage(matchedDefinitions, stepTextWithKeyword, stepLocation));
    }

    return matchedDefinitions[0];
  }

  private resolveFixtureNamesForDecoratorSteps() {
    new DecoratorFixtureResolver(this.config, this.tags).resolveFixtureNames(this.stepsData);
  }

  private getStepFixtureNames(matchedDefinition?: MatchedStepDefinition) {
    if (!matchedDefinition) return [];

    const { definition } = matchedDefinition;

    // for decorator steps fixture names are resolved later,
    // when all steps are collected
    if (definition.isDecorator()) return [];

    // for cucumber-style there is no fixtures arg,
    // fixtures are accessible via this.world
    if (definition.isCucumberStyle()) return [];

    return fixtureParameterNames(definition.fn) // prettier-ignore
      .filter((name) => !isBddAutoInjectFixture(name));
  }
}
