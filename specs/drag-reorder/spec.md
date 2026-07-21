# Technical Specification: Drag to Reorder Tasks Within a Column

## Overview
Enable users to reorder tasks within a Kanban column by dragging and dropping them into new positions. The order of tasks is persisted in localStorage and survives page reloads.

## Data Model Changes

### Task Object
Add an `order` field to track position within a column:

```javascript
{
  id: Number,         // Auto-incremented integer
  title: String,      // Task title text
  startDate: String,  // Date string in "YYYY-MM-DD" format, or null
  status: String,     // One of: "pending" | "in-progress" | "completed"
  order: Number       // Position within the column (0-based, lower = higher)
}
```

### Migration
Tasks without an `order` field are assigned sequential values (0, 1, 2, ...) based on their current position in the array for their column.

## File Changes

### `app.js`

#### 1. Update `loadState()` — Migrate existing tasks
- After loading tasks from localStorage, assign `order` values to tasks missing the field
- Group tasks by status, then assign sequential order values (0, 1, 2, ...)

#### 2. Update `addTask()` — Set order for new tasks
- When creating a new task, set `order` to the count of tasks in the same status column (appends to end)

#### 3. Update `renderTasks()` — Sort by order
- Sort tasks within each status group by `order` before appending to DOM
- Use stable sort to preserve relative order for equal values

#### 4. Update `createTaskElement()` — Add drop zone indicators
- Add dragover/dragleave/drop event listeners to individual `<li>` elements
- Show a visual drop indicator (CSS class `.drop-above` / `.drop-below`) when hovering over a task

#### 5. New function: `getDragAfterElement(container, y)`
- Given a container and mouse Y position, determine which task element the dragged item should be inserted before
- Returns the task `<li>` element that the cursor is above, or `null` if the cursor is below all tasks

#### 6. Update `handleDrop()` — Support same-column reordering
- If dropping within the same column, reorder tasks (update `order` values)
- If dropping into a different column, update `status` and set `order` to the end of the target column
- Recalculate all `order` values for affected columns
- Call `saveState()` and `renderTasks()`

#### 7. New function: `recalculateOrders(status)`
- Recalculate `order` values for all tasks in a given status column based on their current array position

### `style.css`

#### 1. Drop indicator styles
```css
.list-group-item.drop-above {
  border-top: 2px solid #0d6efd;
  margin-top: 2px;
}

.list-group-item.drop-below {
  border-bottom: 2px solid #0d6efd;
  margin-bottom: 2px;
}
```

#### 2. Enhanced drag feedback
- Existing `.dragging` class remains (opacity 0.4)
- Add subtle background highlight on valid drop targets

## Behavior Details

### Same-Column Reorder
1. User starts dragging a task
2. As the cursor moves over other tasks in the same column, a blue line indicator shows where the task will be placed
3. On drop, all tasks in that column have their `order` values recalculated
4. The dragged task appears at the indicated position

### Cross-Column Move
1. When dragging between columns, the existing cross-column behavior is preserved
2. The task is appended to the end of the target column
3. The `status` field is updated and `order` is set to the last position

### Persistence
- After any reorder, `saveState()` is called
- On page load, tasks are sorted by `order` within each column
- Tasks created before this feature are migrated with sequential order values

## Edge Cases
- Empty columns: No special handling needed
- Single task in column: Can be "reordered" but position doesn't change
- Dragging to same position: No state change, no unnecessary re-render
- Concurrent edits: Not applicable (single-user app)
