---
name: new-feature-workflow
description: Feature development workflow: generate Gherkin user story, write technical spec, build, run, and create Playwright tests
license: MIT
compatibility: opencode
metadata:
  workflow: feature-development
---

## Workflow Steps

### 1. Create a Feature Branch
Create and switch to a new Git branch for the feature. Name it using the pattern `feature/<short-description>` (e.g., `feature/task-status-edit-only`). Ensure you are up to date with the base branch first.

### 2. Generate Gherkin User Story
Given a feature specification, create a Gherkin-style `.feature` file and save it in the `specs/` folder (e.g., `specs/<name>/<name>.feature`). Follow the Gherkin format with `Feature:`, `As a`, `I want`, `So that`, `Scenario:`, `Given`, `When`, `Then`, `And` clauses.

### 3. Write Technical Specification
With the user story as input, generate a detailed technical specification and save it as `specs/<name>/spec.md`. Cover data structures, file structure, HTML/CSS/JS architecture, features, and implementation details.

### 4. Build
Implement the feature according to the technical spec. Use the project's existing patterns (vanilla JS, Bootstrap 5, etc.).

### 5. Run
Start the web server and verify the app loads. Refer to `agents.md` for server commands and configuration.

### 6. Create Tests from User Story
Write Playwright tests in `tests/` that cover all scenarios from the Gherkin `.feature` file. Refer to `agents.md` for test commands and configuration.
