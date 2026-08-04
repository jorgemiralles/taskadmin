const { test, expect } = require('@playwright/test');
const { seedTasks, column, cardIn } = require('./helpers');

const SEED_TASKS = [
  { id: 'seed-1', title: 'Buy groceries', description: 'Milk, eggs, bread', createdAt: '2026-07-31T10:00:00.000Z', status: 'prioritize' },
  { id: 'seed-2', title: 'Write specs', description: '', createdAt: '2026-07-31T11:00:00.000Z', status: 'in-progress' },
  { id: 'seed-3', title: 'Release v1', description: '', createdAt: '2026-07-31T12:00:00.000Z', status: 'done' },
];

test.describe('Figma design header and navigation', () => {
  test('shows a greeting header with Hello and a notification icon', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('.greeting-hello')).toHaveText('Hello!');
    await expect(page.locator('.greeting-name')).toHaveText('Livia Vaccaro');
    await expect(page.locator('#notif-btn')).toBeVisible();
  });

  test('shows a bottom navigation bar with Home, Calendar, Add, Tasks, and Profile', async ({ page }) => {
    await page.goto('/');

    const buttons = page.locator('#bottom-nav .nav-btn');
    await expect(buttons).toHaveCount(5);
    await expect(buttons).toHaveText([
      'Home',
      'Calendar',
      'Add',
      'Tasks',
      'Profile',
    ]);
  });

  test('the Add button focuses the task title input', async ({ page }) => {
    await page.goto('/');

    await page.click('#nav-add');
    await expect(page.locator('#task-title')).toBeFocused();
  });
});

test.describe('Figma design styling', () => {
  test('applies the Lexend Deca typeface', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('body')).toHaveCSS('font-family', /Lexend Deca/);
  });

  test('colors the submit button with the primary brand color', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('#submit-btn')).toHaveCSS('background-color', 'rgb(95, 51, 225)');
  });

  test('labels appear above the create form fields', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('label[for="task-title"]')).toHaveText('Project Name *');
    await expect(page.locator('label[for="task-desc"]')).toHaveText('Description');
  });
});

test.describe('Figma design task cards', () => {
  test('shows a status badge matching each card column', async ({ page }) => {
    await seedTasks(page, SEED_TASKS);
    await page.goto('/');

    await expect(cardIn(page, 'prioritize', 'Buy groceries').locator('.task-badge')).toHaveText('To-do');
    await expect(cardIn(page, 'in-progress', 'Write specs').locator('.task-badge')).toHaveText('In Progress');
    await expect(cardIn(page, 'done', 'Release v1').locator('.task-badge')).toHaveText('Done');
  });

  test('shows a time on the task card', async ({ page }) => {
    await seedTasks(page, SEED_TASKS);
    await page.goto('/');

    const expectedTime = await page.evaluate(
      () => new Date('2026-07-31T10:00:00.000Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
    const card = cardIn(page, 'prioritize', 'Buy groceries');
    await expect(card.locator('.task-time')).toHaveText(expectedTime);
    await expect(card.locator('.task-date')).toBeVisible();
  });

  test('shows the project (description) and title on the card', async ({ page }) => {
    await seedTasks(page, SEED_TASKS);
    await page.goto('/');

    const card = cardIn(page, 'prioritize', 'Buy groceries');
    await expect(card.locator('.task-desc')).toHaveText('Milk, eggs, bread');
    await expect(card.locator('h3')).toHaveText('Buy groceries');
  });
});
