# Fixtures inheritance is following:
#             BasePage
#            /        \
#     TodoPage         TodoPage2
#     /       \
# AdminPage    AdminPage2
Feature: guess fixture by steps

  Scenario: guess single fixture from one step
    Given TodoPage: step
    Then used fixtures "TodoPage"

  Scenario: guess single single fixture two steps
    Given BasePage: step
    Given TodoPage: step
    Then used fixtures "TodoPage,TodoPage"

  Scenario: guess single fixture from two steps
    Given BasePage: step
    Given AdminPage: step
    Then used fixtures "AdminPage,AdminPage"

  Scenario: guess single fixture from three steps
    Given BasePage: step
    Given TodoPage: step
    Given AdminPage: step
    Then used fixtures "AdminPage,AdminPage,AdminPage"

  Scenario: guess two fixtures
    Given TodoPage: step
    Given TodoPage2: step
    Then used fixtures "TodoPage,TodoPage2"

  Scenario: guess two fixtures for three steps
    # 1st step has TodoPage b/c there is no BasePage fixture
    # if statefulPoms = true -> error
    Given BasePage: step
    Given TodoPage: step
    Given TodoPage2: step
    Then used fixtures "TodoPage,TodoPage,TodoPage2"

  Scenario: guess three fixtures for three steps
    # if statefulPoms = true -> error
    Given TodoPage: step
    Given AdminPage: step
    Given AdminPage2: step
    Then used fixtures "TodoPage,AdminPage,AdminPage2"
