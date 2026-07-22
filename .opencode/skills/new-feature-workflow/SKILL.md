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

### 2. Review Existing User Stories
Review existing Gherkin-style `.feature` files in the `specs/` folder. Check if the requested feature is already covered or if there is an existing user story that can be extended.

### 3. Choose or Create a User Story
Determine whether to modify an existing `.feature` file or generate a new one:
- **Modify**: If an existing user story covers a related feature, update it to include the new scenarios.
- **Create new**: If this is an entirely new feature, create a new `.feature` file following the Gherkin format with `Feature:`, `As a`, `I want`, `So that`, `Scenario:`, `Given`, `When`, `Then`, `And` clauses.

Save or update the file in the `specs/` folder with the `.feature` extension (e.g., `specs/<name>/<name>.feature`).

### 4. Write Technical Specification
Using the user story as input, generate a detailed technical specification and save it as `specs/<name>/spec.md`. Cover data structures, file structure, HTML/CSS/JS architecture, features, and implementation details.

### 5. User Review
**Ask the user to review the technical specification before proceeding.** Present the spec summary and wait for explicit approval. Do not move to the build step until the user confirms they are satisfied with the spec.

### 6. Build
Implement the feature according to the technical spec. Use the project's existing patterns (vanilla JS, Bootstrap 5, etc.).

### 7. Run
Start the web server and verify the app loads. Refer to `agents.md` for server commands and configuration.

### 8. Create Tests from User Story
Write Playwright tests in `tests/` that cover all scenarios from the Gherkin `.feature` file. Refer to `agents.md` for test commands and configuration.
