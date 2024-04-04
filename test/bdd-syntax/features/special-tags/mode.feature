@mode:parallel
Feature: mode tag

  Scenario: scenario 1
      Given State 1

  @mode:default
	Scenario Outline: scenario 2
    Given State <start>

	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |
