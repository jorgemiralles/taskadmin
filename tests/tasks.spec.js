const { test, expect } = require('@playwright/test');

test.describe('Task Manager', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('loads with correct title', async ({ page }) => {
    await expect(page).toHaveTitle('Task Manager');
    await expect(page.locator('h1')).toHaveText('Task Manager');
  });

  test('starts with an empty task list', async ({ page }) => {
    await expect(page.locator('#taskList li')).toHaveCount(0);
  });

  test('displays input and add button', async ({ page }) => {
    await expect(page.locator('#taskInput')).toBeVisible();
    await expect(page.locator('#addBtn')).toBeVisible();
    await expect(page.locator('#startDate')).toBeVisible();
    await expect(page.locator('#taskStatus')).toBeVisible();
  });

  test('adds a task via button click', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');

    await expect(page.locator('#taskList li')).toHaveCount(1);
    await expect(page.locator('#taskList li').first()).toContainText('Buy groceries');
    await expect(page.locator('#taskInput')).toHaveValue('');
  });

  test('adds a task via Enter key', async ({ page }) => {
    await page.fill('#taskInput', 'Walk the dog');
    await page.press('#taskInput', 'Enter');

    await expect(page.locator('#taskList li')).toHaveCount(1);
    await expect(page.locator('#taskList li').first()).toContainText('Walk the dog');
  });

  test('does not add empty task', async ({ page }) => {
    await page.click('#addBtn');
    await expect(page.locator('#taskList li')).toHaveCount(0);

    await page.fill('#taskInput', '   ');
    await page.click('#addBtn');
    await expect(page.locator('#taskList li')).toHaveCount(0);
  });

  test('renders task titles as text, not HTML', async ({ page }) => {
    await page.fill('#taskInput', '<script>alert("xss")</script>');
    await page.click('#addBtn');

    const taskText = await page.locator('#taskList li').first().innerText();
    expect(taskText).toContain('<script>alert("xss")</script>');

    let dialog = false;
    page.on('dialog', () => { dialog = true; });
    await expect(page.locator('#taskList li')).toHaveCount(1);
    expect(dialog).toBe(false);
  });

  test('adds multiple tasks', async ({ page }) => {
    await page.fill('#taskInput', 'Task 1');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task 2');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task 3');
    await page.click('#addBtn');

    await expect(page.locator('#taskList li')).toHaveCount(3);
    await expect(page.locator('#taskList li').nth(0)).toContainText('Task 1');
    await expect(page.locator('#taskList li').nth(1)).toContainText('Task 2');
    await expect(page.locator('#taskList li').nth(2)).toContainText('Task 3');
  });

  test('deletes a task after confirmation', async ({ page }) => {
    await page.fill('#taskInput', 'Task to delete');
    await page.click('#addBtn');
    await expect(page.locator('#taskList li')).toHaveCount(1);

    await page.click('.delete-btn');
    await expect(page.locator('#confirmModal')).toBeVisible();
    await expect(page.locator('.modal-content p')).toHaveText('Are you sure you want to delete this task?');

    await page.click('#confirmDeleteBtn');
    await expect(page.locator('#taskList li')).toHaveCount(0);
    await expect(page.locator('#confirmModal')).not.toBeVisible();
  });

  test('deletes correct task from multiple after confirmation', async ({ page }) => {
    await page.fill('#taskInput', 'Keep');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Remove');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Keep too');
    await page.click('#addBtn');

    await expect(page.locator('#taskList li')).toHaveCount(3);

    await page.locator('#taskList li', { hasText: 'Remove' }).locator('.delete-btn').click();
    await expect(page.locator('#confirmModal')).toBeVisible();

    await page.click('#confirmDeleteBtn');
    await expect(page.locator('#taskList li')).toHaveCount(2);
    await expect(page.locator('#taskList li').nth(0)).toContainText('Keep');
    await expect(page.locator('#taskList li').nth(1)).toContainText('Keep too');
  });

  test('cancels delete from confirmation popup', async ({ page }) => {
    await page.fill('#taskInput', 'Task to keep');
    await page.click('#addBtn');
    await expect(page.locator('#taskList li')).toHaveCount(1);

    await page.click('.delete-btn');
    await expect(page.locator('#confirmModal')).toBeVisible();

    await page.click('#cancelDeleteBtn');
    await expect(page.locator('#confirmModal')).not.toBeVisible();
    await expect(page.locator('#taskList li')).toHaveCount(1);
    await expect(page.locator('#taskList li').first()).toContainText('Task to keep');
  });

  test('cancel delete preserves all tasks', async ({ page }) => {
    await page.fill('#taskInput', 'Task A');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task B');
    await page.click('#addBtn');

    await page.locator('#taskList li', { hasText: 'Task A' }).locator('.delete-btn').click();
    await expect(page.locator('#confirmModal')).toBeVisible();

    await page.click('#cancelDeleteBtn');
    await expect(page.locator('#taskList li')).toHaveCount(2);
    await expect(page.locator('#taskList li').nth(0)).toContainText('Task A');
    await expect(page.locator('#taskList li').nth(1)).toContainText('Task B');
  });

  test('confirm modal is hidden by default', async ({ page }) => {
    await expect(page.locator('#confirmModal')).not.toBeVisible();
  });

  test('persists tasks in localStorage', async ({ page }) => {
    await page.fill('#taskInput', 'Persistent task');
    await page.click('#addBtn');

    await page.reload();
    await expect(page.locator('#taskList li')).toHaveCount(1);
    await expect(page.locator('#taskList li').first()).toContainText('Persistent task');
  });

  test('each task has a delete button', async ({ page }) => {
    await page.fill('#taskInput', 'Task A');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task B');
    await page.click('#addBtn');

    const deleteButtons = page.locator('.delete-btn');
    await expect(deleteButtons).toHaveCount(2);
  });

  test('each task has an edit button', async ({ page }) => {
    await page.fill('#taskInput', 'Task A');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task B');
    await page.click('#addBtn');

    const editButtons = page.locator('.edit-btn');
    await expect(editButtons).toHaveCount(2);
  });

  test('edit modal is hidden by default', async ({ page }) => {
    await expect(page.locator('#editModal')).not.toBeVisible();
  });

  test('edit button opens edit modal with task data', async ({ page }) => {
    await page.fill('#taskInput', 'Original task');
    await page.fill('#startDate', '2026-07-01');
    await page.selectOption('#taskStatus', 'in-progress');
    await page.click('#addBtn');

    await page.locator('.edit-btn').first().click();

    await expect(page.locator('#editModal')).toBeVisible();
    await expect(page.locator('#editTitle')).toHaveValue('Original task');
    await expect(page.locator('#editStartDate')).toHaveValue('2026-07-01');
    await expect(page.locator('#editStatus')).toHaveValue('in-progress');
  });

  test('saves edited task title via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');

    await page.locator('.edit-btn').first().click();
    await page.fill('#editTitle', 'Buy organic groceries');
    await page.click('#saveEditBtn');

    await expect(page.locator('.task-title').first()).toHaveText('Buy organic groceries');
    await expect(page.locator('#editModal')).not.toBeVisible();
  });

  test('saves edited task status via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Task status');
    await page.click('#addBtn');

    await page.locator('.edit-btn').first().click();
    await page.selectOption('#editStatus', 'completed');
    await page.click('#saveEditBtn');

    await expect(page.locator('.task-status').first()).toHaveText('Status: completed');
    await expect(page.locator('.status-completed')).toHaveCount(1);
  });

  test('saves edited task start date via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Dated task');
    await page.click('#addBtn');

    await page.locator('.edit-btn').first().click();
    await page.fill('#editStartDate', '2026-08-01');
    await page.click('#saveEditBtn');

    await expect(page.locator('.task-date').first()).toContainText('Start: 2026-08-01');
  });

  test('cancel closes edit modal without changes', async ({ page }) => {
    await page.fill('#taskInput', 'Original');
    await page.click('#addBtn');

    await page.locator('.edit-btn').first().click();
    await page.fill('#editTitle', 'Changed');
    await page.click('#cancelEditBtn');

    await expect(page.locator('.task-title').first()).toHaveText('Original');
    await expect(page.locator('#editModal')).not.toBeVisible();
  });

  test('edit preserves other tasks via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Task A');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task B');
    await page.click('#addBtn');

    await page.locator('.edit-btn').first().click();
    await page.fill('#editTitle', 'Task A edited');
    await page.click('#saveEditBtn');

    await expect(page.locator('#taskList li')).toHaveCount(2);
    await expect(page.locator('.task-title').first()).toHaveText('Task A edited');
    await expect(page.locator('.task-title').nth(1)).toHaveText('Task B');
  });

  test('edit persists to localStorage via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Persistent');
    await page.click('#addBtn');

    await page.locator('.edit-btn').first().click();
    await page.fill('#editTitle', 'Persistent edited');
    await page.click('#saveEditBtn');

    await page.reload();
    await expect(page.locator('.task-title').first()).toHaveText('Persistent edited');
  });

  test('new task has default pending status', async ({ page }) => {
    await page.fill('#taskInput', 'Default status task');
    await page.click('#addBtn');

    await expect(page.locator('.task-status')).toHaveCount(1);
    await expect(page.locator('.task-status').first()).toHaveText('Status: pending');
    await expect(page.locator('.status-pending')).toHaveCount(1);
  });

  test('adds task with custom status', async ({ page }) => {
    await page.fill('#taskInput', 'In progress task');
    await page.selectOption('#taskStatus', 'in-progress');
    await page.click('#addBtn');

    await expect(page.locator('.task-status').first()).toHaveText('Status: in-progress');
    await expect(page.locator('.status-in-progress')).toHaveCount(1);
  });

  test('adds task with completed status', async ({ page }) => {
    await page.fill('#taskInput', 'Done task');
    await page.selectOption('#taskStatus', 'completed');
    await page.click('#addBtn');

    await expect(page.locator('.task-status').first()).toHaveText('Status: completed');
    await expect(page.locator('.status-completed')).toHaveCount(1);
  });

  test('adds task with start date', async ({ page }) => {
    await page.fill('#taskInput', 'Dated task');
    await page.fill('#startDate', '2026-07-01');
    await page.click('#addBtn');

    await expect(page.locator('.task-date')).toHaveCount(1);
    await expect(page.locator('.task-date').first()).toContainText('Start: 2026-07-01');
  });

  test('adds task with all fields', async ({ page }) => {
    await page.fill('#taskInput', 'Full task');
    await page.fill('#startDate', '2026-08-01');
    await page.selectOption('#taskStatus', 'in-progress');
    await page.click('#addBtn');

    await expect(page.locator('#taskList li')).toHaveCount(1);
    await expect(page.locator('.task-title').first()).toHaveText('Full task');
    await expect(page.locator('.task-date').first()).toContainText('Start: 2026-08-01');
    await expect(page.locator('.task-status').first()).toHaveText('Status: in-progress');
  });

  test('clears all inputs after adding task', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#taskInput', 'Clear test');
    await page.fill('#startDate', '2026-07-01');
    await page.selectOption('#taskStatus', 'completed');
    await page.click('#addBtn');

    await expect(page.locator('#taskInput')).toHaveValue('');
    await expect(page.locator('#startDate')).toHaveValue(today);
    await expect(page.locator('#taskStatus')).toHaveValue('pending');
  });

  test('date input defaults to today on page load', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await expect(page.locator('#startDate')).toHaveValue(today);
  });

  test('adds a task with default today date', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#taskInput', 'Task with today');
    await page.click('#addBtn');

    await expect(page.locator('#taskList li')).toHaveCount(1);
    await expect(page.locator('.task-date').first()).toContainText(`Start: ${today}`);
  });

  test('date input resets to today after adding task', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#taskInput', 'Test task');
    await page.fill('#startDate', '2026-01-01');
    await page.click('#addBtn');

    await expect(page.locator('#startDate')).toHaveValue(today);
  });
});
