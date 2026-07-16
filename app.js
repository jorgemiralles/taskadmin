const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const taskStatusSelect = document.getElementById('taskStatus');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.push({
    id: nextId++,
    title: title,
    startDate: startDateInput.value || null,
    endDate: endDateInput.value || null,
    status: taskStatusSelect.value,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = '';
  startDateInput.value = '';
  endDateInput.value = '';
  taskStatusSelect.value = 'pending';
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
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

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

renderTasks();
