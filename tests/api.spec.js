const { test, expect } = require('@playwright/test');

const BASE = '/api/tasks';

test.beforeEach(async ({ request }) => {
  await request.delete(BASE);
});

async function createTask(request, data = {}) {
  return request.post(BASE, {
    data: { title: 'Buy groceries', description: 'Milk, eggs, bread', ...data },
  });
}

test.describe('POST /api/tasks', () => {
  test('creates a task with defaults', async ({ request }) => {
    const response = await createTask(request);
    expect(response.status()).toBe(201);
    const task = await response.json();
    expect(task.id).toBeTruthy();
    expect(task.title).toBe('Buy groceries');
    expect(task.description).toBe('Milk, eggs, bread');
    expect(task.status).toBe('prioritize');
    expect(task.createdAt).toBeTruthy();
  });

  test('trims title and description', async ({ request }) => {
    const response = await createTask(request, { title: '  Buy groceries  ', description: '  Milk  ' });
    const task = await response.json();
    expect(task.title).toBe('Buy groceries');
    expect(task.description).toBe('Milk');
  });

  test('rejects a missing title', async ({ request }) => {
    const response = await request.post(BASE, { data: { description: 'no title' } });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toBe('title is required');
  });

  test('rejects an unknown status', async ({ request }) => {
    const response = await createTask(request, { status: 'archive' });
    expect(response.status()).toBe(400);
    expect((await response.json()).error).toContain('status must be one of');
  });

  test('accepts an explicit status and createdAt', async ({ request }) => {
    const response = await createTask(request, {
      status: 'done',
      createdAt: '2026-07-31T10:00:00.000Z',
    });
    expect(response.status()).toBe(201);
    const task = await response.json();
    expect(task.status).toBe('done');
    expect(task.createdAt).toBe('2026-07-31T10:00:00.000Z');
  });
});

test.describe('GET /api/tasks', () => {
  test('lists created tasks ordered by createdAt', async ({ request }) => {
    await createTask(request, { title: 'First', createdAt: '2026-07-31T10:00:00.000Z' });
    await createTask(request, { title: 'Second', createdAt: '2026-07-31T11:00:00.000Z' });

    const response = await request.get(BASE);
    expect(response.status()).toBe(200);
    const tasks = await response.json();
    expect(tasks.map(t => t.title)).toEqual(['First', 'Second']);
  });

  test('returns an empty array when there are no tasks', async ({ request }) => {
    const response = await request.get(BASE);
    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});

test.describe('GET /api/tasks/:id', () => {
  test('returns a single task', async ({ request }) => {
    const created = await (await createTask(request)).json();
    const response = await request.get(`${BASE}/${created.id}`);
    expect(response.status()).toBe(200);
    expect((await response.json()).title).toBe('Buy groceries');
  });

  test('returns 404 for an unknown id', async ({ request }) => {
    const response = await request.get(`${BASE}/00000000-0000-0000-0000-000000000000`);
    expect(response.status()).toBe(404);
  });

  test('returns 404 for a malformed id', async ({ request }) => {
    const response = await request.get(`${BASE}/not-a-uuid`);
    expect(response.status()).toBe(404);
  });
});

test.describe('PUT /api/tasks/:id', () => {
  test('updates fields on a task', async ({ request }) => {
    const created = await (await createTask(request)).json();
    const response = await request.put(`${BASE}/${created.id}`, {
      data: { title: 'Updated', status: 'done' },
    });
    expect(response.status()).toBe(200);
    const task = await response.json();
    expect(task.title).toBe('Updated');
    expect(task.description).toBe('Milk, eggs, bread');
    expect(task.status).toBe('done');
  });

  test('returns 404 for an unknown id', async ({ request }) => {
    const response = await request.put(`${BASE}/00000000-0000-0000-0000-000000000000`, {
      data: { title: 'Nope' },
    });
    expect(response.status()).toBe(404);
  });

  test('rejects an empty title', async ({ request }) => {
    const created = await (await createTask(request)).json();
    const response = await request.put(`${BASE}/${created.id}`, { data: { title: '' } });
    expect(response.status()).toBe(400);
  });
});

test.describe('DELETE /api/tasks/:id', () => {
  test('deletes a task', async ({ request }) => {
    const created = await (await createTask(request)).json();
    const response = await request.delete(`${BASE}/${created.id}`);
    expect(response.status()).toBe(204);

    const missing = await request.get(`${BASE}/${created.id}`);
    expect(missing.status()).toBe(404);
  });

  test('returns 404 for an unknown id', async ({ request }) => {
    const response = await request.delete(`${BASE}/00000000-0000-0000-0000-000000000000`);
    expect(response.status()).toBe(404);
  });
});
