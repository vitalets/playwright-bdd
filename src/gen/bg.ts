// /**
//  * Holds info about background.
//  * Collects all fixtures for background steps in all scenarios.
//  * Per gherkin syntax, background section must appear before scenarios.
//  */
// import * as messages from '@cucumber/messages';
// import { MatchedStepDefinition } from '../steps/matchedStepDefinition';
// import { KeywordType } from '../cucumber/keywordType';

// export type BackgroundInfo = {
//   bg: messages.Background;
//   fixtureNames: string[];
//   steps: Record<string /* step id */, BackgroundStepInfo>;
//   hasMissingSteps?: boolean;
// };

// // similar to BddStepMeta (join?)
// type BackgroundStepInfo = {
//   keyword: string;
//   location: string; // 'line:col'
//   // matched step args?
// };

// export class BackgroundsManager {
//   private backgrounds = new Map<string, BackgroundInfo>();

//   registerBackground(bg: messages.Background) {
//     this.backgrounds.set(bg.id, {
//       bg,
//       fixtureNames: [],
//       steps: {},
//     });
//   }

//   handlePickleStep(pickleStep: messages.PickleStep, matchedDefinition: MatchedStepDefinition) {
//     // iterate all bg items and all steps -> try find bg item with that step
//     //
//   }
// }
