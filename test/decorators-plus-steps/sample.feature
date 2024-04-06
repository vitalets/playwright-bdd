Feature: decorators-plus-steps

  Scenario: guess TodoPage by regular step
    Then Regular step using TodoPage
    Then BasePage: used fixture is "TodoPage"

  Scenario: guess AdminTodoPage by regular step
    Given TodoPage: step
    Then Regular step using AdminTodoPage
    Then BasePage: used fixture is "AdminTodoPage"
