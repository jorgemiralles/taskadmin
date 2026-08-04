Feature: Kanban Dashboard
  As a user
  I want to see my tasks organized into columns and drag them between columns
  So that I can track each task through Prioritize, In Progress, and Done

  Scenario: View the kanban board with three columns
    Given there are existing tasks
    Then I should see a board with three columns "Prioritize", "In Progress", and "Done"

  Scenario: Newly created tasks land in the Prioritize column
    Given I am on the task creation page
    When I fill in the task title "Buy groceries"
    And I submit the task form
    Then the task "Buy groceries" should appear in the "Prioritize" column

  Scenario: Drag a task from Prioritize to In Progress
    Given there is a task "Buy groceries" in the "Prioritize" column
    When I drag the task "Buy groceries" onto the "In Progress" column
    Then the task "Buy groceries" should appear in the "In Progress" column

  Scenario: Drag a task from In Progress to Done
    Given there is a task "Write specs" in the "In Progress" column
    When I drag the task "Write specs" onto the "Done" column
    Then the task "Write specs" should appear in the "Done" column

  Scenario: Drag a task back to a previous column
    Given there is a task "Write specs" in the "In Progress" column
    When I drag the task "Write specs" onto the "Prioritize" column
    Then the task "Write specs" should appear in the "Prioritize" column

  Scenario: Drag a task from Prioritize straight to Done
    Given there is a task "Ship it" in the "Prioritize" column
    When I drag the task "Ship it" onto the "Done" column
    Then the task "Ship it" should appear in the "Done" column

  Scenario: Each column shows an empty state when it has no tasks
    Given there are no tasks
    Then each column should show its empty state text

  Scenario: Column position survives a page reload
    Given there is a task "Write specs" in the "In Progress" column
    When I reload the page
    Then the task "Write specs" should still appear in the "In Progress" column
