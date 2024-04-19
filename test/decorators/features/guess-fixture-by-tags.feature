# see POMs structure in a sibling file
@fixture:todoPage
Feature: guess fixture by tag

  Scenario: guess single fixture by feature tag
    Given BasePage: step
    Then used fixtures "TodoPage"

  Scenario: step fixture is deeper than feature tag
    Given AdminPage: step
    Then used fixtures "AdminPage"

  Scenario: feature tag is not applied because step fixture is different
    Given TodoPage2: step
    Then used fixtures "TodoPage2"

  @fixture:adminPage
  Scenario: for several tags we select the deepest
    # maybe this can be changed: use more specific tag
    Given BasePage: step
    Then used fixtures "AdminPage"

  @fixture:adminPage2
  Scenario: tagged fixtures have priority
    Given TodoPage: step
    Given AdminPage: step
    Given AdminPage2: step
    Then used fixtures "AdminPage2,AdminPage,AdminPage2"

  @fixture:adminPage2
  Scenario: tagged fixtures have priority even if there is no steps with it
    Given TodoPage: step
    Given AdminPage: step
    Then used fixtures "AdminPage2,AdminPage"

  @fixture:adminPage
  Scenario: scenario tag is not applied because step fixture is different
    Given TodoPage2: step
    Then used fixtures "TodoPage2"

  @fixture:adminPage
  @fixture:adminPage3
  Scenario: several scenario tags
    Given TodoPage: step
    Given TodoPage2: step
    Then used fixtures "AdminPage,AdminPage3"

  @fixture:adminPage
  Scenario Outline: guess fixture for scenario outline
    Given BasePage: step
    Then used fixtures "<fixtures>"

    Examples:
      | fixtures  |
      | AdminPage |
