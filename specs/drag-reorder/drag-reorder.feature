Feature: Drag to Reorder Tasks Within a Column
  As a user managing tasks on a Kanban board
  I want to reorder tasks within a column by dragging them
  So that I can prioritize and organize my tasks within each status category

  Scenario: Tasks maintain their order after creation
    Given I am on the Task Manager page
    When I add a task titled "First task"
    And I add a task titled "Second task"
    And I add a task titled "Third task"
    Then the task "First task" should appear before "Second task" in the "Pending" column
    And the task "Second task" should appear before "Third task" in the "Pending" column

  Scenario: Reorder tasks by dragging within the same column
    Given I am on the Task Manager page
    And I have a task "First task" in the "Pending" column
    And I have a task "Second task" in the "Pending" column
    And I have a task "Third task" in the "Pending" column
    When I drag the task "Third task" to before "First task" in the "Pending" column
    Then the task "Third task" should appear before "First task" in the "Pending" column
    And the task "First task" should appear before "Second task" in the "Pending" column

  Scenario: Reorder tasks to the end of the column
    Given I am on the Task Manager page
    And I have a task "First task" in the "Pending" column
    And I have a task "Second task" in the "Pending" column
    When I drag the task "First task" to after "Second task" in the "Pending" column
    Then the task "Second task" should appear before "First task" in the "Pending" column

  Scenario: Task order persists after page reload
    Given I am on the Task Manager page
    And I have a task "Task A" in the "Pending" column
    And I have a task "Task B" in the "Pending" column
    When I drag the task "Task B" to before "Task A" in the "Pending" column
    And I reload the page
    Then the task "Task B" should appear before "Task A" in the "Pending" column

  Scenario: Reorder tasks in In Progress column
    Given I am on the Task Manager page
    And I have a task "Active 1" in the "In Progress" column
    And I have a task "Active 2" in the "In Progress" column
    When I drag the task "Active 2" to before "Active 1" in the "In Progress" column
    Then the task "Active 2" should appear before "Active 1" in the "In Progress" column

  Scenario: Reorder tasks in Completed column
    Given I am on the Task Manager page
    And I have a task "Done 1" in the "Completed" column
    And I have a task "Done 2" in the "Completed" column
    When I drag the task "Done 2" to before "Done 1" in the "Completed" column
    Then the task "Done 2" should appear before "Done 1" in the "Completed" column

  Scenario: Dragging task between columns preserves order in target column
    Given I am on the Task Manager page
    And I have a task "Pending A" in the "Pending" column
    And I have a task "Pending B" in the "Pending" column
    And I have a task "In Progress X" in the "In Progress" column
    When I drag the task "Pending A" from "Pending" to "In Progress"
    Then the task "Pending A" should appear in the "In Progress" column
    And the task "Pending A" should appear after "In Progress X" in the "In Progress" column
