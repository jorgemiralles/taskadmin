# Technical Specification: Task Management CRUD

## 1. Overview

A browser-based Task Management application built with vanilla JavaScript (HTML, CSS, JS). No server or backend: all task data is persisted locally in the browser using `localStorage`.

## 2. Tech Stack

- **Language**: Vanilla JavaScript (ES6+), no frameworks or libraries.
- **Persistence**: Browser `localStorage`.
- **Structure**: `index.html`, `styles.css`, `app.js`.

## 3. Data Model

### Task

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| id | string | Yes | Unique, generated via `crypto.randomUUID()` or timestamp |
| title | string | Yes | Max length 255 characters, must be unique |
| description | string | No | Free-form text |
| priority | enum | Yes | One of: `Low`, `Medium`, `High` |
| status | enum | Yes | One of: `Open`, `In Progress`, `Completed`, default `Open` |
| createdAt | number | Yes | Timestamp of creation |
| updatedAt | number | Yes | Timestamp of last update |

## 4. Persistence Layer

- Tasks stored under the `localStorage` key `tasks` as a JSON array: `JSON.parse(localStorage.getItem('tasks'))`.
- All operations (create, update, delete) read the array, mutate it, and write it back with `localStorage.setItem('tasks', JSON.stringify(tasks))`.
- Handle the case where the stored value is `null`, missing, or malformed by initializing to an empty array.
- Guard `localStorage` access so the app does not throw if storage is unavailable (e.g., private mode).

### LocalStorage Module Functions

| Function | Behaviour |
|----------|-----------|
| `getTasks()` | Reads and parses the task array from `localStorage`; returns `[]` if absent or malformed |
| `saveTasks(tasks)` | Serializes and writes the task array back to `localStorage` |

## 5. UI Views

- **Task List View**: table/rows of tasks showing Title, Priority, and Status, with an "Add Task" button.
- **Task Details View**: shows the full task (title, description, priority, status) with "Edit" and "Delete" buttons.
- **Task Form** (Create/Edit): fields for Title (required), Description, Priority (select), and Status (select, edit mode only).
- **Delete Confirmation Dialog**: in-browser modal prompting the user to confirm deletion.
- **Toast/Notification Area**: renders success messages and validation errors.

Views are rendered/hidden via the DOM (e.g., toggling panel visibility); no page reloads, no routing library.

## 6. Module Responsibilities (app.js)

| Module | Responsibilities |
|--------|------------------|
| `renderList()` | Renders the task list from `getTasks()` |
| `renderDetails(task)` | Renders the task details view for a given task |
| `openCreateForm()` | Shows empty form for creation; hides the Status field |
| `openEditForm(task)` | Shows the form pre-filled with the task; Status editable |
| `saveTask(e)` | Reads form values, validates, creates or updates a task, persists, shows success message |
| `deleteTask(id)` | Shows confirmation dialog; on confirm removes the task, persists, shows success message |
| `showToast(message, type)` | Displays a temporary success/error notification |

## 7. Behavior Flows

### 7.1 Create Task
1. User clicks "Add Task".
2. User fills in Title, Description, and selects a Priority.
3. User clicks "Save".
4. App validates input; on success creates a task (status defaults to `Open`), writes to `localStorage`, shows "Task created successfully".
5. New task appears in the task list.

### 7.2 View Task
1. User clicks a task title in the list.
2. App navigates (within the single page) to the task details view showing title, description, and priority.

### 7.3 Update Task
1. User opens task details and clicks "Edit".
2. User modifies fields (e.g., Status).
3. User clicks "Save".
4. App validates input; on success updates the task, writes to `localStorage`, shows "Task updated successfully".
5. Updated values are reflected in the list.

### 7.4 Delete Task
1. User opens task details and clicks "Delete".
2. App shows a confirmation dialog.
3. User confirms.
4. App removes the task, writes to `localStorage`, shows "Task deleted successfully".
5. Task no longer appears in the list.

## 8. Validation Rules

- `title` must be non-empty and max 255 characters.
- `title` must be unique across tasks (case-insensitive) — otherwise show "A task with this title already exists".
- `priority` must be one of `Low`, `Medium`, `High`.
- `status` must be one of `Open`, `In Progress`, `Completed`.
- On validation failure, show the error message in the toast and keep the user's form input.

## 9. Success Messages

| Action | Message |
|--------|---------|
| Create | Task created successfully |
| Update | Task updated successfully |
| Delete | Task deleted successfully |

## 10. Acceptance Criteria

- All scenarios in `specs/start/taskadmin.feature` pass.
- Successful create/update/delete operations surface the corresponding success messages.
- Deleted tasks are removed from the task list.
- Update changes (e.g., status) are reflected in the task list.
- Task data persists across browser refreshes via `localStorage`.
- No backend, network requests, or external dependencies.