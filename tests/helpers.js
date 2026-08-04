async function seedTasks(page, tasks) {
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

module.exports = { seedTasks, getStoredTasks, column, cardIn, createTask };
