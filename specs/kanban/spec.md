# Task Management — Technical Specification

## 1. Overview

A static single-page web application for creating tasks and tracking them through a kanban dashboard with three columns: **Prioritize**, **In Progress**, **Done**. Tasks are moved between columns by drag and drop. All data is persisted in the browser via `localStorage`. No server-side backend, no dependencies, no build step.

## 2. Data Model

```json
{
  "id": "crypto.randomUUID()",
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 2000 chars)",
  "createdAt": "ISO 8601 timestamp",
  "status": "prioritize | in-progress | done"
}
```

Tasks are stored as a JSON array under the `localStorage` key `tasks`.

- New tasks default to `status: "prioritize"`.
- Tasks that have no `status` (created before this feature) are treated as `prioritize`.
- Column order is fixed: `prioritize` → `in-progress` → `done`. A task can be dropped onto any column.

## 3. Application Structure

Static files served from the root:
```
index.html          — main entry point (SPA shell)
styles.css          — all styling, including board/column layout
app.js              — client-side logic (CRUD, drag and drop, rendering, localStorage)
```

No new files. `app.js` reuses `getTasks()`, `saveTasks()`, and `escapeHtml()`.

## 4. UI Components

### Create Task Form

- Text input for title (required).
- Textarea for description (optional).
- Submit button — reads form values, creates a task object with `status: "prioritize"`, pushes to `localStorage`, then renders the updated board.
- On success: show flash message "Task created successfully".
- The form and the board are shown together on the same screen, stacked vertically with the board below the form; there is no separate navigation between them.

### Kanban Board

- Replaces the flat task list.
- Three columns rendered in order: Prioritize, In Progress, Done.
- Each column has a header (`h2`) with the column name, a body (`data-status` attribute matching its `status` value) that holds its task cards, and is a valid drop target.
- Empty column body shows the empty state "No tasks yet".

### Task Card

- Rendered inside its column based on `status`.
- Displays the title (`h3`), optional description (`.task-desc`), and creation date (`.task-date`).
- Is `draggable="true"`; dragging starts `dragstart`, which records the task `id` and the source column status.
- Dropping a card onto a column body (or the column) fires `dragover`/`drop` handlers that set the task's `status` to the target column's status, persist to `localStorage`, and re-render the board. Dropping onto the same column is a no-op.
- Visual feedback: a card is given a `.dragging` class while dragged, and the drop target column gets a `.drag-over` highlight.

## 5. Data Flow

```
Page load   → app.js reads localStorage["tasks"] → group tasks by status → render three columns
Create task → new task pushed with status "prioritize" → saveTasks() → re-render board
Drag drop   → drop target status captured → task.status = target status → saveTasks() → re-render board
```
