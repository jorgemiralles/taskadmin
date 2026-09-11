Feature: Task Management CRUD
  As a user
  I want to manage my tasks
  So that I can create, view, update, and delete tasks

  Scenario: Create a new task
    Given I am on the task list page
    When I click the "Add Task" button
    And I fill in "Title" with "Write project report"
    And I fill in "Description" with "Document the findings of the Q3 review"
    And I select "High" as the priority
    And I click the "Save" button
    Then I should see a success message "Task created successfully"
    And I should see a task titled "Write project report" in the task list

  Scenario: View a task
    Given there is a task titled "Write project report" in the task list
    When I click on the task titled "Write project report"
    Then I should see the task details page
    And I should see "Write project report" as the title
    And I should see "Document the findings of the Q3 review" as the description
    And I should see "High" as the priority

  Scenario: Update a task
    Given there is a task titled "Write project report" in the task list
    When I view the task titled "Write project report"
    And I click the "Edit" button
    And I change the "Status" to "Completed"
    And I click the "Save" button
    Then I should see a success message "Task updated successfully"
    And the task titled "Write project report" should show status "Completed"

  Scenario: Delete a task
    Given there is a task titled "Write project report" in the task list
    When I view the task titled "Write project report"
    And I click the "Delete" button
    And I confirm the deletion
    Then I should see a success message "Task deleted successfully"
    And I should not see a task titled "Write project report" in the task list