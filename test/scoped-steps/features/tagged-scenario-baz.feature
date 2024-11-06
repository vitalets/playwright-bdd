Feature: feature baz

  # todo:
  # Background:
  #   Given bg step bound to scenario
  @baz1
  Scenario: scenario baz1
    When step without tags
    And step bound to scenario

  @baz2
  Scenario: scenario baz2
    Then step without tags
    But step bound to scenario
