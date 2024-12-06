Feature: Users API

  Scenario: get users list
    When GET "/users"
    Then status is 200
    And response has prop "[0].name" = "Leanne Graham"
    And response array contains:
      ```
      { "id": 1, "name": "Leanne Graham" }
      ```

  Scenario: get user by id
    When GET "/users/1"
    Then response has prop "id" = 1
    And response has prop "name" = "Leanne Graham"
    And response has prop "address.city" = "Gwenborough"
    And response object matches:
      ```
      { "id": 1, "name": "Leanne Graham", "address": { "city": "Gwenborough" } }
      ```

  Scenario: create user
    When POST "/users"
      ```
      { "name": "New user" }
      ```
    Then status is 201
    And response has prop "id" = 11
