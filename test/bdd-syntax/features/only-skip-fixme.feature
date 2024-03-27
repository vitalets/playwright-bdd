@only
Feature: only-skip-fixme

  @only
  Scenario: Only
      Given State 0

  @foo @only
  Scenario: Only several tags
      Given State 0    

  # @skip has precendence over feature level @only
  @skip
  Scenario: Skip
      Given Skipped step

  # in case of several system tags, @only takes precendence
  @only @skip
  Scenario: Skip with only
      Given State 2 

  @fixme
  Scenario: Fixme
      Given Skipped step

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

  @skip
	Scenario Outline: Skipped scenario outline
    Given Skipped step
    Given State <value>

	Examples:
		| value |
		|   1   |