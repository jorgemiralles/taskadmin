# Agents

## Project

- Project: Task Management CRUD application
- Description: A web application for managing personal tasks, supporting the full CRUD lifecycle of create, view, update, and delete.
- Specifications: Gherkin feature file at `specs/start/taskadmin.feature`; technical spec at `specs/start/spec.md`

## Tech Stack

- Language: Vanilla JavaScript (ES6+), no frameworks or libraries.
- Files: `index.html`, `styles.css`, `app.js`
- Persistence: Browser `localStorage`, key `tasks`, JSON array of tasks.
- Storage helpers: `getTasks()`, `saveTasks(tasks)`.

## Data Model

- Task fields: `id`, `title` (required, unique, max 255), `description`, `priority` (`Low`/`Medium`/`High`), `status` (`Open`/`In Progress`/`Completed`, default `Open`), `createdAt`, `updatedAt`.

## UI Conventions

- Single-page: task list, details view, create/edit form, delete confirmation modal, toast notifications.
- No page reloads or routing library.
- Success messages: "Task created successfully", "Task updated successfully", "Task deleted successfully".

## Operating System

- OS: Alpine Linux
- Version: 3.24.1
- Platform: Linux

## Package Manager

- Package manager: `apk` (Alpine Linux Package Manager)
- Binary location: `/sbin/apk`

## Common Commands

- Update package index: `apk update`
- Upgrade packages: `apk upgrade`
- Install a package: `apk add <package>`
- Remove a package: `apk del <package>`
- Search for a package: `apk search <pattern>`
- List installed packages: `apk list --installed`