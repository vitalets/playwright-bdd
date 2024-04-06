Feature: call step from step

  @success
  Scenario: create todos
    When I create todo "foo"
    And I create 2 todos "bar" and "baz"
    Then I see todos:
      | todo               |
      | create todos - foo |
      | create todos - bar |
      | create todos - baz |

  @error
  Scenario: incorrect invocation
    When I incorrectly create 2 todos "bar" and "baz"
