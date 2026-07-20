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

  tasks.push({
    id: nextId++,
    title,
    startDate,
    status: 'pending'
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
  tasks = tasks.filter(task => task.id !== pendingDeleteId);
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

  return li;
}

function renderTasks() {
  pendingColumn.innerHTML = '';
  inProgressColumn.innerHTML = '';
  completedColumn.innerHTML = '';

  tasks.forEach(task => {
    const li = createTaskElement(task);
    switch (task.status) {
      case 'in-progress':
        inProgressColumn.appendChild(li);
        break;
      case 'completed':
        completedColumn.appendChild(li);
        break;
      default:
        pendingColumn.appendChild(li);
        break;
    }
  });
}

function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', e.currentTarget.dataset.taskId);
  e.currentTarget.classList.add('dragging');
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
}

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    e.currentTarget.classList.remove('drag-over');
  }
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');

  const taskId = parseInt(e.dataTransfer.getData('text/plain'), 10);
  const newStatus = e.currentTarget.dataset.status;

  const task = tasks.find(t => t.id === taskId);
  if (task && task.status !== newStatus) {
    task.status = newStatus;
    saveState();
    renderTasks();
  }
}

[pendingZone, inProgressZone, completedZone].forEach(zone => {
  zone.addEventListener('dragover', handleDragOver);
  zone.addEventListener('dragleave', handleDragLeave);
  zone.addEventListener('drop', handleDrop);
});

taskForm.addEventListener('submit', addTask);
confirmDeleteBtn.addEventListener('click', confirmDelete);
cancelDeleteBtn.addEventListener('click', cancelDelete);
saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', hideEditModal);

loadState();
renderTasks();
startDateInput.value = getTodayDate();
