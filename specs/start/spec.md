# Technical Specification: Task Management Web App

## Overview

A simple client-side web application for managing tasks using vanilla JavaScript, HTML, and CSS.

## Data Structure

```javascript
const task = {
  id: Number,         // auto-incremented id
  title: String,      // task title
  startDate: String,  // start date (YYYY-MM-DD) or null
  endDate: String,    // end date (YYYY-MM-DD) or null
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
- <input type="date"> for end date
- <select> for task status (pending, in-progress, completed)
- <button> to add task
- <ul> task list container
```

## Features

### 1. Create Task
- User types a task title in the input field
- User optionally selects a start date and end date
- User selects a task status (defaults to "pending")
- User clicks "Add" button or presses Enter
- Task is added to the list below
- All inputs are cleared after adding

### 2. List Tasks
- Tasks displayed as `<li>` items in the `<ul>`
- Each task shows its title, start date, end date, and status badge
- Status badges are color-coded: pending (yellow), in-progress (blue), completed (green)

### 3. Delete Task
- Each task has a delete button
- User clicks delete button to remove task
- Task is removed from the list
- Updated list persists to localStorage

## CSS Styling

- Centered layout with max-width
- Clean, minimal design
- Styled input and button
- Task list with basic spacing
- Flex-wrap on input group for responsive layout
- Task info display with dates and status
- Color-coded status badges (pending, in-progress, completed)
- Styled select dropdown

## JavaScript (app.js)

- Select DOM elements (input, date inputs, select, button, list)
- Add click/keypress event listener
- On submit: create task object with title, startDate, endDate, status
- On submit: create `<li>` element with task info, append to `<ul>`, clear inputs
- Store tasks in localStorage
- Render tasks with title, dates, and status badge
- Delete task from list and localStorage
