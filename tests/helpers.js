async function clearTasks(page) {
  await page.request.delete('/api/tasks');
}

const VALID_STATUSES = ['prioritize', 'in-progress', 'done'];

async function seedTasks(page, tasks) {
  await clearTasks(page);
  for (const task of tasks) {
    const { status, ...rest } = task;
    const payload =
      status === undefined || VALID_STATUSES.includes(status) ? { ...task } : rest;
    await page.request.post('/api/tasks', { data: payload });
  }
}

async function getStoredTasks(page) {
  const response = await page.request.get('/api/tasks');
  return response.json();
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

module.exports = { clearTasks, seedTasks, getStoredTasks, column, cardIn, createTask };
