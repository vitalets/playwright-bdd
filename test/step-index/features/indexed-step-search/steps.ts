import { createBdd } from 'playwright-bdd';
import { trackMatchCalls } from '../track-match-calls';

const { Given } = createBdd();

trackMatchCalls();

Given('open LongestWord', ({}) => {});
Given('close OtherWord LongestWord', ({}) => {});
Given('use LongestWord via PrimaryAction/SecondaryAction', ({}) => {});
Given('open :OtherWord', ({}) => {});
Given(/^LongestWord$/i, ({}) => {});
// The second alternative can match without the literal prefix.
Given(/abcdefghij{foo|bar}/, ({}) => {});

Given('read LongestWord:body{DocString}', { bddExpr: true }, ({}) => {});
Given('choose [CommonWord first/CommonWord second]', { bddExpr: true }, ({}) => {});
Given('pick {SharedWord first/SharedWord second}', { bddExpr: true }, ({}) => {});
Given(
  'use [PrimaryAction/SecondaryAction] (OptionalWord ):parameterName{word}',
  { bddExpr: true },
  ({}) => {},
);
