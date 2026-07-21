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

  test('starts with empty columns', async ({ page }) => {
    await expect(page.locator('#pendingColumn li')).toHaveCount(0);
    await expect(page.locator('#inProgressColumn li')).toHaveCount(0);
    await expect(page.locator('#completedColumn li')).toHaveCount(0);
  });

  test('displays three kanban columns', async ({ page }) => {
    await expect(page.locator('#pendingColumn')).toBeVisible();
    await expect(page.locator('#inProgressColumn')).toBeVisible();
    await expect(page.locator('#completedColumn')).toBeVisible();
    await expect(page.locator('.status-pending-header')).toHaveText('Pending');
    await expect(page.locator('.status-in-progress-header')).toHaveText('In Progress');
    await expect(page.locator('.status-completed-header')).toHaveText('Completed');
  });

  test('displays input and add button', async ({ page }) => {
    await expect(page.locator('#taskInput')).toBeVisible();
    await expect(page.locator('#addBtn')).toBeVisible();
    await expect(page.locator('#startDate')).toBeVisible();
  });

  test('adds a task via button click', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('Buy groceries');
    await expect(page.locator('#taskInput')).toHaveValue('');
  });

  test('adds a task via Enter key', async ({ page }) => {
    await page.fill('#taskInput', 'Walk the dog');
    await page.press('#taskInput', 'Enter');

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('Walk the dog');
  });

  test('does not add empty task', async ({ page }) => {
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(0);

    await page.fill('#taskInput', '   ');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(0);
  });

  test('renders task titles as text, not HTML', async ({ page }) => {
    await page.fill('#taskInput', '<script>alert("xss")</script>');
    await page.click('#addBtn');

    const taskText = await page.locator('#pendingColumn li').first().innerText();
    expect(taskText).toContain('<script>alert("xss")</script>');

    let dialog = false;
    page.on('dialog', () => { dialog = true; });
    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    expect(dialog).toBe(false);
  });

  test('adds multiple tasks to pending column', async ({ page }) => {
    await page.fill('#taskInput', 'Task 1');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task 2');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task 3');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(3);
    await expect(page.locator('#pendingColumn li').nth(0)).toContainText('Task 1');
    await expect(page.locator('#pendingColumn li').nth(1)).toContainText('Task 2');
    await expect(page.locator('#pendingColumn li').nth(2)).toContainText('Task 3');
  });

  test('deletes a task after confirmation', async ({ page }) => {
    await page.fill('#taskInput', 'Task to delete');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1);

    await page.locator('#pendingColumn .btn-task-delete').first().click();
    await expect(page.locator('#confirmModal')).toBeVisible();
    await expect(page.locator('.modal-body p')).toHaveText('Are you sure you want to delete this task?');

    await page.click('#confirmDeleteBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(0);
    await expect(page.locator('#confirmModal')).not.toBeVisible();
  });

  test('deletes correct task from multiple after confirmation', async ({ page }) => {
    await page.fill('#taskInput', 'Keep');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Remove');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Keep too');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(3);

    await page.locator('#pendingColumn li', { hasText: 'Remove' }).locator('.btn-task-delete').click();
    await expect(page.locator('#confirmModal')).toBeVisible();

    await page.click('#confirmDeleteBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(2);
    await expect(page.locator('#pendingColumn li').nth(0)).toContainText('Keep');
    await expect(page.locator('#pendingColumn li').nth(1)).toContainText('Keep too');
  });

  test('cancels delete from confirmation popup', async ({ page }) => {
    await page.fill('#taskInput', 'Task to keep');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1);

    await page.locator('#pendingColumn .btn-task-delete').first().click();
    await expect(page.locator('#confirmModal')).toBeVisible();

    await page.click('#cancelDeleteBtn');
    await expect(page.locator('#confirmModal')).not.toBeVisible();
    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('Task to keep');
  });

  test('confirm modal is hidden by default', async ({ page }) => {
    await expect(page.locator('#confirmModal')).not.toBeVisible();
  });

  test('persists tasks in localStorage', async ({ page }) => {
    await page.fill('#taskInput', 'Persistent task');
    await page.click('#addBtn');

    await page.reload();
    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('Persistent task');
  });

  test('each task has a delete button', async ({ page }) => {
    await page.fill('#taskInput', 'Task A');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task B');
    await page.click('#addBtn');

    const deleteButtons = page.locator('.btn-task-delete');
    await expect(deleteButtons).toHaveCount(2);
  });

  test('each task has an edit button', async ({ page }) => {
    await page.fill('#taskInput', 'Task A');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task B');
    await page.click('#addBtn');

    const editButtons = page.locator('.btn-task-edit');
    await expect(editButtons).toHaveCount(2);
  });

  test('edit modal is hidden by default', async ({ page }) => {
    await expect(page.locator('#editModal')).not.toBeVisible();
  });

  test('edit button opens edit modal with task data', async ({ page }) => {
    await page.fill('#taskInput', 'Original task');
    await page.fill('#startDate', '2026-07-01');
    await page.click('#addBtn');

    await page.locator('#pendingColumn .btn-task-edit').first().click();

    await expect(page.locator('#editModal')).toBeVisible();
    await expect(page.locator('#editTitle')).toHaveValue('Original task');
    await expect(page.locator('#editStartDate')).toHaveValue('2026-07-01');
    await expect(page.locator('#editStatus')).toHaveValue('pending');
  });

  test('saves edited task title via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.fill('#editTitle', 'Buy organic groceries');
    await page.click('#saveEditBtn');

    await expect(page.locator('.task-title').first()).toHaveText('Buy organic groceries');
    await expect(page.locator('#editModal')).not.toBeVisible();
  });

  test('saves edited task status via popup moves to correct column', async ({ page }) => {
    await page.fill('#taskInput', 'Task status');
    await page.click('#addBtn');

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.selectOption('#editStatus', 'completed');
    await page.click('#saveEditBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(0);
    await expect(page.locator('#completedColumn li')).toHaveCount(1);
    await expect(page.locator('#completedColumn li').first()).toContainText('Task status');
  });

  test('saves edited task start date via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Dated task');
    await page.click('#addBtn');

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.fill('#editStartDate', '2026-08-01');
    await page.click('#saveEditBtn');

    await expect(page.locator('.task-date').first()).toContainText('1 Aug, 2026');
  });

  test('cancel closes edit modal without changes', async ({ page }) => {
    await page.fill('#taskInput', 'Original');
    await page.click('#addBtn');

    await page.locator('#pendingColumn .btn-task-edit').first().click();
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

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.fill('#editTitle', 'Task A edited');
    await page.click('#saveEditBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(2);
    await expect(page.locator('.task-title').first()).toHaveText('Task A edited');
    await expect(page.locator('.task-title').nth(1)).toHaveText('Task B');
  });

  test('edit persists to localStorage via popup', async ({ page }) => {
    await page.fill('#taskInput', 'Persistent');
    await page.click('#addBtn');

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.fill('#editTitle', 'Persistent edited');
    await page.click('#saveEditBtn');

    await page.reload();
    await expect(page.locator('.task-title').first()).toHaveText('Persistent edited');
  });

  test('new task has default pending status', async ({ page }) => {
    await page.fill('#taskInput', 'Default status task');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#inProgressColumn li')).toHaveCount(0);
    await expect(page.locator('#completedColumn li')).toHaveCount(0);
  });

  test('adds task with start date', async ({ page }) => {
    await page.fill('#taskInput', 'Dated task');
    await page.fill('#startDate', '2026-07-01');
    await page.click('#addBtn');

    await expect(page.locator('.task-date')).toHaveCount(1);
    await expect(page.locator('.task-date').first()).toContainText('1 Jul, 2026');
  });

  test('adds task with all fields', async ({ page }) => {
    await page.fill('#taskInput', 'Full task');
    await page.fill('#startDate', '2026-08-01');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('.task-title').first()).toHaveText('Full task');
    await expect(page.locator('.task-date').first()).toContainText('1 Aug, 2026');
  });

  test('clears all inputs after adding task', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#taskInput', 'Clear test');
    await page.fill('#startDate', '2026-07-01');
    await page.click('#addBtn');

    await expect(page.locator('#taskInput')).toHaveValue('');
    await expect(page.locator('#startDate')).toHaveValue(today);
  });

  test('date input defaults to today on page load', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await expect(page.locator('#startDate')).toHaveValue(today);
  });

  test('adds a task with default today date', async ({ page }) => {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const expected = `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
    await page.fill('#taskInput', 'Task with today');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('.task-date').first()).toContainText(expected);
  });

  test('date input resets to today after adding task', async ({ page }) => {
    const today = new Date().toISOString().split('T')[0];
    await page.fill('#taskInput', 'Test task');
    await page.fill('#startDate', '2026-01-01');
    await page.click('#addBtn');

    await expect(page.locator('#startDate')).toHaveValue(today);
  });
});

test.describe('Kanban Board Columns', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  async function drag(page, sourceLocator, targetLocator, targetPosition) {
    await sourceLocator.scrollIntoViewIfNeeded();
    await targetLocator.scrollIntoViewIfNeeded();
    const sourceBox = await sourceLocator.boundingBox();
    const targetBox = await targetLocator.boundingBox();
    if (!sourceBox || !targetBox) throw new Error('Element not visible');
    const sx = sourceBox.x + sourceBox.width / 2;
    const sy = sourceBox.y + sourceBox.height / 2;
    const tx = targetBox.x + (targetPosition?.x ?? targetBox.width / 2);
    const ty = targetBox.y + (targetPosition?.y ?? targetBox.height / 2);
    await page.mouse.move(sx, sy);
    await page.mouse.down();
    await page.mouse.move(tx, ty, { steps: 20 });
    await page.mouse.up();
    await page.waitForTimeout(200);
  }

  test('three columns are displayed', async ({ page }) => {
    await expect(page.locator('.status-pending-header')).toHaveText('Pending');
    await expect(page.locator('.status-in-progress-header')).toHaveText('In Progress');
    await expect(page.locator('.status-completed-header')).toHaveText('Completed');
  });

  test('new tasks start in pending column', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('Buy groceries');
    await expect(page.locator('#inProgressColumn li')).toHaveCount(0);
    await expect(page.locator('#completedColumn li')).toHaveCount(0);
  });

  test('multiple new tasks appear in pending column', async ({ page }) => {
    await page.fill('#taskInput', 'Task 1');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Task 2');
    await page.click('#addBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(2);
    await expect(page.locator('#pendingColumn li').nth(0)).toContainText('Task 1');
    await expect(page.locator('#pendingColumn li').nth(1)).toContainText('Task 2');
  });

  test('drag task from pending to in progress', async ({ page }) => {
    await page.fill('#taskInput', 'My task');
    await page.click('#addBtn');

    const task = page.locator('#pendingColumn li').first();
    const targetColumn = page.locator('#inProgressColumn');

    await drag(page, task, targetColumn);

    await expect(page.locator('#pendingColumn li')).toHaveCount(0);
    await expect(page.locator('#inProgressColumn li')).toHaveCount(1);
    await expect(page.locator('#inProgressColumn li').first()).toContainText('My task');
  });

  test('drag task from in progress to completed', async ({ page }) => {
    await page.fill('#taskInput', 'My task');
    await page.click('#addBtn');

    const task = page.locator('#pendingColumn li').first();
    const targetColumn = page.locator('#inProgressColumn');
    await drag(page, task, targetColumn);

    const taskInProgress = page.locator('#inProgressColumn li').first();
    const completedColumn = page.locator('#completedColumn');
    await drag(page, taskInProgress, completedColumn);

    await expect(page.locator('#inProgressColumn li')).toHaveCount(0);
    await expect(page.locator('#completedColumn li')).toHaveCount(1);
    await expect(page.locator('#completedColumn li').first()).toContainText('My task');
  });

  test('drag task from completed back to pending', async ({ page }) => {
    await page.fill('#taskInput', 'My task');
    await page.click('#addBtn');

    await drag(page, page.locator('#pendingColumn li').first(), page.locator('#completedColumn'));

    await drag(page, page.locator('#completedColumn li').first(), page.locator('#pendingColumn'));

    await expect(page.locator('#completedColumn li')).toHaveCount(0);
    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('My task');
  });

  test('drag task from pending to completed directly', async ({ page }) => {
    await page.fill('#taskInput', 'Fast track task');
    await page.click('#addBtn');

    await drag(page, page.locator('#pendingColumn li').first(), page.locator('#completedColumn'));

    await expect(page.locator('#pendingColumn li')).toHaveCount(0);
    await expect(page.locator('#completedColumn li')).toHaveCount(1);
    await expect(page.locator('#completedColumn li').first()).toContainText('Fast track task');
  });

  test('task status persists after drag', async ({ page }) => {
    await page.fill('#taskInput', 'Persistent task');
    await page.click('#addBtn');

    await drag(page, page.locator('#pendingColumn li').first(), page.locator('#inProgressColumn'));
    await expect(page.locator('#inProgressColumn li')).toHaveCount(1);

    await page.reload();
    await expect(page.locator('#inProgressColumn li')).toHaveCount(1);
    await expect(page.locator('#inProgressColumn li').first()).toContainText('Persistent task');
    await expect(page.locator('#pendingColumn li')).toHaveCount(0);
  });

  test('multiple tasks can exist in different columns', async ({ page }) => {
    await page.fill('#taskInput', 'Pending task');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Active task');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Done task');
    await page.click('#addBtn');

    await drag(page, page.locator('#pendingColumn li', { hasText: 'Active task' }), page.locator('#inProgressColumn'));
    await drag(page, page.locator('#pendingColumn li', { hasText: 'Done task' }), page.locator('#completedColumn'));

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('Pending task');
    await expect(page.locator('#inProgressColumn li')).toHaveCount(1);
    await expect(page.locator('#inProgressColumn li').first()).toContainText('Active task');
    await expect(page.locator('#completedColumn li')).toHaveCount(1);
    await expect(page.locator('#completedColumn li').first()).toContainText('Done task');
  });

  test('delete task from a column', async ({ page }) => {
    await page.fill('#taskInput', 'Task to delete');
    await page.click('#addBtn');

    await drag(page, page.locator('#pendingColumn li').first(), page.locator('#inProgressColumn'));

    await page.locator('#inProgressColumn .btn-task-delete').first().click();
    await page.click('#confirmDeleteBtn');

    await expect(page.locator('#inProgressColumn li')).toHaveCount(0);
  });

  test('edit task from a column', async ({ page }) => {
    await page.fill('#taskInput', 'Original title');
    await page.click('#addBtn');

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.fill('#editTitle', 'Updated title');
    await page.click('#saveEditBtn');

    await expect(page.locator('#pendingColumn li')).toHaveCount(1);
    await expect(page.locator('#pendingColumn li').first()).toContainText('Updated title');
  });

  test('tasks are draggable', async ({ page }) => {
    await page.fill('#taskInput', 'Draggable task');
    await page.click('#addBtn');

    const task = page.locator('#pendingColumn li').first();
    await expect(task).toHaveAttribute('draggable', 'true');
  });
});
