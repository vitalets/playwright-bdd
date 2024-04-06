Feature: feature name with '`" quotes

  @mytag
  Scenario: scenario name with '`" quotes
    Given step with quotes in title '`"
    Given step with quotes in params "value with '`\" quotes" and "value with '`\" quotes"
    Given step with quotes in params 'value with \'`" quotes' and 'value with \'`" quotes'
    Given step with quotes in params "value with '`\" quotes" and 'value with \'`" quotes'
    Given step with quotes in params "value with \'`\" quotes" and 'value with \'`\" quotes'

  Scenario: docString
    Given step with docString
      """
      value with '`" quotes
      and newline
      """

  Scenario: dataTable
    Given step with dataTable
      | value1                | value2              |
      | value with '`" quotes | value with\n newline |

  Scenario Outline: scenario outline with quotes
    Given step with quotes in params "<text>" and "<text>"

    Examples:
      | text                    |
      | value with \'`\" quotes |

  Scenario Outline: scenario outline with newline
    Given step with newline in param "<text>"

    Examples:
      | text                |
      | value with\n newline |
