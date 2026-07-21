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

    await thirdTask.dragTo(firstTask, { targetPosition: { x: 0, y: 5 } });

    const order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Third task', 'First task', 'Second task']);
  });

  test('reorder tasks by dragging first after second in pending column', async ({ page }) => {
    await addTask(page, 'First task');
    await addTask(page, 'Second task');

    const firstTask = page.locator('#pendingColumn li', { hasText: 'First task' });
    const secondTask = page.locator('#pendingColumn li', { hasText: 'Second task' });

    const secondBox = await secondTask.boundingBox();
    await firstTask.dragTo(secondTask, { targetPosition: { x: 0, y: secondBox.height - 5 } });

    const order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Second task', 'First task']);
  });

  test('reorder persists after page reload', async ({ page }) => {
    await addTask(page, 'Task A');
    await addTask(page, 'Task B');

    const taskB = page.locator('#pendingColumn li', { hasText: 'Task B' });
    const taskA = page.locator('#pendingColumn li', { hasText: 'Task A' });

    await taskB.dragTo(taskA, { targetPosition: { x: 0, y: 5 } });

    await page.reload();

    const order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Task B', 'Task A']);
  });

  test('reorder tasks in In Progress column', async ({ page }) => {
    await addTask(page, 'Active 1');
    await addTask(page, 'Active 2');

    await page.locator('#pendingColumn li', { hasText: 'Active 1' }).dragTo(page.locator('#inProgressColumn'));
    await page.locator('#pendingColumn li', { hasText: 'Active 2' }).dragTo(page.locator('#inProgressColumn'));

    const orderBefore = await getTaskOrder(page, '#inProgressColumn');
    expect(orderBefore).toEqual(['Active 1', 'Active 2']);

    const active2 = page.locator('#inProgressColumn li', { hasText: 'Active 2' });
    const active1 = page.locator('#inProgressColumn li', { hasText: 'Active 1' });

    await active2.dragTo(active1, { targetPosition: { x: 0, y: 5 } });

    const orderAfter = await getTaskOrder(page, '#inProgressColumn');
    expect(orderAfter).toEqual(['Active 2', 'Active 1']);
  });

  test('reorder tasks in Completed column', async ({ page }) => {
    await addTask(page, 'Done 1');
    await addTask(page, 'Done 2');

    await page.locator('#pendingColumn li', { hasText: 'Done 1' }).dragTo(page.locator('#completedColumn'));
    await page.locator('#pendingColumn li', { hasText: 'Done 2' }).dragTo(page.locator('#completedColumn'));

    const orderBefore = await getTaskOrder(page, '#completedColumn');
    expect(orderBefore).toEqual(['Done 1', 'Done 2']);

    const done2 = page.locator('#completedColumn li', { hasText: 'Done 2' });
    const done1 = page.locator('#completedColumn li', { hasText: 'Done 1' });

    await done2.dragTo(done1, { targetPosition: { x: 0, y: 5 } });

    const orderAfter = await getTaskOrder(page, '#completedColumn');
    expect(orderAfter).toEqual(['Done 2', 'Done 1']);
  });

  test('dragging task between columns appends to end of target', async ({ page }) => {
    await addTask(page, 'Pending A');
    await addTask(page, 'Pending B');
    await addTask(page, 'In Progress X');

    await page.locator('#pendingColumn li', { hasText: 'In Progress X' }).dragTo(page.locator('#inProgressColumn'));

    await page.locator('#pendingColumn li', { hasText: 'Pending A' }).dragTo(page.locator('#inProgressColumn'));

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

    await task2.dragTo(task1, { targetPosition: { x: 0, y: 5 } });

    await expect(page.locator('#pendingColumn li')).toHaveCount(3);
  });

  test('multiple reorders maintain correct order', async ({ page }) => {
    await addTask(page, 'Alpha');
    await addTask(page, 'Bravo');
    await addTask(page, 'Charlie');

    let charlie = page.locator('#pendingColumn li[data-task-id="3"]');
    let alpha = page.locator('#pendingColumn li[data-task-id="1"]');
    await charlie.dragTo(alpha, { targetPosition: { x: 0, y: 5 } });

    let order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Charlie', 'Alpha', 'Bravo']);

    charlie = page.locator('#pendingColumn li[data-task-id="3"]');
    let bravo = page.locator('#pendingColumn li[data-task-id="2"]');
    const bravoBox = await bravo.boundingBox();
    await charlie.dragTo(bravo, { targetPosition: { x: 0, y: bravoBox.height - 5 } });

    order = await getTaskOrder(page, '#pendingColumn');
    expect(order).toEqual(['Alpha', 'Bravo', 'Charlie']);
  });

  test('delete task after reorder preserves remaining order', async ({ page }) => {
    await addTask(page, 'X-ray');
    await addTask(page, 'Yield');
    await addTask(page, 'Zebra');

    const z = page.locator('#pendingColumn li[data-task-id="3"]');
    const x = page.locator('#pendingColumn li[data-task-id="1"]');
    await z.dragTo(x, { targetPosition: { x: 0, y: 5 } });

    const orderBefore = await getTaskOrder(page, '#pendingColumn');
    expect(orderBefore).toEqual(['Zebra', 'X-ray', 'Yield']);

    await page.locator('#pendingColumn li[data-task-id="2"]').locator('.btn-task-delete').click();
    await page.click('#confirmDeleteBtn');

    const orderAfter = await getTaskOrder(page, '#pendingColumn');
    expect(orderAfter).toEqual(['Zebra', 'X-ray']);
  });
});
