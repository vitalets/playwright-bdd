import { createBdd } from 'playwright-bdd';
import { trackMatchCalls } from '../track-match-calls';

const { Given } = createBdd();

trackMatchCalls();

Given('open LongestWord', ({}) => {});
Given('close OtherWord LongestWord', ({}) => {});
Given('use LongestWord via PrimaryAction/SecondaryAction', ({}) => {});
Given('open :OtherWord', ({}) => {});
Given('read LongestWord:body{DocString}', { bddExpr: true }, ({}) => {});
Given(/^LongestWord$/i, ({}) => {});
// The second alternative can match without the literal prefix.
Given(/abcdefghij{foo|bar}/, ({}) => {});
