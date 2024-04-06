@fixture:todoPage
Feature: use fixture by scenario tag

  Scenario: guess TodoPage by feature tag (1 variant)
    Then BasePage: used fixture is "TodoPage"

  Scenario: feature tag is not applied because step fixture is different
    Then TodoPage2: used fixture is "TodoPage2"

  @fixture:basePage
  Scenario: uses TodoPage as for several tags we select the deepest
    # maybe this can be changed: use more specific tag
    Then BasePage: used fixture is "TodoPage"

  @fixture:adminTodoPage
  Scenario: guess AdminTodoPage by scenario tag (1 variant)
    Then BasePage: used fixture is "AdminTodoPage"

  @fixture:adminTodoPage
  Scenario: guess AdminTodoPage by scenario tag from (2 variants)
    Then BasePage: used fixture is "AdminTodoPage"
    And TodoPage: used fixture is "AdminTodoPage"

  @fixture:adminTodoPage
  Scenario: guess AdminTodoPage for the first step and keep TodoPage2
    Then TodoPage: used fixture is "AdminTodoPage"
    And TodoPage2: used fixture is "TodoPage2"

  @fixture:todoPage
  Scenario: scenario tag is not applied because step is from another class
    Then TodoPage2: used fixture is "TodoPage2"

  @fixture:adminTodoPage
  @fixture:adminTodoPage2
  Scenario: several tags
    Then TodoPage: used fixture is "AdminTodoPage"
    And TodoPage2: used fixture is "AdminTodoPage2"

  @fixture:adminTodoPage
  Scenario Outline: guess AdminTodoPage for scenario outline
    Then BasePage: used fixture is "<fixture>"

    Examples:
      | fixture       |
      | AdminTodoPage |
