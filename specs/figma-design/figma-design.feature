Feature: Figma Design Implementation
  As a user
  I want the task manager to look and feel like the "Task Management & To-Do List" design in Figma
  So that the app matches the intended brand and is pleasant to use

  Scenario: The app loads with the new design
    Given I open the app
    Then I should see a greeting header with "Hello!" and a notification icon
    And I should see a bottom navigation bar with Home, Calendar, Add, Tasks, and Profile buttons

  Scenario: The create task form matches the design
    Given I am on the task creation page
    Then the form labels appear above each input field
    And the submit button is styled as the design's primary button

  Scenario: The kanban board matches the design
    Given there are existing tasks
    Then I should see the three columns "Prioritize", "In Progress", and "Done"
    And an empty column shows its empty state "No tasks yet"

  Scenario: Task cards show a project, time, and status
    Given there is a task "Buy groceries" in the "Prioritize" column
    Then the task card shows its title and description
    And the task card shows the creation date and a time
    And the task card shows its status "To-do"

  Scenario: Creating a task still works with the new design
    Given I am on the task creation page
    When I fill in the task title "Buy groceries"
    And I submit the task form
    Then I should see a success message "Task created successfully"
    And the task "Buy groceries" should appear in the "Prioritize" column

  Scenario: Dragging a task between columns still works with the new design
    Given there is a task "Buy groceries" in the "Prioritize" column
    When I drag the task "Buy groceries" onto the "In Progress" column
    Then the task "Buy groceries" should appear in the "In Progress" column

  Scenario: The column position of a task survives a page reload
    Given there is a task "Write specs" in the "In Progress" column
    When I reload the page
    Then the task "Write specs" should still appear in the "In Progress" column
