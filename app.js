const STATUSES = [
  { value: 'prioritize', label: 'Prioritize' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' }
];

const BADGE_LABELS = {
  prioritize: 'To-do',
  'in-progress': 'In Progress',
  done: 'Done'
};

async function apiFetch(path, options = {}) {
  try {
    const response = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });
    if (response.status === 204) {
      return { ok: true, data: null };
    }
    const data = await response.json().catch(() => null);
    return { ok: response.ok, data };
  } catch {
    return { ok: false, data: null };
  }
}

async function loadTasks() {
  const result = await apiFetch('/api/tasks');
  if (!result.ok || !Array.isArray(result.data)) {
    throw new Error('Failed to load tasks');
  }
  return result.data;
}

function taskStatus(task) {
  return STATUSES.some(s => s.value === task.status) ? task.status : 'prioritize';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function parseDate(createdAt) {
  const date = new Date(createdAt);
  return Number.isNaN(date.getTime()) ? null : date;
}

function renderCard(task) {
  const status = taskStatus(task);
  const created = parseDate(task.createdAt);
  return `
    <div class="task-card" draggable="true" data-id="${escapeAttr(task.id)}">
      <div class="task-card-top">
        ${task.description ? `<p class="task-desc">${escapeHtml(task.description)}</p>` : ''}
        <span class="task-badge badge-${status}">${BADGE_LABELS[status]}</span>
      </div>
      <h3>${escapeHtml(task.title)}</h3>
      <div class="task-meta">
        ${created ? `<p class="task-date">${created.toLocaleDateString()}</p>` : ''}
        ${created ? `<p class="task-time">${created.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>` : ''}
      </div>
    </div>
  `;
}

async function renderBoard() {
  const board = document.getElementById('kanban-board');
  let tasks;
  try {
    tasks = await loadTasks();
  } catch {
    showFlash('Could not reach the server');
    return;
  }

  board.innerHTML = STATUSES.map(col => {
    const colTasks = tasks.filter(task => taskStatus(task) === col.value);
    const cards = colTasks.map(renderCard).join('');
    const body = cards || '<p class="empty-state">No tasks yet</p>';
    return `
      <section class="kanban-column" data-status="${col.value}">
        <h3 class="column-title">${col.label}</h3>
        <div class="column-body">${body}</div>
      </section>
    `;
  }).join('');
}

let flashTimer;

function showFlash(message) {
  const flash = document.getElementById('flash');
  flash.textContent = message;
  flash.classList.remove('hidden');
  clearTimeout(flashTimer);
  flashTimer = setTimeout(() => flash.classList.add('hidden'), 3000);
}

// Create task
document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) return;

  const result = await apiFetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  });

  if (!result.ok) {
    showFlash('Failed to create task');
    return;
  }

  titleInput.value = '';
  descInput.value = '';
  showFlash('Task created successfully');
  await renderBoard();
});

// Drag and drop
const board = document.getElementById('kanban-board');
let draggedId = null;

board.addEventListener('dragstart', (e) => {
  const card = e.target.closest('.task-card');
  if (!card) return;
  draggedId = card.dataset.id;
  card.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', card.dataset.id);
});

board.addEventListener('dragend', () => {
  document.querySelectorAll('.task-card.dragging').forEach(c => c.classList.remove('dragging'));
  document.querySelectorAll('.kanban-column.drag-over').forEach(c => c.classList.remove('drag-over'));
  draggedId = null;
});

board.addEventListener('dragover', (e) => {
  const column = e.target.closest('.kanban-column');
  if (!column) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  column.classList.add('drag-over');
});

board.addEventListener('dragleave', (e) => {
  const column = e.target.closest('.kanban-column');
  if (!column) return;
  const related = e.relatedTarget;
  if (related instanceof Node && column.contains(related)) return;
  column.classList.remove('drag-over');
});

board.addEventListener('drop', async (e) => {
  e.preventDefault();
  const column = e.target.closest('.kanban-column');
  if (!column || !draggedId) return;

  const targetStatus = column.dataset.status;
  const id = draggedId;
  let task;
  try {
    const tasks = await loadTasks();
    task = tasks.find(t => t.id === id);
  } catch {
    showFlash('Could not reach the server');
  }

  if (task && taskStatus(task) !== targetStatus) {
    const result = await apiFetch(`/api/tasks/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify({ status: targetStatus })
    });

    if (!result.ok) {
      showFlash('Failed to update task');
    }
    await renderBoard();
  }

  document.querySelectorAll('.kanban-column.drag-over').forEach(c => c.classList.remove('drag-over'));
  draggedId = null;
});

// Bottom nav
document.getElementById('nav-add').addEventListener('click', () => {
  document.getElementById('task-title').focus();
});

// Initial render
renderBoard();
