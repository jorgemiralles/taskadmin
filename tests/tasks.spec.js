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

  test('deletes a task', async ({ page }) => {
    await page.fill('#taskInput', 'Task to delete');
    await page.click('#addBtn');
    await expect(page.locator('#taskList li')).toHaveCount(1);

    await page.click('.delete-btn');
    await expect(page.locator('#taskList li')).toHaveCount(0);
  });

  test('deletes correct task from multiple', async ({ page }) => {
    await page.fill('#taskInput', 'Keep');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Remove');
    await page.click('#addBtn');

    await page.fill('#taskInput', 'Keep too');
    await page.click('#addBtn');

    await expect(page.locator('#taskList li')).toHaveCount(3);

    await page.locator('#taskList li', { hasText: 'Remove' }).locator('.delete-btn').click();
    await expect(page.locator('#taskList li')).toHaveCount(2);
    await expect(page.locator('#taskList li').nth(0)).toContainText('Keep');
    await expect(page.locator('#taskList li').nth(1)).toContainText('Keep too');
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
});
