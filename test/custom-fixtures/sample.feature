Feature: Playwright style bdd

    Scenario: fixtures defined in different function formats
      Given state with fixtures - arrow fn
      Given state without fixtures - arrow fn
      Given state with fixtures - function
      Given state without fixtures - function
      When action 1
      Then result with fixtures and arg equals to "bar" - function
      Then result with fixtures and arg equals to "bar" - arrow fn
      Then testInfo is available as a fixture and its title equals to "fixtures defined in different function formats"

    Scenario: Set test-scoped / worker-scoped fixture props
      When update todoPage prop to "456"
      And update account username to "test"

    Scenario: Check test-scoped / worker-scoped fixture props
      Then todoPage prop equals to "123"
      And account username equals to "test"
