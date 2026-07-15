# Technical Specification: Task Management Web App

## Overview

A simple client-side web application for managing tasks using vanilla JavaScript, HTML, and CSS.

## Data Structure

```javascript
const task = {
  id: Number,       // auto-incremented id
  title: String,    // task title
  completed: false  // completion status
}

const tasks = []    // array to store tasks
```

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling
- `app.js` - Application logic

## HTML Structure

```html
- <h1> page title
- <input> for task title
- <button> to add task
- <ul> task list container
```

## Features

### 1. Create Task
- User types a task title in the input field
- User clicks "Add" button or presses Enter
- Task is added to the list below
- Input is cleared after adding

### 2. List Tasks
- Tasks displayed as `<li>` items in the `<ul>`
- Each task shows its title

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

## JavaScript (app.js)

- Select DOM elements (input, button, list)
- Add click/keypress event listener
- On submit: create `<li>` element, append to `<ul>`, clear input
- Store tasks in local storage on the browser
