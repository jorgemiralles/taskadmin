Feature: Task Management CRUD

  As a user
  I want to create, view, update, and delete tasks
  So that I can manage my to-do items efficiently

  Scenario: Create a new task
    Given I am on the task management page
    When I click on "New Task"
    And I fill in "Title" with "Buy groceries"
    And I fill in "Description" with "Milk, eggs, and bread"
    And I set "Due Date" to "2026-08-15"
    And I set "Priority" to "High"
    And I click "Save Task"
    Then I should see a success message "Task created successfully"
    And I should see the task "Buy groceries" in the task list

  Scenario: View a task's details
    Given there is a task titled "Buy groceries" in the task list
    When I click on the task "Buy groceries"
    Then I should see the task details
    And I should see "Buy groceries" as the title
    And I should see "Milk, eggs, and bread" as the description
    And I should see "2026-08-15" as the due date
    And I should see "High" as the priority

  Scenario: Update an existing task
    Given there is a task titled "Buy groceries" in the task list
    When I click on the task "Buy groceries"
    And I click "Edit Task"
    And I change "Title" to "Buy groceries and snacks"
    And I change "Priority" to "Low"
    And I click "Save Task"
    Then I should see a success message "Task updated successfully"
    And I should see the task "Buy groceries and snacks" in the task list
    And the task "Buy groceries" should no longer exist in the task list

  Scenario: Delete a task
    Given there is a task titled "Buy groceries" in the task list
    When I click on the task "Buy groceries"
    And I click "Delete Task"
    And I confirm the deletion
    Then I should see a success message "Task deleted successfully"
    And I should not see the task "Buy groceries" in the task list
