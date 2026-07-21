const { test, expect } = require('@playwright/test');

test.describe('Drag to Reorder Tasks Within Column', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  async function addTask(page, title) {
    await page.fill('#taskInput', title);
    await page.click('#addBtn');
    await page.waitForTimeout(100);
  }

  async function getTaskOrder(page, columnSelector) {
    return page.locator(`${columnSelector} li .task-title`).allTextContents();
  }

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

  test('tasks maintain creation order in pending column', async ({ page }) => {
    await addTask(page, 'First task');
    await addTask(page, 'Second task');
    await addTask(page, 'Third task');

    const order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['First task', 'Second task', 'Third task']);
  });

  test('reorder tasks by dragging third before first in pending column', async ({ page }) => {
    await addTask(page, 'First task');
    await addTask(page, 'Second task');
    await addTask(page, 'Third task');

    const thirdTask = page.locator('#pendingColumn li', { hasText: 'Third task' });
    const firstTask = page.locator('#pendingColumn li', { hasText: 'First task' });

    await drag(page, thirdTask, firstTask, { x: 0, y: 5 });

    const order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Third task', 'First task', 'Second task']);
  });

  test('reorder tasks by dragging first after second in pending column', async ({ page }) => {
    await addTask(page, 'First task');
    await addTask(page, 'Second task');

    const firstTask = page.locator('#pendingColumn li', { hasText: 'First task' });
    const secondTask = page.locator('#pendingColumn li', { hasText: 'Second task' });

    const secondBox = await secondTask.boundingBox();
    await drag(page, firstTask, secondTask, { x: 0, y: secondBox.height - 5 });

    const order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Second task', 'First task']);
  });

  test('reorder persists after page reload', async ({ page }) => {
    await addTask(page, 'Task A');
    await addTask(page, 'Task B');

    const taskB = page.locator('#pendingColumn li', { hasText: 'Task B' });
    const taskA = page.locator('#pendingColumn li', { hasText: 'Task A' });

    await drag(page, taskB, taskA, { x: 0, y: 5 });

    await page.reload();

    const order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Task B', 'Task A']);
  });

  test('reorder tasks in In Progress column', async ({ page }) => {
    await addTask(page, 'Active 1');
    await addTask(page, 'Active 2');

    await drag(page, page.locator('#pendingColumn li', { hasText: 'Active 1' }), page.locator('#inProgressColumn'));
    await drag(page, page.locator('#pendingColumn li', { hasText: 'Active 2' }), page.locator('#inProgressColumn'));

    const orderBefore = await getTaskOrder(page, '#inProgressColumn');
    expect(orderBefore).toEqual(['Active 1', 'Active 2']);

    const active2 = page.locator('#inProgressColumn li', { hasText: 'Active 2' });
    const active1 = page.locator('#inProgressColumn li', { hasText: 'Active 1' });

    await drag(page, active2, active1, { x: 0, y: 5 });

    const orderAfter = await getTaskOrder(page, '#inProgressColumn');
    expect(orderAfter).toEqual(['Active 2', 'Active 1']);
  });

  test('reorder tasks in Completed column', async ({ page }) => {
    await addTask(page, 'Done 1');
    await addTask(page, 'Done 2');

    await drag(page, page.locator('#pendingColumn li', { hasText: 'Done 1' }), page.locator('#completedColumn'));
    await drag(page, page.locator('#pendingColumn li', { hasText: 'Done 2' }), page.locator('#completedColumn'));

    const orderBefore = await getTaskOrder(page, '#completedColumn');
    expect(orderBefore).toEqual(['Done 1', 'Done 2']);

    const done2 = page.locator('#completedColumn li', { hasText: 'Done 2' });
    const done1 = page.locator('#completedColumn li', { hasText: 'Done 1' });

    await drag(page, done2, done1, { x: 0, y: 5 });

    const orderAfter = await getTaskOrder(page, '#completedColumn');
    expect(orderAfter).toEqual(['Done 2', 'Done 1']);
  });

  test('dragging task between columns appends to end of target', async ({ page }) => {
    await addTask(page, 'Pending A');
    await addTask(page, 'Pending B');
    await addTask(page, 'In Progress X');

    await drag(page, page.locator('#pendingColumn li', { hasText: 'In Progress X' }), page.locator('#inProgressColumn'));

    await drag(page, page.locator('#pendingColumn li', { hasText: 'Pending A' }), page.locator('#inProgressColumn'));

    const order = await getTaskOrder(page, '#inProgressColumn');
    expect(order).toEqual(['In Progress X', 'Pending A']);
  });

  test('tasks have draggable attribute', async ({ page }) => {
    await addTask(page, 'Draggable task');

    const task = page.locator('#pendingColumn li').first();
    await expect(task).toHaveAttribute('draggable', 'true');
  });

  test('reorder within column does not change task count', async ({ page }) => {
    await addTask(page, 'Task 1');
    await addTask(page, 'Task 2');
    await addTask(page, 'Task 3');

    const task2 = page.locator('#pendingColumn li', { hasText: 'Task 2' });
    const task1 = page.locator('#pendingColumn li', { hasText: 'Task 1' });

    await drag(page, task2, task1, { x: 0, y: 5 });

    await expect(page.locator('#pendingColumn li')).toHaveCount(3);
  });

  test('multiple reorders maintain correct order', async ({ page }) => {
    await addTask(page, 'Alpha');
    await addTask(page, 'Bravo');
    await addTask(page, 'Charlie');

    let charlie = page.locator('#pendingColumn li[data-task-id="3"]');
    let alpha = page.locator('#pendingColumn li[data-task-id="1"]');
    await drag(page, charlie, alpha, { x: 0, y: 5 });

    let order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Charlie', 'Alpha', 'Bravo']);

    charlie = page.locator('#pendingColumn li[data-task-id="3"]');
    let bravo = page.locator('#pendingColumn li[data-task-id="2"]');
    const bravoBox = await bravo.boundingBox();
    await drag(page, charlie, bravo, { x: 0, y: bravoBox.height - 5 });

    order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  test('delete task after reorder preserves remaining order', async ({ page }) => {
    await addTask(page, 'X-ray');
    await addTask(page, 'Yield');
    await addTask(page, 'Zebra');

    const z = page.locator('#pendingColumn li[data-task-id="3"]');
    const x = page.locator('#pendingColumn li[data-task-id="1"]');
    await drag(page, z, x, { x: 0, y: 5 });

    const orderBefore = await getTaskOrder(page, '#pendingColumn');
    expect(orderBefore).toEqual(['Zebra', 'X-ray', 'Yield']);

    await page.locator('#pendingColumn li[data-task-id="2"]').locator('.btn-task-delete').click();
    await page.click('#confirmDeleteBtn');

    const orderAfter = await getTaskOrder(page, '#pendingColumn');
    expect(orderAfter).toEqual(['Zebra', 'X-ray']);
  });
});
