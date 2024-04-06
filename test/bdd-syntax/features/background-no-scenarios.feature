# this file should not throw an error, and should not be generated
# See: https://github.com/vitalets/playwright-bdd/issues/104
Feature: background no scenarios

  Background:
    Given Set context prop "foo" = "bar"
