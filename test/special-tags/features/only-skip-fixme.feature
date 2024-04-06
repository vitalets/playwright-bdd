@only
Feature: only-skip-fixme

  @only
  Scenario: Only
    Given success step 1

  @foo
  @only
  Scenario: Only several tags
    Given success step 1

  # @skip has precendence over feature level @only
  @skip
  Scenario: Skip
    Given skipped step

  # in case of several system tags, @only takes precendence
  @only
  @skip
  Scenario: Skip with only
    Given success step 2

  @fixme
  Scenario: Fixme
    Given skipped step

  @only
  Scenario Outline: Check doubled
    Then success step <value>

    @only
    Examples:
      | value |
      | 2     |
      | 3     |

    @skip
    Examples:
      | value |
      | 4     |

  @skip
  Scenario Outline: Skipped scenario outline
    Given skipped step
    Given success step <value>

    Examples:
      | value |
      | 1     |
