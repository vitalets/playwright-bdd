Feature: only-skip-fixme-test

  Scenario: Generated test file contains correct test marks
    Then File "only-skip-fixme.feature.spec.js" contains
      | substring |
      | test.describe.only("only-skip-fixme" |
      | test.only("Only several tags" |
      | test.skip("Skip" |
      | test.only("Skip with only" |
      | test.fixme("Fixme" |
      | test.describe.only("Check doubled" |
      | test.only("Example #1" |
      | test.only("Example #2" |
      | test.skip("Example #3" |
