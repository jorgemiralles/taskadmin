# Technical Specification: Kanban Board Columns

## Overview
Replace the single flat task list with a three-column Kanban board (Pending, In Progress, Completed). Tasks start in Pending and can be dragged between columns to change their status.

## Data Model
No changes to the task data structure. Tasks still have `{ id, title, startDate, status }` where status is one of `"pending"`, `"in-progress"`, `"completed"`.

## HTML Structure (`index.html`)

Replace `<ul id="taskList">` with a three-column Kanban layout:

```html
<div class="row" id="kanbanBoard">
  <div class="col-md-4">
    <h5 class="column-header status-pending-header">Pending</h5>
    <ul id="pendingColumn" class="kanban-column list-group" data-status="pending"></ul>
  </div>
  <div class="col-md-4">
    <h5 class="column-header status-in-progress-header">In Progress</h5>
    <ul id="inProgressColumn" class="kanban-column list-group" data-status="in-progress"></ul>
  </div>
  <div class="col-md-4">
    <h5 class="column-header status-completed-header">Completed</h5>
    <ul id="completedColumn" class="kanban-column list-group" data-status="completed"></ul>
  </div>
</div>
```

## CSS (`style.css`)

Add styles for:
- `.kanban-column` - min-height for drop target area, padding, border styling
- `.kanban-column.drag-over` - highlight background when dragging over
- `.column-header` - centered text, margin, padding
- Status-specific header colors matching existing status badge themes
- Task items get `cursor: grab` and `draggable` visual feedback
- `.task-item.dragging` - reduced opacity during drag

## JavaScript (`app.js`)

### Render Changes
- `renderTasks()` clears all three column `<ul>` elements instead of one
- Each task `<li>` gets `draggable="true"` and `data-task-id` attribute
- Tasks are sorted into columns based on their `status` property
- Task items are appended to the corresponding column's `<ul>`

### Drag-and-Drop Implementation
Using native HTML5 Drag and Drop API (no external libraries):

1. **`dragstart`** - Set `dataTransfer` with task ID, add `.dragging` class
2. **`dragover`** - On column elements: prevent default, add `.drag-over` class
3. **`dragleave`** - Remove `.drag-over` class
4. **`drop`** - On column elements:
   - Read task ID from `dataTransfer`
   - Find task in array, update `status` to column's `data-status`
   - Save state, re-render
5. **`dragend`** - Remove `.dragging` class

Event listeners attached to column `<ul>` elements (event delegation).

## Backward Compatibility
- Tasks still default to `status: 'pending'` on creation
- Edit modal still allows manual status changes
- localStorage persistence unchanged
- All existing functionality (add, edit, delete) preserved

## Files Modified
1. `index.html` - Replace taskList with kanbanBoard columns
2. `style.css` - Add kanban column styles, drag states
3. `app.js` - Update renderTasks for columns, add drag-and-drop handlers
