@timeout:5000
Feature: timeout tag

  @timeout:4000
  Scenario: scenario 1
      Given success step 1

  @timeout:3000
	Scenario Outline: scenario 2
    Given success step <start>

	Examples:
		| start |
		|    2  |
		|    3  |
