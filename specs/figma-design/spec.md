# Task Management — Figma Design Implementation

Technical Specification

## 1. Overview

Restyle the existing single-page task management app to match the **"Task Management & To-Do List"** design (Figma file `WDOvjq45GaY2SjtvAEMM8e`, screens `home`, `today's tasks`, `add project in task list`). All existing functionality is preserved: create task, kanban columns, drag and drop, `localStorage` persistence. No backend, no build step, no new runtime libraries (icons are inline SVG; the Lexend Deca font is loaded from Google Fonts with a system fallback).

The DOM structure, IDs, and class names required by the existing e2e tests are kept unchanged:
`#task-form`, `#task-title`, `#task-desc`, `#submit-btn`, `#flash`, `#page-create`, `#page-board`, `.kanban-column[data-status]`, `.column-title`, `.column-body`, `.empty-state`, `.task-card`, `h3`, `.task-desc`, `.task-date`.

## 2. Design Tokens

Sourced from the Figma file (Color System + Typeface frames).

| Token | Value | Usage |
|---|---|---|
| `--color-primary` | `#5F33E1` | Buttons, accents, active nav, badges |
| `--color-primary-light` | `#EDE8FF` | Column/card backgrounds, hover |
| `--color-primary-faint` | `#EEE9FF` | Pills, progress track |
| `--color-accent-pink` | `#F478B8` | Secondary accents |
| `--color-text` | `#24252C` | Headings, task titles |
| `--color-text-muted` | `#6E6A7C` | Labels, dates, times |
| `--color-surface` | `#FFFFFF` | Cards, app background |
| `--color-to-do` | `#0087FF` | To-do status badge |
| `--color-in-progress` | `#5F33E1` | In Progress status badge |
| `--color-done` | `#047C78` | Done status badge |
| Font | `Lexend Deca` (400, 600); fallback sans-serif | Body, headings |

Status badge chips use light tinted backgrounds (`#E3F2FF`, `#EDE8FF`, `#E7F3FF`) with the matching token as text color.

## 3. Application Structure

Static files, unchanged:

```
index.html          — SPA shell (adds Google Fonts link, greeting header, bottom nav)
styles.css          — full restyle using the design tokens above
app.js              — adds a status badge and time to rendered task cards
```

## 4. UI Components

### Header (greeting)

- Replaces the current plain `<header>`.
- Small muted "Hello!" line, bold user name line (e.g. "Livia Vaccaro" — a static label, since there is no auth), and a notification bell icon (inline SVG) on the right.
- Fonts `Lexend Deca`, text color `#24252C`.

### Create Task Form (`#page-create`)

- Styled per the Figma "Add Project" screen: each field is a rounded card (`border-radius: 15px`) with a small muted label above the input.
- Title input `#task-title`, description textarea `#task-desc` keep their current behavior and attributes.
- Submit button `#submit-btn` is full width, `--color-primary` background, white text, rounded.
- `#flash` success message restyled as a rounded toast.

### Kanban Board (`#page-board`)

- Keeps the three-column grid; on narrow screens the board scrolls horizontally so columns remain side by side.
- Each column keeps `data-status`, `.column-title`, `.column-body`, `.empty-state` ("No tasks yet").
- Columns use `--color-primary-faint` backgrounds with rounded corners.

### Task Card

- Styled like the "Today's Tasks" cards: white rounded card (`border-radius: 15px`), subtle shadow.
- Layout: small muted project line (the task `description`), title (`h3`), a footer row with creation date (`.task-date`, unchanged format) plus a formatted time (`.task-time`, e.g. "10:00 AM"), and a status badge (`.task-badge`) in the top-right.
- Badge label derived from `status`: `prioritize → "To-do"`, `in-progress → "In Progress"`, `done → "Done"` (matching the design's filter tabs); color per the design tokens.
- Keeps `draggable="true"`, `.dragging`, and drag/drop behavior unchanged.

### Bottom Navigation Bar

- Fixed at the bottom of the app container.
- Five buttons with inline SVG icons + labels: Home, Calendar, Add (center, elevated primary-purple circle), Tasks, Profile.
- Non-functional placeholders except the center Add button, which focuses the create form (`#task-title`).

## 5. Data Flow

No changes to the data model or persistence flow:

```
Page load   → app.js reads localStorage["tasks"] → group by status → render styled columns/cards
Create task → new task pushed with status "prioritize" → saveTasks() → re-render → flash message
Drag drop   → drop target status captured → task.status = target status → saveTasks() → re-render
```

Only `renderCard()` changes (adds `.task-time` and `.task-badge`); `renderBoard()`, `getTasks()`, `saveTasks()`, and the form/drag handlers are otherwise untouched.
