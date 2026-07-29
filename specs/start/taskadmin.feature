Feature: Task Management
  As a user
  I want to create and list tasks
  So that I can keep track of my work

  Scenario: Create a new task
    Given I am on the task creation page
    When I fill in the task title "Buy groceries"
    And I fill in the task description "Milk, eggs, bread"
    And I submit the task form
    Then I should see a success message "Task created successfully"
    And the task "Buy groceries" should appear in the task list

  Scenario: List all tasks
    Given there are existing tasks
    When I navigate to the task list page
    Then I should see a list of all tasks
    And each task should display its title

