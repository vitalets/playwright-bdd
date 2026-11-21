Feature: Todo list

  Scenario: Add a task
    When I add the task "Buy groceries"
    Then my todo list contains "Buy groceries"

  Scenario: Complete a task
    When I add the task "Buy groceries"
    And I complete the task "Buy groceries"
    Then the task "Buy groceries" is completed
