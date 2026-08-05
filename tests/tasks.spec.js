const { test, expect } = require('@playwright/test');
const { clearTasks, seedTasks, getStoredTasks, createTask } = require('./helpers');

test.beforeEach(async ({ page }) => {
  await clearTasks(page);
});

const SEED_TASKS = [
  { id: 'seed-1', title: 'Buy groceries', description: 'Milk, eggs, bread', createdAt: '2026-07-31T10:00:00.000Z' },
  { id: 'seed-2', title: 'Write specs', description: '', createdAt: '2026-07-31T11:00:00.000Z' },
];

test.describe('Create a new task', () => {
  test('creates a task and shows it in the list', async ({ page }) => {
    await page.goto('/');

    await createTask(page, { title: 'Buy groceries', description: 'Milk, eggs, bread' });

    await expect(page.locator('#flash')).toHaveText('Task created successfully');
    await expect(page.locator('#flash')).toBeVisible();
    await expect(page.locator('#page-board')).toBeVisible();
    await expect(page.locator('.task-card').filter({ hasText: 'Buy groceries' })).toBeVisible();
  });

  test('persists the created task via the API', async ({ page }) => {
    await page.goto('/');

    await createTask(page, { title: 'Buy groceries', description: 'Milk, eggs, bread' });

    const stored = await getStoredTasks(page);
    expect(stored).toHaveLength(1);
    expect(stored[0].title).toBe('Buy groceries');
    expect(stored[0].description).toBe('Milk, eggs, bread');
    expect(stored[0].id).toBeTruthy();
    expect(stored[0].createdAt).toBeTruthy();
  });

  test('trims surrounding whitespace from title and description', async ({ page }) => {
    await page.goto('/');

    await createTask(page, { title: '  Buy groceries  ', description: '  Milk, eggs, bread  ' });

    await expect.poll(() => getStoredTasks(page)).toHaveLength(1);
    const stored = await getStoredTasks(page);
    expect(stored[0].title).toBe('Buy groceries');
    expect(stored[0].description).toBe('Milk, eggs, bread');
    await expect(page.locator('.task-card').filter({ hasText: 'Buy groceries' })).toBeVisible();
  });

  test('does not create a task when the title is empty', async ({ page }) => {
    await page.goto('/');

    await page.click('#submit-btn');

    await expect(page.locator('#flash')).toHaveClass(/hidden/);
    await expect(page.locator('#page-create')).toBeVisible();
    await expect.poll(() => getStoredTasks(page)).toHaveLength(0);
  });

  test('escapes HTML in title and description', async ({ page }) => {
    const title = '<img src=x onerror=alert(1)>';
    const description = '<script>alert("xss")</script>';

    await page.goto('/');
    await createTask(page, { title, description });

    const card = page.locator('.task-card').filter({ hasText: 'alert' });
    await expect(card).toBeVisible();
    await expect(card.locator('h3')).toHaveText(title);
    await expect(card.locator('.task-desc')).toHaveText(description);
    await expect(card.locator('img')).toHaveCount(0);
    await expect(card.locator('script')).toHaveCount(0);
  });

  test('shows a flash message that auto-hides', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');

    await createTask(page, { title: 'Buy groceries' });

    await expect(page.locator('#flash')).toHaveText('Task created successfully');
    await expect(page.locator('#flash')).toBeVisible();

    await page.clock.fastForward(3500);
    await expect(page.locator('#flash')).toBeHidden();
  });

  test('keeps the created task after a page reload', async ({ page }) => {
    await page.goto('/');

    await createTask(page, { title: 'Persisted task' });
    await page.reload();

    await expect(page.locator('.task-card').filter({ hasText: 'Persisted task' })).toBeVisible();
  });
});

test.describe('List all tasks', () => {
  test('shows existing tasks with their titles', async ({ page }) => {
    await seedTasks(page, SEED_TASKS);
    await page.goto('/');

    await expect(page.locator('.task-card')).toHaveCount(2);
    for (const task of SEED_TASKS) {
      await expect(page.locator('.task-card').filter({ hasText: task.title })).toBeVisible();
    }
  });

  test('shows the empty state when there are no tasks', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.task-card')).toHaveCount(0);
    await expect(page.locator('.column-body .empty-state')).toHaveCount(3);
  });

  test('renders task descriptions and creation dates', async ({ page }) => {
    await seedTasks(page, SEED_TASKS);
    await page.goto('/');

    const expectedDate = await page.evaluate(
      () => new Date('2026-07-31T10:00:00.000Z').toLocaleDateString()
    );
    const card = page.locator('.task-card').filter({ hasText: 'Buy groceries' });
    await expect(card.locator('.task-desc')).toHaveText('Milk, eggs, bread');
    await expect(card.locator('.task-date')).toHaveText(expectedDate);
  });

  test('omits the description when it is empty', async ({ page }) => {
    await seedTasks(page, SEED_TASKS);
    await page.goto('/');

    const card = page.locator('.task-card').filter({ hasText: 'Write specs' });
    await expect(card.locator('.task-desc')).toHaveCount(0);
  });

  test('assigns a creation date to tasks created without one', async ({ page }) => {
    await seedTasks(page, [
      { id: 'broken-1', title: 'No date task', description: '' },
      { id: 'ok-1', title: 'With date task', description: '', createdAt: '2026-07-31T10:00:00.000Z' },
    ]);
    await page.goto('/');

    await expect(page.locator('.task-card')).toHaveCount(2);
    await expect(page.locator('.task-card').filter({ hasText: 'No date task' })).toBeVisible();
    await expect(page.locator('.task-card').filter({ hasText: 'With date task' })).toBeVisible();
    const noDate = page.locator('.task-card').filter({ hasText: 'No date task' });
    await expect(noDate.locator('.task-date')).toBeVisible();
    const stored = await getStoredTasks(page);
    const created = stored.find(t => t.title === 'No date task');
    expect(created.createdAt).toBeTruthy();
  });
});

test.describe('Layout', () => {
  test('shows the create form and task list on the same screen', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#page-create')).toBeVisible();
    await expect(page.locator('#page-board')).toBeVisible();

    await seedTasks(page, SEED_TASKS);
    await page.reload();

    await expect(page.locator('#page-create')).toBeVisible();
    await expect(page.locator('#page-board')).toBeVisible();
    await expect(page.locator('.task-card')).toHaveCount(2);
  });
});
