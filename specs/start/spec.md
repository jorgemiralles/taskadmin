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
- <input> for task title
- <input type="date"> for start date
- <select> for task status (pending, in-progress, completed)
- <button> to add task (text changes to "Save" when editing)
- <button> to cancel editing (hidden by default)
- <ul> task list container
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
- User clicks delete button to remove task
- Task is removed from the list
- Updated list persists to localStorage

### 4. Edit Task
- Each task has an edit button
- User clicks edit button to enter edit mode
- Form fields populate with the task's current values
- Add button text changes to "Save", cancel button becomes visible
- User modifies fields and clicks "Save" to update the task
- User clicks "Cancel" to exit edit mode without changes
- After saving, form clears and returns to add mode

## CSS Styling

- Centered layout with max-width
- Clean, minimal design
- Styled input and button
- Task list with basic spacing
- Form fields laid out in a single flex row (no wrapping)
- Task info display with dates and status
- Color-coded status badges (pending, in-progress, completed)
- Styled select dropdown
- Edit button (blue) on each task
- Cancel button (gray, hidden by default) in form

## JavaScript (app.js)

- Select DOM elements (input, date input, select, button, cancel button, list)
- Add click/keypress event listener
- On submit: create task object with title, startDate, status
- On submit: create `<li>` element with task info, append to `<ul>`, clear inputs
- Store tasks in localStorage
- Render tasks with title, date, status badge, edit button, and delete button
- Delete task from list and localStorage
- Track editingTaskId (null when not editing)
- On edit click: populate form with task data, switch to edit mode
- On save: update task in array, exit edit mode, re-render
- On cancel: clear form, exit edit mode
