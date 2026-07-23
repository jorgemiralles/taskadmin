const { test, expect, request } = require('@playwright/test');

const API_URL = 'http://127.0.0.1:3000/api/tasks';

async function clearDatabase() {
  const apiRequest = await request.newContext();
  const res = await apiRequest.get(API_URL);
  const tasks = await res.json();
  for (const task of tasks) {
    await apiRequest.delete(`${API_URL}/${task.id}`);
  }
  await apiRequest.dispose();
}

test.describe('View Task Details', () => {
  test.beforeEach(async ({ page }) => {
    await clearDatabase();
    await page.goto('/');
    await page.waitForSelector('#pendingColumn');
  });

  test('task details modal is hidden by default', async ({ page }) => {
    await expect(page.locator('#taskDetailsModal')).not.toBeVisible();
  });

  test('clicking task title opens details modal', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .task-title').first().click();
    await expect(page.locator('#taskDetailsModal')).toBeVisible();
  });

  test('details modal displays task title', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .task-title').first().click();
    await expect(page.locator('#detailsTitle')).toHaveText('Buy groceries');
  });

  test('details modal displays correct status badge for pending task', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .task-title').first().click();
    await expect(page.locator('#detailsStatus')).toContainText('To-do');
    await expect(page.locator('#detailsStatus .badge-todo')).toBeVisible();
  });

  test('details modal displays correct status badge for in-progress task', async ({ page }) => {
    await page.fill('#taskInput', 'Active task');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.selectOption('#editStatus', 'in-progress');
    await page.click('#saveEditBtn');
    await expect(page.locator('#inProgressColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#inProgressColumn .task-title').first().click();
    await expect(page.locator('#detailsStatus')).toContainText('In Progress');
    await expect(page.locator('#detailsStatus .badge-progress')).toBeVisible();
  });

  test('details modal displays correct status badge for completed task', async ({ page }) => {
    await page.fill('#taskInput', 'Done task');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .btn-task-edit').first().click();
    await page.selectOption('#editStatus', 'completed');
    await page.click('#saveEditBtn');
    await expect(page.locator('#completedColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#completedColumn .task-title').first().click();
    await expect(page.locator('#detailsStatus')).toContainText('Done');
    await expect(page.locator('#detailsStatus .badge-done')).toBeVisible();
  });

  test('details modal displays start date', async ({ page }) => {
    await page.fill('#taskInput', 'Project report');
    await page.fill('#startDate', '2026-07-15');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .task-title').first().click();
    await expect(page.locator('#detailsStartDate')).toContainText('15 Jul, 2026');
  });

  test('close button closes details modal', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .task-title').first().click();
    await expect(page.locator('#taskDetailsModal')).toBeVisible();

    await page.click('#closeDetailsBtn');
    await expect(page.locator('#taskDetailsModal')).not.toBeVisible();
  });

  test('edit button opens edit modal from details', async ({ page }) => {
    await page.fill('#taskInput', 'Buy groceries');
    await page.click('#addBtn');
    await expect(page.locator('#pendingColumn li')).toHaveCount(1, { timeout: 5000 });

    await page.locator('#pendingColumn .task-title').first().click();
    await expect(page.locator('#taskDetailsModal')).toBeVisible();

    await page.click('#editFromDetailsBtn');
    await expect(page.locator('#taskDetailsModal')).not.toBeVisible();
    await expect(page.locator('#editModal')).toBeVisible();
    await expect(page.locator('#editTitle')).toHaveValue('Buy groceries');
  });
});
