# This file is excluded from playwright run because it contains .only
# Generated file is tested with only-skip-fixme-test.feature
@only
Feature: only-skip-fixme

  @only
  Scenario: Only
      Given State 0

  @foo @only
  Scenario: Only several tags
      Given State 0    

  @skip
  Scenario: Skip
      Given State 1  

  # in case of several system tags, only takes precendence
  @skip @only
  Scenario: Skip with only
      Given State 2 

  @fixme
  Scenario: Fixme
      Given State 3

  @only
	Scenario Outline: Check doubled
    Then Doubled <start> equals <end>

  @only
	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |

  @skip
	Examples:
		| start | end |
		|    4  |   8 |   