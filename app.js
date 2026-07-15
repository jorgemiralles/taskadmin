const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');

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
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = '';
}

function renderTasks() {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.textContent = task.title;
    taskList.appendChild(li);
  });
}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTask();
});

renderTasks();
