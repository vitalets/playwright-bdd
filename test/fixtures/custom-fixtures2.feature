Feature: custom fixtures 2

  Scenario: test-scoped fixture scenario 3
    Then testScopedFixture prop equals to "initial value"

  Scenario: worker-scoped fixture scenario 3
    Then workerScopedFixture prop equals to "updated value"
