@include
Feature: feature outline tags

  Scenario Outline: scenario-outline
    Given state <state>

    @exclude
    Examples:
      | state |
      | 2     |
      | 3     |

    Examples:
      | state |
      | 4     |
