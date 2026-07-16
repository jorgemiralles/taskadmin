const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const startDateInput = document.getElementById('startDate');
const taskStatusSelect = document.getElementById('taskStatus');
const addBtn = document.getElementById('addBtn');
const cancelBtn = document.getElementById('cancelBtn');

let tasks = [];
let nextId = 1;
let editingTaskId = null;

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
  startDateInput.value = '';
  taskStatusSelect.value = 'pending';
  taskInput.focus();
}

function exitEditMode() {
  editingTaskId = null;
  addBtn.textContent = 'Add';
  cancelBtn.style.display = 'none';
  clearForm();
}

function startEditMode(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  editingTaskId = id;
  taskInput.value = task.title;
  startDateInput.value = task.startDate || '';
  taskStatusSelect.value = task.status;
  addBtn.textContent = 'Save';
  cancelBtn.style.display = '';
  taskInput.focus();
}

function addTask(e) {
  e.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  const startDate = startDateInput.value || null;

  if (editingTaskId !== null) {
    const task = tasks.find(t => t.id === editingTaskId);
    if (task) {
      task.title = title;
      task.startDate = startDate;
      task.status = taskStatusSelect.value;
    }
    saveState();
    renderTasks();
    exitEditMode();
  } else {
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
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  if (editingTaskId === id) {
    exitEditMode();
  }
  saveState();
  renderTasks();
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
    editBtn.addEventListener('click', () => startEditMode(task.id));
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
cancelBtn.addEventListener('click', exitEditMode);

loadState();
renderTasks();
