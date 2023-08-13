Feature: decorators-without-steps

    Scenario: guess TodoPage from 1 variant
      Given TodoPage: step
      Then TodoPage: used fixture is "TodoPage"
      # custom types not supported yet for decorator steps
      # And TodoPage: passed custom type arg red to equal "red"

    Scenario: guess TodoPage from 2 variants
      Given TodoPage: step
      Then BasePage: used fixture is "TodoPage"

    Scenario: guess AdminTodoPage from 2 variants 
      Given AdminTodoPage: step
      Then BasePage: used fixture is "AdminTodoPage"

    Scenario: guess AdminTodoPage from 3 variants
      Given TodoPage: step
      And AdminTodoPage: step
      Then BasePage: used fixture is "AdminTodoPage"
      And TodoPage: used fixture is "AdminTodoPage"

    Scenario: guess two separate fixtures
      Given AdminTodoPage: step
      And TodoPage2: step
      Then TodoPage: used fixture is "AdminTodoPage"
      And TodoPage2: used fixture is "TodoPage2"

    @fixture:adminTodoPage
    Scenario: guess AdminTodoPage by tag from 1 variant
      Then BasePage: used fixture is "AdminTodoPage"

    @fixture:adminTodoPage
    Scenario: guess AdminTodoPage by tag from 2 variants
      Then BasePage: used fixture is "AdminTodoPage"
      And TodoPage: used fixture is "AdminTodoPage"

    @fixture:adminTodoPage
    Scenario: guess AdminTodoPage by tag with second fixture
      Then TodoPage: used fixture is "AdminTodoPage"
      And TodoPage2: used fixture is "TodoPage2"

    @fixture:TodoPage
    Scenario: not applied fixture tag
      Then TodoPage2: used fixture is "TodoPage2"