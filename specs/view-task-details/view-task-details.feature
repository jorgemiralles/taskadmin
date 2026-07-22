Feature: View Task Details
  As a user managing tasks
  I want to view detailed information about a task
  So that I can see all relevant information without editing

  Scenario: View task details by clicking on a task
    Given I am on the Task Manager page
    And I have a task "Buy groceries" in the "Pending" column
    When I click on the task "Buy groceries"
    Then a task details modal should appear
    And the modal should display the task title "Buy groceries"
    And the modal should display the task status "To-do"
    And the modal should display the task start date

  Scenario: Close task details modal
    Given I am on the Task Manager page
    And I have a task "Buy groceries" in the "Pending" column
    When I click on the task "Buy groceries"
    Then a task details modal should appear
    When I click the close button on the modal
    Then the task details modal should be closed

  Scenario: View task details shows correct status badge
    Given I am on the Task Manager page
    And I have a task "Active task" in the "In Progress" column
    When I click on the task "Active task"
    Then a task details modal should appear
    And the modal should display the task status "In Progress"

  Scenario: View completed task details
    Given I am on the Task Manager page
    And I have a task "Done task" in the "Completed" column
    When I click on the task "Done task"
    Then a task details modal should appear
    And the modal should display the task status "Done"

  Scenario: Edit task from details modal
    Given I am on the Task Manager page
    And I have a task "Buy groceries" in the "Pending" column
    When I click on the task "Buy groceries"
    Then a task details modal should appear
    When I click the edit button in the details modal
    Then the edit task modal should appear
