Feature: Task Management
  As a user
  I want to manage my tasks
  So that I can keep track of things I need to do

  Scenario: Create a new task with default status
    Given the user has no tasks
    When the user creates a task with title "Buy groceries"
    Then the task "Buy groceries" should be added to the task list
    And the task "Buy groceries" should have status "pending"

  Scenario: Create a task with start date and status
    Given the user has no tasks
    When the user creates a task with title "Project report" start date "2026-07-01" and status "completed"
    Then the task "Project report" should be added to the task list
    And the task "Project report" should have start date "2026-07-01"
    And the task "Project report" should have status "completed"

  Scenario: List all tasks
    Given the user has the following tasks:
      | title            | status     |
      | Buy groceries    | pending    |
      | Read a book      | in-progress |
    When the user requests the list of tasks
    Then the user should see 2 tasks
    And the tasks should include "Buy groceries" and "Read a book"

  Scenario: Delete a task after confirmation
    Given the user has the following tasks:
      | title            | status     |
      | Buy groceries    | pending    |
      | Read a book      | in-progress |
    When the user clicks delete on the task "Buy groceries"
    Then a confirmation popup should appear asking to confirm deletion
    When the user confirms the deletion
    Then the user should see 1 task
    And the tasks should include "Read a book"

  Scenario: Cancel delete from confirmation popup
    Given the user has the following tasks:
      | title            | status     |
      | Buy groceries    | pending    |
      | Read a book      | in-progress |
    When the user clicks delete on the task "Buy groceries"
    Then a confirmation popup should appear asking to confirm deletion
    When the user cancels the deletion
    Then the user should see 2 tasks
    And the tasks should include "Buy groceries" and "Read a book"

  Scenario: Edit a task title
    Given the user has a task "Buy groceries" with status "pending"
    When the user edits the task "Buy groceries" to title "Buy organic groceries"
    Then the task "Buy organic groceries" should be in the task list
    And the task "Buy groceries" should not be in the task list

  Scenario: Edit a task status
    Given the user has a task "Buy groceries" with status "pending"
    When the user edits the task "Buy groceries" to status "completed"
    Then the task "Buy groceries" should have status "completed"

  Scenario: Edit a task start date
    Given the user has a task "Project report" with status "pending"
    When the user edits the task "Project report" with start date "2026-08-01"
    Then the task "Project report" should have start date "2026-08-01"

  Scenario: Cancel editing a task
    Given the user has a task "Buy groceries" with status "pending"
    When the user starts editing the task "Buy groceries" and cancels
    Then the task "Buy groceries" should remain unchanged with status "pending"

  Scenario: Edit preserves other tasks
    Given the user has the following tasks:
      | title            | status     |
      | Buy groceries    | pending    |
      | Read a book      | in-progress |
    When the user edits the task "Buy groceries" to title "Buy organic groceries"
    Then the user should see 2 tasks
    And the tasks should include "Buy organic groceries" and "Read a book"
