@retries:3
Feature: retries tag

  @retries:2
  Scenario: scenario 1
      Given State 1

  @retries:1
	Scenario Outline: scenario 2
    Given State <start>

	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |
