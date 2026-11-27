Feature: Arguments captured by indexed step matching

  Scenario: Scenario 1
    Given User sees the "Amount" field on the CatalogItem
    And I read the CatalogItem payload
      """
      first
      """
    And I read the CatalogItem payload
      """
      second
      """
