---
name: new-feature
description: Use when adding a new feature to the task manager app. Follows a strict workflow: branch, user story, spec, implementation, tests, commit. Use ONLY when the user asks to add a new feature or functionality to the app.
---

# New Feature Workflow

When the user asks to add a new feature, follow these steps **in order**. Do not skip steps or reorder them.

## Step 0: Create Branch

Create a feature branch from `main` with a descriptive name.

- Ensure working tree is clean on `main` before branching.
- Branch name format: `feature/<short-description>` (e.g., `feature/due-date-sorting`).
- Switch to the new branch before proceeding.

```bash
git checkout main
git checkout -b feature/<feature-name>
```

## Step 1: User Story

Update the user story in `specs/start/taskadmin.feature`.

- Add a new scenario or update existing scenarios to cover the new feature.
- Follow Gherkin syntax: `Scenario:`, `Given`, `When`, `Then`, `And`.
- Use data tables for multiple fields.
- Keep scenarios focused on one behavior each.

## Step 2: Technical Spec

Update the technical specification in `specs/start/spec.md`.

- Update the **Data Structure** section if the task model changes.
- Update the **HTML Structure** section if new elements are added.
- Update the **Features** section to describe the new behavior.
- Update **CSS Styling** if new visual elements are introduced.
- Update **JavaScript (app.js)** if new logic or DOM handling is needed.

## Step 3: Implementation

Implement the feature in the app files:

- `index.html` — add any new HTML elements.
- `style.css` — add any new styles.
- `app.js` — add the JavaScript logic.
- `agents.md` — update if server commands or workflows change.

Follow existing code conventions. Do not add comments unless asked.

## Step 4: Tests

Update or add E2E tests in `tests/tasks.spec.js`.

- Add tests that cover the new feature's happy path.
- Add edge case tests where relevant (e.g., validation, empty states).
- Ensure all tests pass by running `CHROMIUM_PATH=/usr/bin/chromium-browser npm test`.
- Restart darkhttpd before running tests: `kill -9 $(pgrep darkhttpd) 2>/dev/null; sleep 1; darkhttpd /home/taskadmin --port 8080 --daemon`.

## Step 5: Commit

After all steps are complete and tests pass:

- Stage changed files.
- Commit with a conventional commit message: `feat: <description>`.
- Commit message format: `type(scope): description`.
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.
