Feature: Kanban Board Columns
  As a user managing tasks
  I want tasks organized into three columns: Pending, In Progress, and Completed
  So that I can visually track the progress of my tasks

  Scenario: Three columns are displayed on the page
    Given I am on the Task Manager page
    Then I should see a "Pending" column
    And I should see an "In Progress" column
    And I should see a "Completed" column

  Scenario: New tasks start in the Pending column
    Given I am on the Task Manager page
    When I add a task titled "Buy groceries"
    Then the task "Buy groceries" should appear in the "Pending" column
    And the "In Progress" column should be empty
    And the "Completed" column should be empty

  Scenario: Multiple new tasks appear in Pending column
    Given I am on the Task Manager page
    When I add a task titled "Task 1"
    And I add a task titled "Task 2"
    Then the task "Task 1" should appear in the "Pending" column
    And the task "Task 2" should appear in the "Pending" column

  Scenario: Drag task from Pending to In Progress
    Given I am on the Task Manager page
    And I have a task "My task" in the "Pending" column
    When I drag the task "My task" from "Pending" to "In Progress"
    Then the task "My task" should appear in the "In Progress" column
    And the "Pending" column should be empty

  Scenario: Drag task from In Progress to Completed
    Given I am on the Task Manager page
    And I have a task "My task" in the "In Progress" column
    When I drag the task "My task" from "In Progress" to "Completed"
    Then the task "My task" should appear in the "Completed" column
    And the "In Progress" column should be empty

  Scenario: Drag task from Completed back to Pending
    Given I am on the Task Manager page
    And I have a task "My task" in the "Completed" column
    When I drag the task "My task" from "Completed" to "Pending"
    Then the task "My task" should appear in the "Pending" column
    And the "Completed" column should be empty

  Scenario: Drag task from Pending to Completed directly
    Given I am on the Task Manager page
    And I have a task "Fast track task" in the "Pending" column
    When I drag the task "Fast track task" from "Pending" to "Completed"
    Then the task "Fast track task" should appear in the "Completed" column
    And the "Pending" column should be empty

  Scenario: Task status persists after drag
    Given I am on the Task Manager page
    And I have a task "Persistent task" in the "Pending" column
    When I drag the task "Persistent task" from "Pending" to "In Progress"
    And I reload the page
    Then the task "Persistent task" should appear in the "In Progress" column

  Scenario: Multiple tasks can exist in different columns
    Given I am on the Task Manager page
    And I have a task "Pending task" in the "Pending" column
    And I have a task "Active task" in the "In Progress" column
    And I have a task "Done task" in the "Completed" column
    Then the task "Pending task" should appear in the "Pending" column
    And the task "Active task" should appear in the "In Progress" column
    And the task "Done task" should appear in the "Completed" column

  Scenario: Delete task from a column
    Given I am on the Task Manager page
    And I have a task "Task to delete" in the "In Progress" column
    When I delete the task "Task to delete"
    Then the "In Progress" column should be empty

  Scenario: Edit task from a column
    Given I am on the Task Manager page
    And I have a task "Original title" in the "Pending" column
    When I edit the task "Original title" and change title to "Updated title"
    Then the task "Updated title" should appear in the "Pending" column
    And the "Pending" column should contain 1 task
