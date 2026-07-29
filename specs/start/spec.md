# Task Management — Technical Specification

## 1. Overview

A static single-page web application for creating and listing tasks. All data is persisted in the browser via `localStorage`. No server-side backend.

## 2. Data Model

```json
{
  "id": "crypto.randomUUID()",
  "title": "string (required, max 200 chars)",
  "description": "string (optional, max 2000 chars)",
  "createdAt": "ISO 8601 timestamp"
}
```

Tasks are stored as a JSON array under the `localStorage` key `tasks`.

## 3. Application Structure

Static files served from the root:
```
index.html          — main entry point (SPA shell)
styles.css          — all styling
app.js              — client-side logic (CRUD, rendering, localStorage)
```

## 4. UI Components

### Create Task Form

- Text input for title (required).
- Textarea for description (optional).
- Submit button — reads form values, creates a task object, pushes to `localStorage`, then renders the updated task list.
- On success: show flash message "Task created successfully".

### Task List

- On page load, reads tasks from `localStorage` and renders them as a list.
- Each task card displays the title and creation date.
- Empty state: "No tasks yet" when the task array is empty.

## 5. Data Flow

```
User fills form → app.js creates task object → appends to localStorage["tasks"] → re-render list
Page load → app.js reads localStorage["tasks"] → render list
```

