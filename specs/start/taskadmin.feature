Feature: Task Management
  As a user
  I want to manage my tasks
  So that I can keep track of things I need to do

  Scenario: Create a new task with default status
    Given the user has no tasks
    When the user creates a task with title "Buy groceries"
    Then the task "Buy groceries" should be added to the task list
    And the task "Buy groceries" should have status "pending"

  Scenario: Create a task with dates and status
    Given the user has no tasks
    When the user creates a task with title "Project report" start date "2026-07-01" end date "2026-07-15" and status "completed"
    Then the task "Project report" should be added to the task list
    And the task "Project report" should have start date "2026-07-01"
    And the task "Project report" should have end date "2026-07-15"
    And the task "Project report" should have status "completed"

  Scenario: List all tasks
    Given the user has the following tasks:
      | title            | status     |
      | Buy groceries    | pending    |
      | Read a book      | in-progress |
    When the user requests the list of tasks
    Then the user should see 2 tasks
    And the tasks should include "Buy groceries" and "Read a book"

  Scenario: Delete a task
    Given the user has the following tasks:
      | title            | status     |
      | Buy groceries    | pending    |
      | Read a book      | in-progress |
    When the user deletes the task "Buy groceries"
    Then the user should see 1 task
    And the tasks should include "Read a book"
