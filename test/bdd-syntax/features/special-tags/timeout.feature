@timeout:5000
Feature: timeout tag

  @timeout:4000
  Scenario: scenario 1
      Given State 1

  @timeout:3000
	Scenario Outline: scenario 2
    Given State <start>

	Examples:
		| start | end |
		|    2  |   4 |
		|    3  |   6 |
