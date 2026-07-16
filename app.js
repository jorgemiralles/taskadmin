const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const taskStatusSelect = document.getElementById('taskStatus');

let tasks = [];
let nextId = 1;

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
  endDateInput.value = '';
  taskStatusSelect.value = 'pending';
  taskInput.focus();
}

function addTask(e) {
  e.preventDefault();

  const title = taskInput.value.trim();
  if (!title) return;

  const startDate = startDateInput.value || null;
  const endDate = endDateInput.value || null;

  if (startDate && endDate && endDate < startDate) {
    alert('End date must be after start date.');
    return;
  }

  tasks.push({
    id: nextId++,
    title,
    startDate,
    endDate,
    status: taskStatusSelect.value
  });

  saveState();
  renderTasks();
  clearForm();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
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
    
    if (task.endDate) {
      const endSpan = document.createElement('span');
      endSpan.textContent = `End: ${task.endDate}`;
      endSpan.className = 'task-date';
      taskInfo.appendChild(endSpan);
    }
    
    const statusSpan = document.createElement('span');
    statusSpan.textContent = `Status: ${task.status}`;
    statusSpan.className = `task-status status-${task.status}`;
    taskInfo.appendChild(statusSpan);
    
    li.appendChild(taskInfo);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));
    li.appendChild(deleteBtn);

    taskList.appendChild(li);
  });
}

taskForm.addEventListener('submit', addTask);

loadState();
renderTasks();
