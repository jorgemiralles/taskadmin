# Technical Specification: Task Management Web App

## Overview

A simple client-side web application for managing tasks using vanilla JavaScript, HTML, and CSS.

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
- <h1> page title
- <input> for task title (full width)
- <div class="form-row"> containing:
  - <input type="date"> for start date
  - <select> for task status (pending, in-progress, completed)
- <button> to add task (sits below fields)
- <ul> task list container
- <div id="confirmModal"> confirmation popup overlay
  - <div class="modal-content"> containing message and Confirm/Cancel buttons
- <div id="editModal"> edit popup overlay
  - <div class="modal-content"> containing:
    - <input> for task title
    - <input type="date"> for start date
    - <select> for task status
    - Save and Cancel buttons
```

## Features

### 1. Create Task
- User types a task title in the input field
- User optionally selects a start date
- User selects a task status (defaults to "pending")
- User clicks "Add" button or presses Enter
- Task is added to the list below
- All inputs are cleared after adding

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

- Centered layout with max-width
- Clean, minimal design
- Styled input and button
- Task list with basic spacing
- Form is a vertical column: task title fills width, date+status on a second row, Add button below
- Task title input has larger text (16px) and padding (12px)
- Task info display with dates and status
- Color-coded status badges (pending, in-progress, completed)
- Styled select dropdown
- Edit button (blue) on each task
- Modal overlay with semi-transparent background
- Modal content box with white background, padding, border-radius, and shadow
- Confirm button (red) and Cancel button (gray) in confirm modal
- Edit modal with form fields (title input, date input, select dropdown)
- Save button (green) and Cancel button (gray) in edit modal

## JavaScript (app.js)

- Select DOM elements (input, date input, select, button, list, confirm modal, edit modal, edit form fields, save/cancel buttons)
- Add click/keypress event listener for task creation
- On submit: create task object with title, startDate, status
- On submit: create `<li>` element with task info, append to `<ul>`, clear inputs
- Store tasks in localStorage
- Render tasks with title, date, status badge, edit button, and delete button
- On delete click: show confirmation modal, track pending delete task id
- On confirm: remove task from array and localStorage, re-render
- On cancel: hide modal, clear pending delete id
- On edit click: show edit modal, populate form with task data, track editing task id
- On save: update task in array, hide edit modal, re-render
- On cancel: hide edit modal, clear editing task id
