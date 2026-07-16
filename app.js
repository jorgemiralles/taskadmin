const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const startDateInput = document.getElementById('startDate');
const taskStatusSelect = document.getElementById('taskStatus');
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

let tasks = [];
let nextId = 1;
let editingTaskId = null;
let pendingDeleteId = null;

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
  taskStatusSelect.value = 'pending';
  taskInput.focus();
}

function showEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  editTitle.value = task.title;
  editStartDate.value = task.startDate || '';
  editStatus.value = task.status;
  editModal.style.display = 'flex';
  editTitle.focus();
}

function hideEditModal() {
  editingTaskId = null;
  editModal.style.display = 'none';
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
    status: taskStatusSelect.value
  });

  saveState();
  renderTasks();
  clearForm();
}

function deleteTask(id) {
  pendingDeleteId = id;
  confirmModal.style.display = 'flex';
}

function confirmDelete() {
  if (pendingDeleteId === null) return;
  tasks = tasks.filter(task => task.id !== pendingDeleteId);
  if (editingTaskId === pendingDeleteId) {
    hideEditModal();
  }
  pendingDeleteId = null;
  confirmModal.style.display = 'none';
  saveState();
  renderTasks();
}

function cancelDelete() {
  pendingDeleteId = null;
  confirmModal.style.display = 'none';
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');

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

    const statusSpan = document.createElement('span');
    statusSpan.textContent = `Status: ${task.status}`;
    statusSpan.className = `task-status status-${task.status}`;
    taskInfo.appendChild(statusSpan);

    li.appendChild(taskInfo);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'edit-btn';
    editBtn.addEventListener('click', () => showEditModal(task.id));
    actionsDiv.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    actionsDiv.appendChild(deleteBtn);

    li.appendChild(actionsDiv);

    taskList.appendChild(li);
  });
}

taskForm.addEventListener('submit', addTask);
confirmDeleteBtn.addEventListener('click', confirmDelete);
cancelDeleteBtn.addEventListener('click', cancelDelete);
saveEditBtn.addEventListener('click', saveEdit);
cancelEditBtn.addEventListener('click', hideEditModal);

loadState();
renderTasks();
startDateInput.value = getTodayDate();
