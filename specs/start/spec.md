# Task Management CRUD — Technical Specification

Derived from `specs/start/taskadmin.feature`.

## 1. Overview

This specification describes the technical requirements for a Task Management CRUD application. The application allows users to create, view, update, and delete tasks, and is governed by the acceptance criteria defined in the Gherkin feature file.

## 2. Scope

In scope:

- Create a task.
- View a task's details.
- Update an existing task.
- Delete a task.

Out of scope:

- Authentication and authorization.
- Multi-user collaboration.
- Notifications and reminders.

## 3. Functional Requirements

### 3.1 Create a Task

- **FR-1:** The application MUST provide a "New Task" control on the task management page.
- **FR-2:** The create form MUST accept the following fields:
  - `title` (required, string)
  - `description` (optional, string)
  - `dueDate` (optional, date)
  - `priority` (enum: `Low`, `Medium`, `High`; default `Medium`)
- **FR-3:** Submitting the form MUST persist the task and display the message `Task created successfully`.
- **FR-4:** The newly created task MUST appear in the task list.

### 3.2 View a Task

- **FR-5:** Clicking a task in the list MUST navigate to a details view.
- **FR-6:** The details view MUST display the task's `title`, `description`, `dueDate`, and `priority`.

### 3.3 Update a Task

- **FR-7:** The details view MUST provide an "Edit Task" control.
- **FR-8:** Editing MUST allow changing the `title` and `priority` (and all other editable fields).
- **FR-9:** Saving changes MUST persist the update and display the message `Task updated successfully`.
- **FR-10:** The updated task MUST appear in the task list with its new values.
- **FR-11:** The previous title MUST no longer exist in the task list.

### 3.4 Delete a Task

- **FR-12:** The details view MUST provide a "Delete Task" control.
- **FR-13:** Deleting MUST require explicit confirmation before removal.
- **FR-14:** Confirming deletion MUST remove the task and display the message `Task deleted successfully`.
- **FR-15:** The deleted task MUST NOT appear in the task list.

## 4. Acceptance Criteria Mapping

| Requirement | Scenario                     | Status |
|-------------|-------------------------------|--------|
| FR-1–FR-4   | Create a new task             | Must pass |
| FR-5–FR-6   | View a task's details         | Must pass |
| FR-7–FR-11  | Update an existing task       | Must pass |
| FR-12–FR-15 | Delete a task                 | Must pass |

## 5. Data Model

```
Task {
  id: UUID
  title: string            // required
  description: string      // optional
  dueDate: date            // optional
  priority: enum           // Low | Medium | High
  createdAt: datetime
  updatedAt: datetime
}
```

### Validation Rules

- `title` is required and MUST be non-empty.
- `priority` MUST be one of `Low`, `Medium`, `High`.
- `dueDate` MUST be a valid ISO 8601 date.

## 6. Architecture

The application is a static web app with no backend and no API. It consists of HTML, CSS, and vanilla JavaScript served as static files.

### Persistence

- Tasks MUST be persisted in the browser using `localStorage`.
- All task data MUST be stored under a single `localStorage` key, e.g. `taskadmin.tasks`.
- Read and write access to `localStorage` MUST be wrapped in a small storage module with `loadTasks()` and `saveTasks(tasks)` helpers.
- `localStorage` can throw in some environments (private mode, quota exceeded); the storage module MUST catch and surface a readable error.
- On write, the full task list MUST be serialized to JSON and stored atomically.

### CRUD Operations (client-side)

| Operation | Implementation                                                    |
|-----------|-------------------------------------------------------------------|
| Create    | Append new task to in-memory array and persist via storage module |
| Read      | Hydrate task list from `localStorage` on page load; render list   |
| Update    | Replace task by `id` and persist                                  |
| Delete    | Filter task out by `id` and persist                               |

## 7. File Structure (suggested)

```
index.html
styles.css
app.js
storage.js
```

## 8. UI Behavior

- Task list: sorted by `dueDate`, then `priority`.
- Success messages MUST be shown after each successful write operation.
- Delete flow MUST show a confirmation dialog before removal.
- Empty state: display a friendly message when no tasks exist.

## 9. Non-Functional Requirements

- **Performance:** Task list MUST render in under 500 ms for up to 1,000 tasks.
- **Reliability:** All write operations MUST be atomic.
- **Accessibility:** All controls MUST be operable via keyboard.
- **Compatibility:** MUST work on the latest two versions of major browsers.
