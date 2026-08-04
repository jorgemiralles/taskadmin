const STORAGE_KEY = 'tasks';

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

function getTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    return true;
  } catch {
    return false;
  }
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

function newId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
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

function renderBoard() {
  const board = document.getElementById('kanban-board');
  const tasks = getTasks();

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
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const titleInput = document.getElementById('task-title');
  const descInput = document.getElementById('task-desc');
  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) return;

  const tasks = getTasks();
  tasks.push({
    id: newId(),
    title,
    description,
    status: 'prioritize',
    createdAt: new Date().toISOString()
  });
  if (!saveTasks(tasks)) {
    showFlash('Failed to save task');
    return;
  }

  titleInput.value = '';
  descInput.value = '';
  showFlash('Task created successfully');
  renderBoard();
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

board.addEventListener('drop', (e) => {
  e.preventDefault();
  const column = e.target.closest('.kanban-column');
  if (!column || !draggedId) return;

  const targetStatus = column.dataset.status;
  const tasks = getTasks();
  const task = tasks.find(t => t.id === draggedId);

  if (task && taskStatus(task) !== targetStatus) {
    task.status = targetStatus;
    saveTasks(tasks);
    renderBoard();
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
