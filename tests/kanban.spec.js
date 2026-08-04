const { test, expect } = require('@playwright/test');

const SEED_TASKS = [
  { id: 'seed-1', title: 'Buy groceries', description: 'Milk, eggs, bread', createdAt: '2026-07-31T10:00:00.000Z', status: 'prioritize' },
  { id: 'seed-2', title: 'Write specs', description: '', createdAt: '2026-07-31T11:00:00.000Z', status: 'in-progress' },
  { id: 'seed-3', title: 'Release v1', description: '', createdAt: '2026-07-31T12:00:00.000Z', status: 'done' },
];

async function seedTasks(page, tasks = SEED_TASKS) {
  await page.addInitScript((tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, tasks);
}

function getStoredTasks(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('tasks') || '[]'));
}

function column(page, status) {
  return page.locator(`.kanban-column[data-status="${status}"]`);
}

function cardIn(page, status, title) {
  return column(page, status).locator('.task-card').filter({ hasText: title });
}

async function createTask(page, { title, description = '' }) {
  await page.fill('#task-title', title);
  await page.fill('#task-desc', description);
  await page.click('#submit-btn');
}

test.describe('Kanban board layout', () => {
  test('shows three columns Prioritize, In Progress, and Done', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');

    await expect(page.locator('.kanban-column')).toHaveCount(3);
    await expect(column(page, 'prioritize').locator('.column-title')).toHaveText('Prioritize');
    await expect(column(page, 'in-progress').locator('.column-title')).toHaveText('In Progress');
    await expect(column(page, 'done').locator('.column-title')).toHaveText('Done');
  });

  test('each column shows an empty state when it has no tasks', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.column-body .empty-state')).toHaveCount(3);
    for (const status of ['prioritize', 'in-progress', 'done']) {
      await expect(column(page, status).locator('.empty-state')).toHaveText('No tasks yet');
    }
  });

  test('sorts existing tasks into their columns by status', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');

    await expect(cardIn(page, 'prioritize', 'Buy groceries')).toBeVisible();
    await expect(cardIn(page, 'in-progress', 'Write specs')).toBeVisible();
    await expect(cardIn(page, 'done', 'Release v1')).toBeVisible();
  });
});

test.describe('Moving tasks', () => {
  test('newly created tasks land in the Prioritize column', async ({ page }) => {
    await page.goto('/');
    await createTask(page, { title: 'Buy groceries', description: 'Milk, eggs, bread' });

    await expect(cardIn(page, 'prioritize', 'Buy groceries')).toBeVisible();
    await expect(cardIn(page, 'in-progress', 'Buy groceries')).toHaveCount(0);
    await expect(cardIn(page, 'done', 'Buy groceries')).toHaveCount(0);
  });

  test('new tasks are stored with status prioritize', async ({ page }) => {
    await page.goto('/');
    await createTask(page, { title: 'Buy groceries' });

    await expect.poll(() => getStoredTasks(page)).toHaveLength(1);
    const stored = await getStoredTasks(page);
    expect(stored[0].status).toBe('prioritize');
  });

  test('drag a task from Prioritize to In Progress', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');

    await cardIn(page, 'prioritize', 'Buy groceries').dragTo(column(page, 'in-progress'));

    await expect(cardIn(page, 'in-progress', 'Buy groceries')).toBeVisible();
    await expect(cardIn(page, 'prioritize', 'Buy groceries')).toHaveCount(0);
    const stored = await getStoredTasks(page);
    expect(stored.find(t => t.id === 'seed-1').status).toBe('in-progress');
  });

  test('drag a task from In Progress to Done', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');

    await cardIn(page, 'in-progress', 'Write specs').dragTo(column(page, 'done'));

    await expect(cardIn(page, 'done', 'Write specs')).toBeVisible();
    await expect(cardIn(page, 'in-progress', 'Write specs')).toHaveCount(0);
    expect((await getStoredTasks(page)).find(t => t.id === 'seed-2').status).toBe('done');
  });

  test('drag a task back to a previous column', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');

    await cardIn(page, 'in-progress', 'Write specs').dragTo(column(page, 'prioritize'));

    await expect(cardIn(page, 'prioritize', 'Write specs')).toBeVisible();
    expect((await getStoredTasks(page)).find(t => t.id === 'seed-2').status).toBe('prioritize');
  });

  test('drag a task from Prioritize straight to Done', async ({ page }) => {
    await seedTasks(page);
    await page.goto('/');

    await cardIn(page, 'prioritize', 'Buy groceries').dragTo(column(page, 'done'));

    await expect(cardIn(page, 'done', 'Buy groceries')).toBeVisible();
    expect((await getStoredTasks(page)).find(t => t.id === 'seed-1').status).toBe('done');
  });

  test('column position survives a page reload', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((tasks) => localStorage.setItem('tasks', JSON.stringify(tasks)), SEED_TASKS);
    await page.reload();

    await cardIn(page, 'in-progress', 'Write specs').dragTo(column(page, 'done'));
    await page.reload();

    await expect(cardIn(page, 'done', 'Write specs')).toBeVisible();
  });

  test('tasks without a status default to Prioritize', async ({ page }) => {
    await seedTasks(page, [
      { id: 'legacy-1', title: 'Old task', description: '', createdAt: '2026-07-31T10:00:00.000Z' }
    ]);
    await page.goto('/');

    await expect(cardIn(page, 'prioritize', 'Old task')).toBeVisible();
  });
});
