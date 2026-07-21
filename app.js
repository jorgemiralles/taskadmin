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

const pendingColumn = document.getElementById('pendingColumn');
const inProgressColumn = document.getElementById('inProgressColumn');
const completedColumn = document.getElementById('completedColumn');

const pendingZone = pendingColumn.closest('.kanban-zone');
const inProgressZone = inProgressColumn.closest('.kanban-zone');
const completedZone = completedColumn.closest('.kanban-zone');

let tasks = [];
let nextId = 1;
let editingTaskId = null;
let pendingDeleteId = null;
let draggedTaskId = null;

const confirmBootstrapModal = new bootstrap.Modal(confirmModal);
const editBootstrapModal = new bootstrap.Modal(editModal);

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function loadState() {
  try {
    tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    nextId = parseInt(localStorage.getItem('nextId'), 10) || 1;
  } catch {
    tasks = [];
    nextId = 1;
  }
  migrateOrders();
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

function saveState() {
  try {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', nextId.toString());
  } catch {
    // storage unavailable — state is lost on reload
  }
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
  editStartDate.value = task.startDate || '';
  editStatus.value = task.status;
  editBootstrapModal.show();
  editTitle.focus();
}

function hideEditModal() {
  editingTaskId = null;
  editBootstrapModal.hide();
}

function saveEdit() {
  if (editingTaskId === null) return;

  const title = editTitle.value.trim();
  if (!title) return;

  const task = tasks.find(t => t.id === editingTaskId);
  if (task) {
    task.title = title;
    task.startDate = editStartDate.value || null;
    task.status = editStatus.value;
  }

  saveState();
  renderTasks();
  hideEditModal();
}

function addTask(e) {
  e.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  const startDate = startDateInput.value || null;
  const sameStatusTasks = tasks.filter(t => t.status === 'pending');

  tasks.push({
    id: nextId++,
    title,
    startDate,
    status: 'pending',
    order: sameStatusTasks.length
  });

  saveState();
  renderTasks();
  clearForm();
}

function deleteTask(id) {
  pendingDeleteId = id;
  confirmBootstrapModal.show();
}

function confirmDelete() {
  if (pendingDeleteId === null) return;
  const deletedTask = tasks.find(t => t.id === pendingDeleteId);
  tasks = tasks.filter(task => task.id !== pendingDeleteId);
  if (deletedTask) {
    recalculateOrders(deletedTask.status);
  }
  if (editingTaskId === pendingDeleteId) {
    hideEditModal();
  }
  pendingDeleteId = null;
  confirmBootstrapModal.hide();
  saveState();
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
  taskInfo.appendChild(titleSpan);

  if (task.startDate) {
    const startSpan = document.createElement('span');
    startSpan.textContent = `Start: ${task.startDate}`;
    startSpan.className = 'task-date';
    taskInfo.appendChild(startSpan);
  }

  li.appendChild(taskInfo);

  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.className = 'btn btn-primary btn-sm';
  editBtn.addEventListener('click', () => showEditModal(task.id));
  actionsDiv.appendChild(editBtn);

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'Delete';
  deleteBtn.className = 'btn btn-danger btn-sm';
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

  saveState();
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

  saveState();
  renderTasks();
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

loadState();
renderTasks();
startDateInput.value = getTodayDate();
