const app = document.getElementById('app');
const flashEl = document.getElementById('flash');

let tasks = loadTasks();

const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };
const PRIORITIES = ['Low', 'Medium', 'High'];

function uuid() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? iso : d.toLocaleString();
}

function sortTasks(list) {
  return [...list].sort((a, b) => {
    const da = a.dueDate || '9999-12-31';
    const db = b.dueDate || '9999-12-31';
    if (da !== db) return da < db ? -1 : 1;
    return (PRIORITY_RANK[a.priority] ?? 1) - (PRIORITY_RANK[b.priority] ?? 1);
  });
}

function flash(message) {
  flashEl.textContent = message;
  flashEl.classList.add('show');
  clearTimeout(flashEl._timer);
  flashEl._timer = setTimeout(function () {
    flashEl.classList.remove('show');
  }, 3000);
}

function getRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  if (parts[0] === 'new') return { name: 'new' };
  if (parts[0] === 'tasks') {
    if (parts.length === 3 && parts[2] === 'edit') return { name: 'edit', id: parts[1] };
    if (parts.length === 2) return { name: 'details', id: parts[1] };
  }
  return { name: 'list' };
}

function renderList() {
  const sorted = sortTasks(tasks);

  let listHtml;
  if (sorted.length === 0) {
    listHtml = '<p class="empty">No tasks yet. Create your first task.</p>';
  } else {
    listHtml =
      '<ul class="task-list">' +
      sorted
        .map(function (task) {
          const meta = [task.priority, task.dueDate].filter(Boolean).join(' · ');
          return (
            '<li class="task-item" data-priority="' + (task.priority || 'medium').toLowerCase() + '">' +
            '<a href="#/tasks/' + encodeURIComponent(task.id) + '">' + escapeHtml(task.title) + '</a>' +
            '<span class="task-meta">' + escapeHtml(meta) + '</span>' +
            '</li>'
          );
        })
        .join('') +
      '</ul>';
  }

  app.innerHTML =
    '<div class="toolbar">' +
    '<h2>Tasks</h2>' +
    '<a class="btn btn-primary" href="#/new">New Task</a>' +
    '</div>' +
    listHtml;
}

function renderForm(existing) {
  if (existing && !tasks.find(function (t) { return t.id === existing.id; })) {
    renderList();
    flash('Task not found');
    return;
  }

  const isEdit = !!existing;
  const t = existing || { title: '', description: '', dueDate: '', priority: 'Medium' };

  app.innerHTML =
    '<div class="form-wrap">' +
    '<h2>' + (isEdit ? 'Edit Task' : 'New Task') + '</h2>' +
    '<form id="task-form">' +
    '<label for="title">Title</label>' +
    '<input type="text" id="title" name="title" required maxlength="200" value="' + escapeHtml(t.title) + '">' +
    '<label for="description">Description</label>' +
    '<textarea id="description" name="description" rows="4">' + escapeHtml(t.description) + '</textarea>' +
    '<label for="dueDate">Due Date</label>' +
    '<input type="date" id="dueDate" name="dueDate" value="' + escapeHtml(t.dueDate) + '">' +
    '<label for="priority">Priority</label>' +
    '<select id="priority" name="priority">' +
    PRIORITIES.map(function (p) {
      return '<option value="' + p + '"' + (p === t.priority ? ' selected' : '') + '>' + p + '</option>';
    }).join('') +
    '</select>' +
    '<div class="form-actions">' +
    '<button type="submit" class="btn btn-primary">Save Task</button>' +
    '<a class="btn" href="#/">Cancel</a>' +
    '</div>' +
    '</form>' +
    '</div>';

  document.getElementById('task-form').addEventListener('submit', function (e) {
    e.preventDefault();
    handleFormSubmit(existing);
  });
}

function handleFormSubmit(existing) {
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const dueDate = document.getElementById('dueDate').value;
  const priority = document.getElementById('priority').value;

  if (!title) {
    flash('Title is required');
    return;
  }

  if (existing) {
    Object.assign(existing, { title: title, description: description, dueDate: dueDate, priority: priority, updatedAt: new Date().toISOString() });
    saveTasks(tasks);
    flash('Task updated successfully');
  } else {
    const now = new Date().toISOString();
    tasks.push({
      id: uuid(),
      title: title,
      description: description,
      dueDate: dueDate,
      priority: priority,
      createdAt: now,
      updatedAt: now
    });
    saveTasks(tasks);
    flash('Task created successfully');
  }

  location.hash = '#/';
}

function renderDetails(id) {
  const task = tasks.find(function (t) { return t.id === id; });

  if (!task) {
    renderList();
    flash('Task not found');
    return;
  }

  const desc = task.description ? escapeHtml(task.description) : '<em>—</em>';
  const due = task.dueDate ? escapeHtml(task.dueDate) : '<em>—</em>';

  app.innerHTML =
    '<div class="detail">' +
    '<a class="btn btn-link" href="#/">← Back to list</a>' +
    '<h2>' + escapeHtml(task.title) + '</h2>' +
    '<dl>' +
    '<dt>Description</dt><dd>' + desc + '</dd>' +
    '<dt>Due Date</dt><dd>' + due + '</dd>' +
    '<dt>Priority</dt><dd><span class="badge" data-priority="' + (task.priority || 'medium').toLowerCase() + '">' + escapeHtml(task.priority) + '</span></dd>' +
    '<dt>Created</dt><dd>' + escapeHtml(formatDate(task.createdAt)) + '</dd>' +
    '<dt>Updated</dt><dd>' + escapeHtml(formatDate(task.updatedAt)) + '</dd>' +
    '</dl>' +
    '<div class="detail-actions">' +
    '<a class="btn btn-primary" href="#/tasks/' + encodeURIComponent(task.id) + '/edit">Edit Task</a>' +
    '<button type="button" class="btn btn-danger" id="delete-task">Delete Task</button>' +
    '</div>' +
    '</div>';

  document.getElementById('delete-task').addEventListener('click', function () {
    handleDelete(task);
  });
}

function handleDelete(task) {
  if (!window.confirm('Delete task "' + task.title + '"?')) return;
  tasks = tasks.filter(function (t) { return t.id !== task.id; });
  saveTasks(tasks);
  flash('Task deleted successfully');
  location.hash = '#/';
}

function router() {
  const route = getRoute();

  if (route.name === 'new') {
    renderForm(null);
  } else if (route.name === 'edit') {
    renderForm(tasks.find(function (t) { return t.id === route.id; }));
  } else if (route.name === 'details') {
    renderDetails(route.id);
  } else {
    renderList();
  }
}

window.addEventListener('hashchange', router);
router();
