const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const startDateInput = document.getElementById('startDate');
const addBtn = document.getElementById('addBtn');
const confirmModal = document.getElementById('confirmModal');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const editModal = document.getElementById('editModal');
const editTitle = document.getElementById('editTitle');
const editStartDate = document.getElementById('editStartDate');
const editStatus = document.getElementById('editStatus');
const saveEditBtn = document.getElementById('saveEditBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const taskDetailsModal = document.getElementById('taskDetailsModal');
const detailsTitle = document.getElementById('detailsTitle');
const detailsStatus = document.getElementById('detailsStatus');
const detailsStartDate = document.getElementById('detailsStartDate');
const editFromDetailsBtn = document.getElementById('editFromDetailsBtn');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');

const pendingColumn = document.getElementById('pendingColumn');
const inProgressColumn = document.getElementById('inProgressColumn');
const completedColumn = document.getElementById('completedColumn');

const pendingZone = pendingColumn.closest('.kanban-zone');
const inProgressZone = inProgressColumn.closest('.kanban-zone');
const completedZone = completedColumn.closest('.kanban-zone');

const pendingCountEl = document.getElementById('pendingCount');
const inProgressCountEl = document.getElementById('inProgressCount');
const completedCountEl = document.getElementById('completedCount');
const pendingBarEl = document.getElementById('pendingBar');
const inProgressBarEl = document.getElementById('inProgressBar');
const completedBarEl = document.getElementById('completedBar');
const inProgressBadgeEl = document.getElementById('inProgressBadge');
const progressSubtitleEl = document.getElementById('progressSubtitle');
const progressPercentEl = document.getElementById('progressPercent');
const progressRingFillEl = document.getElementById('progressRingFill');
const addTaskSection = document.getElementById('addTaskSection');

const CIRCUMFERENCE = 2 * Math.PI * 30;

const API_URL = `http://${window.location.hostname}:3000/api/tasks`;

let tasks = [];
let editingTaskId = null;
let pendingDeleteId = null;
let draggedTaskId = null;

const confirmBootstrapModal = new bootstrap.Modal(confirmModal);
const editBootstrapModal = new bootstrap.Modal(editModal);
const taskDetailsBootstrapModal = new bootstrap.Modal(taskDetailsModal);

let viewingTaskId = null;

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}, ${d.getFullYear()}`;
}

async function loadState() {
  try {
    const res = await fetch(API_URL);
    tasks = await res.json();
  } catch {
    tasks = [];
  }
  renderTasks();
}

function migrateOrders() {
  const statusGroups = {};
  tasks.forEach(task => {
    if (!statusGroups[task.status]) statusGroups[task.status] = [];
    statusGroups[task.status].push(task);
  });
  Object.values(statusGroups).forEach(group => {
    group.forEach((task, index) => {
      if (task.order === undefined || task.order === null) {
        task.order = index;
      }
    });
  });
}

function clearForm() {
  taskInput.value = '';
  startDateInput.value = getTodayDate();
  taskInput.focus();
}

function showEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  editTitle.value = task.title;
  editStartDate.value = task.start_date ? task.start_date.split('T')[0] : '';
  editStatus.value = task.status;
  editBootstrapModal.show();
  editTitle.focus();
}

function hideEditModal() {
  editingTaskId = null;
  editBootstrapModal.hide();
}

function showTaskDetailsModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  viewingTaskId = id;
  detailsTitle.textContent = task.title;
  detailsStatus.innerHTML = '<span class="task-status-badge ' + getStatusBadgeClass(task.status) + '"><span class="badge-icon ' + getStatusIconClass(task.status) + '">' + getStatusIcon(task.status) + '</span>' + getStatusLabel(task.status) + '</span>';
  detailsStartDate.textContent = task.start_date ? formatDate(task.start_date) : 'Not set';
  taskDetailsBootstrapModal.show();
}

function hideTaskDetailsModal() {
  viewingTaskId = null;
  taskDetailsBootstrapModal.hide();
}

function editFromDetails() {
  if (viewingTaskId === null) return;
  const taskId = viewingTaskId;
  hideTaskDetailsModal();
  showEditModal(taskId);
}

async function saveEdit() {
  if (editingTaskId === null) return;

  const title = editTitle.value.trim();
  if (!title) return;

  try {
    const res = await fetch(`${API_URL}/${editingTaskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, start_date: editStartDate.value || null, status: editStatus.value })
    });
    const updated = await res.json();
    const idx = tasks.findIndex(t => t.id === editingTaskId);
    if (idx !== -1) tasks[idx] = updated;
  } catch (err) {
    console.error('Failed to update task:', err);
  }

  renderTasks();
  hideEditModal();
}

async function addTask(e) {
  e.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  const startDate = startDateInput.value || null;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, start_date: startDate, status: 'pending' })
    });
    const newTask = await res.json();
    tasks.push(newTask);
  } catch (err) {
    console.error('Failed to create task:', err);
  }

  renderTasks();
  clearForm();
}

function deleteTask(id) {
  pendingDeleteId = id;
  confirmBootstrapModal.show();
}

async function confirmDelete() {
  if (pendingDeleteId === null) return;

  try {
    await fetch(`${API_URL}/${pendingDeleteId}`, { method: 'DELETE' });
    tasks = tasks.filter(t => t.id !== pendingDeleteId);
  } catch (err) {
    console.error('Failed to delete task:', err);
  }

  if (editingTaskId === pendingDeleteId) {
    hideEditModal();
  }
  pendingDeleteId = null;
  confirmBootstrapModal.hide();
  renderTasks();
}

function cancelDelete() {
  pendingDeleteId = null;
  confirmBootstrapModal.hide();
}

function recalculateOrders(status) {
  const group = tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);
  group.forEach((task, index) => {
    task.order = index;
  });
}

function getTasksInStatus(status) {
  return tasks.filter(t => t.status === status).sort((a, b) => a.order - b.order);
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending': return 'badge-todo';
    case 'in-progress': return 'badge-progress';
    case 'completed': return 'badge-done';
    default: return 'badge-todo';
  }
}

function getStatusIconClass(status) {
  switch (status) {
    case 'pending': return 'badge-icon-todo';
    case 'in-progress': return 'badge-icon-progress';
    case 'completed': return 'badge-icon-done';
    default: return 'badge-icon-todo';
  }
}

function getStatusLabel(status) {
  switch (status) {
    case 'pending': return 'To-do';
    case 'in-progress': return 'In Progress';
    case 'completed': return 'Done';
    default: return 'To-do';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'pending':
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>';
    case 'in-progress':
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
    case 'completed':
      return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    default:
      return '';
  }
}

function createTaskElement(task) {
  const li = document.createElement('li');
  li.className = 'list-group-item d-flex justify-content-between align-items-center';
  li.draggable = true;
  li.dataset.taskId = task.id;

  const taskInfo = document.createElement('div');
  taskInfo.className = 'task-info';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = task.title;
  titleSpan.className = 'task-title';
  titleSpan.style.cursor = 'pointer';
  titleSpan.addEventListener('click', () => showTaskDetailsModal(task.id));
  taskInfo.appendChild(titleSpan);

  if (task.start_date) {
    const startSpan = document.createElement('span');
    startSpan.className = 'task-date';
    startSpan.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ' + formatDate(task.start_date);
    taskInfo.appendChild(startSpan);
  }

  const badge = document.createElement('div');
  badge.className = 'task-status-badge ' + getStatusBadgeClass(task.status);
  badge.innerHTML = '<span class="badge-icon ' + getStatusIconClass(task.status) + '">' + getStatusIcon(task.status) + '</span>' + getStatusLabel(task.status);
  taskInfo.appendChild(badge);

  li.appendChild(taskInfo);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'btn-task btn-task-edit';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';
  editBtn.addEventListener('click', () => showEditModal(task.id));
  actionsDiv.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn-task btn-task-delete';
  deleteBtn.setAttribute('aria-label', 'Delete task');
  deleteBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
  deleteBtn.addEventListener('click', () => deleteTask(task.id));
  actionsDiv.appendChild(deleteBtn);

  li.appendChild(actionsDiv);

  li.addEventListener('dragstart', handleDragStart);
  li.addEventListener('dragend', handleDragEnd);
  li.addEventListener('dragover', handleTaskDragOver);
  li.addEventListener('dragleave', handleTaskDragLeave);
  li.addEventListener('drop', handleTaskDrop);

  return li;
}

function updateProgressStats() {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;

  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const offset = CIRCUMFERENCE - (pct / 100) * CIRCUMFERENCE;

  progressRingFillEl.style.strokeDashoffset = offset;
  progressPercentEl.textContent = pct + '%';
  progressSubtitleEl.textContent = completed + ' of ' + total + ' tasks completed';

  pendingCountEl.textContent = pending + ' Task' + (pending !== 1 ? 's' : '');
  inProgressCountEl.textContent = inProgress + ' Task' + (inProgress !== 1 ? 's' : '');
  completedCountEl.textContent = completed + ' Task' + (completed !== 1 ? 's' : '');
  inProgressBadgeEl.textContent = inProgress;

  if (total > 0) {
    pendingBarEl.style.width = Math.round((pending / total) * 100) + '%';
    inProgressBarEl.style.width = Math.round((inProgress / total) * 100) + '%';
    completedBarEl.style.width = Math.round((completed / total) * 100) + '%';
  } else {
    pendingBarEl.style.width = '0%';
    inProgressBarEl.style.width = '0%';
    completedBarEl.style.width = '0%';
  }
}

function renderTasks() {
  pendingColumn.innerHTML = '';
  inProgressColumn.innerHTML = '';
  completedColumn.innerHTML = '';

  const pendingTasks = getTasksInStatus('pending');
  const inProgressTasks = getTasksInStatus('in-progress');
  const completedTasks = getTasksInStatus('completed');

  pendingTasks.forEach(task => {
    pendingColumn.appendChild(createTaskElement(task));
  });

  inProgressTasks.forEach(task => {
    inProgressColumn.appendChild(createTaskElement(task));
  });

  completedTasks.forEach(task => {
    completedColumn.appendChild(createTaskElement(task));
  });

  updateProgressStats();
}

function handleDragStart(e) {
  draggedTaskId = parseInt(e.currentTarget.dataset.taskId, 10);
  e.dataTransfer.setData('text/plain', e.currentTarget.dataset.taskId);
  e.dataTransfer.effectAllowed = 'move';
  e.currentTarget.classList.add('dragging');
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  draggedTaskId = null;
  clearDropIndicators();
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    e.currentTarget.classList.remove('drag-over');
  }
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.list-group-item:not(.dragging)')];

  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function clearDropIndicators() {
  document.querySelectorAll('.drop-above, .drop-below').forEach(el => {
    el.classList.remove('drop-above', 'drop-below');
  });
}

function handleTaskDragOver(e) {
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'move';

  clearDropIndicators();

  const taskElement = e.currentTarget;
  const box = taskElement.getBoundingClientRect();
  const midpoint = box.top + box.height / 2;

  if (e.clientY < midpoint) {
    taskElement.classList.add('drop-above');
  } else {
    taskElement.classList.add('drop-below');
  }
}

function handleTaskDragLeave(e) {
  e.currentTarget.classList.remove('drop-above', 'drop-below');
}

function handleTaskDrop(e) {
  e.preventDefault();
  e.stopPropagation();

  clearDropIndicators();

  const targetElement = e.currentTarget;
  targetElement.classList.remove('drop-above', 'drop-below');

  const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  const targetTaskId = parseInt(targetElement.dataset.taskId, 10);
  const targetTask = tasks.find(t => t.id === targetTaskId);
  if (!targetTask || taskId === targetTaskId) return;

  const box = targetElement.getBoundingClientRect();
  const midpoint = box.top + box.height / 2;
  const insertBefore = e.clientY < midpoint;

  const sourceStatus = task.status;
  const targetStatus = targetTask.status;

  task.status = targetStatus;

  const sameStatusTasks = getTasksInStatus(targetStatus).filter(t => t.id !== taskId);
  const targetIndex = sameStatusTasks.findIndex(t => t.id === targetTaskId);

  if (insertBefore) {
    sameStatusTasks.splice(targetIndex, 0, task);
  } else {
    sameStatusTasks.splice(targetIndex + 1, 0, task);
  }

  sameStatusTasks.forEach((t, i) => { t.order = i; });

  if (sourceStatus !== targetStatus) {
    recalculateOrders(sourceStatus);
  }

  fetch(`${API_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: targetStatus })
  }).catch(err => console.error('Failed to update task:', err));

  renderTasks();
}

function handleZoneDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
  const newStatus = e.currentTarget.dataset.status;

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  clearDropIndicators();

  const afterElement = getDragAfterElement(e.currentTarget.querySelector('.kanban-column'), e.clientY);

  const oldStatus = task.status;
  task.status = newStatus;

  if (afterElement) {
    const afterTaskId = parseInt(afterElement.dataset.taskId, 10);
    const sameStatusTasks = getTasksInStatus(newStatus).filter(t => t.id !== taskId);
    const afterIndex = sameStatusTasks.findIndex(t => t.id === afterTaskId);
    sameStatusTasks.splice(afterIndex, 0, task);
    sameStatusTasks.forEach((t, i) => { t.order = i; });
  } else {
    const sameStatusTasks = getTasksInStatus(newStatus).filter(t => t.id !== taskId);
    sameStatusTasks.push(task);
    sameStatusTasks.forEach((t, i) => { t.order = i; });
  }

  if (oldStatus !== newStatus) {
    recalculateOrders(oldStatus);
  }

  fetch(`${API_URL}/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: newStatus })
  }).catch(err => console.error('Failed to update task:', err));

  renderTasks();
}

function setupBottomNav() {
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      const tab = item.dataset.tab;
      if (tab === 'add') {
        addTaskSection.scrollIntoView({ behavior: 'smooth' });
        taskInput.focus();
      } else if (tab === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });
}

function setupTaskGroupCards() {
  const cards = document.querySelectorAll('.task-group-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter;
      const zone = document.querySelector('.kanban-zone[data-status="' + filter + '"]');
      if (zone) {
        zone.scrollIntoView({ behavior: 'smooth', block: 'center' });
        zone.style.transition = 'background-color 0.3s';
        zone.style.backgroundColor = 'rgba(95,51,225,0.06)';
        setTimeout(() => { zone.style.backgroundColor = ''; }, 800);
      }
    });
  });
}

[pendingZone, inProgressZone, completedZone].forEach(zone => {
  zone.addEventListener('dragover', handleDragOver);
  zone.addEventListener('dragleave', handleDragLeave);
  zone.addEventListener('drop', handleZoneDrop);
});

taskForm.addEventListener('submit', addTask);
confirmDeleteBtn.addEventListener('click', confirmDelete);
cancelDeleteBtn.addEventListener('click', cancelDelete);
saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', hideEditModal);
editFromDetailsBtn.addEventListener('click', editFromDetails);
closeDetailsBtn.addEventListener('click', hideTaskDetailsModal);

loadState().then(() => {
  startDateInput.value = getTodayDate();
});
setupBottomNav();
setupTaskGroupCards();
