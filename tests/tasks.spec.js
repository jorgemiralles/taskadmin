const { test, expect } = require('@playwright/test');

const SEED_TASKS = [
  { id: 'seed-1', title: 'Buy groceries', description: 'Milk, eggs, bread', createdAt: '2026-07-31T10:00:00.000Z' },
  { id: 'seed-2', title: 'Write specs', description: '', createdAt: '2026-07-31T11:00:00.000Z' },
];

async function seedTasks(page, tasks = SEED_TASKS) {
  await page.addInitScript((tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, tasks);
}

function getStoredTasks(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('tasks') || '[]'));
}

async function createTask(page, { title, description = '' }) {
  await page.fill('#task-title', title);
  await page.fill('#task-desc', description);
  await page.click('#submit-btn');
}

test.describe('Create a new task', () => {
  test('creates a task and shows it in the list', async ({ page }) => {
    await page.goto('/');

    await createTask(page, { title: 'Buy groceries', description: 'Milk, eggs, bread' });

    await expect(page.locator('#flash')).toHaveText('Task created successfully');
    await expect(page.locator('#flash')).toBeVisible();
    await expect(page.locator('#page-list')).toBeVisible();
    await expect(page.locator('.task-card').filter({ hasText: 'Buy groceries' })).toBeVisible();
  });

  test('persists the created task to localStorage', async ({ page }) => {
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
    await page.click('#nav-list');

    await expect(page.locator('.task-card').filter({ hasText: 'Persisted task' })).toBeVisible();
  });
});

test.describe('List all tasks', () => {
  test('shows existing tasks with their titles', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');
    await page.click('#nav-list');

    await expect(page.locator('.task-card')).toHaveCount(2);
    for (const task of SEED_TASKS) {
      await expect(page.locator('.task-card').filter({ hasText: task.title })).toBeVisible();
    }
  });

  test('shows the empty state when there are no tasks', async ({ page }) => {
    await page.goto('/');
    await page.click('#nav-list');

    await expect(page.locator('.task-card')).toHaveCount(0);
    await expect(page.locator('.empty-state')).toHaveText('No tasks yet');
  });

  test('renders task descriptions and creation dates', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');
    await page.click('#nav-list');

    const expectedDate = await page.evaluate(
      () => new Date('2026-07-31T10:00:00.000Z').toLocaleDateString()
    );
    const card = page.locator('.task-card').filter({ hasText: 'Buy groceries' });
    await expect(card.locator('.task-desc')).toHaveText('Milk, eggs, bread');
    await expect(card.locator('.task-date')).toHaveText(expectedDate);
  });

  test('omits the description when it is empty', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');
    await page.click('#nav-list');

    const card = page.locator('.task-card').filter({ hasText: 'Write specs' });
    await expect(card.locator('.task-desc')).toHaveCount(0);
  });
});

test.describe('Navigation', () => {
  test('toggles between create and list views', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#page-create')).toBeVisible();
    await expect(page.locator('#page-list')).toBeHidden();

    await page.click('#nav-list');
    await expect(page.locator('#page-list')).toBeVisible();
    await expect(page.locator('#page-create')).toBeHidden();

    await page.click('#nav-create');
    await expect(page.locator('#page-create')).toBeVisible();
    await expect(page.locator('#page-list')).toBeHidden();
  });
});
