# Technical Specification: Task Management Web App

## Overview

A simple client-side web application for managing tasks using vanilla JavaScript, HTML, and CSS, styled with Bootstrap 5 framework.

## Data Structure

```javascript
const task = {
  id: Number,         // auto-incremented id
  title: String,      // task title
  startDate: String,  // start date (YYYY-MM-DD) or null
  status: String      // "pending" | "in-progress" | "completed"
}

const tasks = []      // array to store tasks
```

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling
- `app.js` - Application logic

## HTML Structure

```html
- <div class="container mt-4"> main container
- <h1 class="mb-4 text-center"> page title
- <form id="taskForm"> using Bootstrap form classes
  - <input class="form-control mb-2"> for task title (full width)
  - <div class="row g-2 mb-2"> containing:
    - <div class="col"><input type="date" class="form-control"> for start date
    - (no status field — status is always "pending" for new tasks)
  - <button class="btn btn-success w-100" type="submit"> to add task
- <ul id="taskList" class="list-group"> task list container using Bootstrap list-group
- <div id="confirmModal" class="modal"> using Bootstrap modal
  - <div class="modal-dialog modal-dialog-centered"> containing:
    - <div class="modal-content">:
      - <div class="modal-header"> with title and close button
      - <div class="modal-body"> with confirmation message
      - <div class="modal-footer"> with Confirm/Cancel buttons using Bootstrap btn classes
- <div id="editModal" class="modal"> using Bootstrap modal
  - <div class="modal-dialog modal-dialog-centered"> containing:
    - <div class="modal-content">:
      - <div class="modal-header"> with title and close button
      - <div class="modal-body"> with form fields:
        - <input class="form-control"> for task title
        - <input type="date" class="form-control"> for start date
        - <select class="form-select"> for task status
      - <div class="modal-footer"> with Save and Cancel buttons using Bootstrap btn classes
```

## Features

### 1. Create Task
- User types a task title in the input field
- Start date defaults to today's date
- User can modify the start date if desired
- User clicks "Add" button or presses Enter
- Task is added with status always defaulting to "pending"
- All inputs are cleared after adding, with start date reset to today

### 2. List Tasks
- Tasks displayed as `<li>` items in the `<ul>`
- Each task shows its title, start date, and status badge
- Status badges are color-coded: pending (yellow), in-progress (blue), completed (green)

### 3. Delete Task
- Each task has a delete button
- User clicks delete button to trigger confirmation
- A confirmation popup appears asking the user to confirm or cancel
- On confirm: task is removed from the list and localStorage
- On cancel: popup closes and no changes are made

### 4. Edit Task
- Each task has an edit button
- User clicks edit button to open edit popup
- Popup displays form with fields for title, start date, and status pre-filled with task data
- User modifies fields and clicks "Save" to update the task
- User clicks "Cancel" to close the popup without changes
- After saving, popup closes and task list updates

## CSS Styling

- Bootstrap 5 CSS framework loaded via CDN
- Bootstrap container for centered layout
- Bootstrap form classes (form-control, form-select) for inputs
- Bootstrap button classes (btn, btn-success, btn-danger, btn-secondary)
- Bootstrap list-group for task list
- Bootstrap modal for confirm and edit popups
- Bootstrap utility classes for spacing (mb-2, mt-4, etc.)
- Bootstrap grid system (row, col) for form layout
- Custom status badge colors (pending=warning, in-progress=info, completed=success)
- Minimal custom CSS overrides for Bootstrap defaults

## JavaScript (app.js)

- Select DOM elements (input, date input, button, list, confirm modal, edit modal, edit form fields, save/cancel buttons)
- Add click/keypress event listener for task creation
- On submit: create task object with title, startDate, and status hardcoded to "pending"
- On submit: create `<li>` element with task info, append to `<ul>`, clear inputs
- Store tasks in localStorage
- Render tasks with title, date, status badge, edit button, and delete button using Bootstrap list-group-item classes
- On delete click: show confirmation modal using Bootstrap modal API (new bootstrap.Modal)
- On confirm: remove task from array and localStorage, re-render
- On cancel: hide modal, clear pending delete id
- On edit click: show edit modal using Bootstrap modal API, populate form with task data, track editing task id
- On save: update task in array, hide edit modal, re-render
- On cancel: hide edit modal, clear editing task id
