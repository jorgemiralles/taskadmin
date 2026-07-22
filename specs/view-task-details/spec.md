# Technical Specification: View Task Details

## Overview
Add a task details modal that displays comprehensive information about a task when clicked.

## Data Structures
No changes to existing task data structure. Tasks currently have:
- `id`: unique identifier
- `title`: task name
- `startDate`: start date (optional)
- `status`: 'pending', 'in-progress', or 'completed'
- `order`: display order within status group

## File Changes

### HTML (index.html)
- Add new Bootstrap modal `#taskDetailsModal` with:
  - Task title header
  - Status badge (styled per status)
  - Start date display
  - Action buttons: Edit and Close

### CSS (style.css)
- Add styles for `.task-details-modal` matching existing modal styles
- Add status badge variants for details view

### JavaScript (app.js)
- Add `showTaskDetailsModal(id)` function to populate and show modal
- Add click handler on task title in `createTaskElement()`
- Add modal element references and Bootstrap modal instance

## Features
- Click task title → open details modal
- Display: title, status (with badge), start date
- Edit button → opens existing edit modal
- Close button → closes details modal
- Modal uses Bootstrap 5 for consistency

## Implementation Details
1. Add modal HTML after existing edit modal
2. In `createTaskElement()`, make task title clickable
3. Add `showTaskDetailsModal()` to populate and display
4. Style modal to match existing design language
