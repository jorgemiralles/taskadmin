const STORAGE_KEY = 'tasks';

function getTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function renderTaskList() {
  const container = document.getElementById('task-list');
  const tasks = getTasks();

  if (tasks.length === 0) {
    container.innerHTML = '<p class="empty-state">No tasks yet</p>';
    return;
  }

  container.innerHTML = tasks.map(task => `
    <div class="task-card">
      <h3>${escapeHtml(task.title)}</h3>
      <p class="task-date">${new Date(task.createdAt).toLocaleDateString()}</p>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function showFlash(message) {
  const flash = document.getElementById('flash');
  flash.textContent = message;
  flash.classList.remove('hidden');
  setTimeout(() => flash.classList.add('hidden'), 3000);
}

// Navigation
document.getElementById('nav-create').addEventListener('click', () => {
  document.getElementById('nav-create').classList.add('active');
  document.getElementById('nav-list').classList.remove('active');
  document.getElementById('page-create').classList.remove('hidden');
  document.getElementById('page-list').classList.add('hidden');
});

document.getElementById('nav-list').addEventListener('click', () => {
  document.getElementById('nav-list').classList.add('active');
  document.getElementById('nav-create').classList.remove('active');
  document.getElementById('page-list').classList.remove('hidden');
  document.getElementById('page-create').classList.add('hidden');
  renderTaskList();
});

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
    id: crypto.randomUUID(),
    title,
    description,
    createdAt: new Date().toISOString()
  });
  saveTasks(tasks);

  titleInput.value = '';
  descInput.value = '';
  showFlash('Task created successfully');

  // Switch to list view
  document.getElementById('nav-list').click();
});

// Initial render if on list page
renderTaskList();
