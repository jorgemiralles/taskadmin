'use strict';

(function () {
  var STORAGE_KEY = 'tasks';
  var PRIORITIES = ['Low', 'Medium', 'High'];
  var STATUSES = ['Open', 'In Progress', 'Completed'];
  var MESSAGES = {
    created: 'Task created successfully',
    updated: 'Task updated successfully',
    deleted: 'Task deleted successfully'
  };

  var state = {
    currentTaskId: null,
    pendingDeleteId: null
  };

  function getTasks() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var tasks = JSON.parse(raw);
      return Array.isArray(tasks) ? tasks : [];
    } catch (err) {
      return [];
    }
  }

  function saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (err) {
      showToast('Unable to save to browser storage.', 'error');
    }
  }

  function showToast(message, type) {
    var toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast ' + (type === 'error' ? 'error' : 'success');
    toast.classList.remove('hidden');
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(function () {
      toast.classList.add('hidden');
    }, 3000);
  }

  function showView(viewId) {
    ['list-view', 'details-view', 'form-view'].forEach(function (id) {
      document.getElementById(id).classList.toggle('hidden', id !== viewId);
    });
  }

  function reveal(elt) {
    elt.classList.remove('hidden');
  }

  function conceal(elt) {
    elt.classList.add('hidden');
  }

  function renderList() {
    var tbody = document.getElementById('task-list');
    var emptyState = document.getElementById('empty-state');
    var tasks = getTasks();

    tbody.innerHTML = '';

    if (tasks.length === 0) {
      conceal(document.getElementById('task-table'));
      reveal(emptyState);
      return;
    }

    reveal(document.getElementById('task-table'));
    conceal(emptyState);

    tasks.forEach(function (task) {
      var tr = document.createElement('tr');
      tr.setAttribute('data-id', task.id);
      tr.addEventListener('click', function () {
        openDetails(task.id);
      });

      var tdTitle = document.createElement('td');
      tdTitle.textContent = task.title;
      var tdPriority = document.createElement('td');
      tdPriority.textContent = task.priority;
      var tdStatus = document.createElement('td');
      tdStatus.textContent = task.status;

      tr.appendChild(tdTitle);
      tr.appendChild(tdPriority);
      tr.appendChild(tdStatus);
      tbody.appendChild(tr);
    });
  }

  function findTask(id) {
    return getTasks().find(function (task) {
      return String(task.id) === String(id);
    });
  }

  function openDetails(id) {
    var task = findTask(id);
    if (!task) {
      showToast('Task not found', 'error');
      renderList();
      return;
    }

    state.currentTaskId = task.id;

    document.getElementById('detail-title').textContent = task.title;
    document.getElementById('detail-description').textContent = task.description || '-';
    document.getElementById('detail-priority').textContent = task.priority;
    document.getElementById('detail-status').textContent = task.status;

    showView('details-view');
  }

  function openCreateForm() {
    state.currentTaskId = null;
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('form-title').textContent = 'New Task';
    conceal(document.getElementById('status-field'));
    showView('form-view');
    document.getElementById('title').focus();
  }

  function openEditForm(id) {
    var task = findTask(id);
    if (!task) {
      showToast('Task not found', 'error');
      renderList();
      return;
    }

    state.currentTaskId = task.id;
    document.getElementById('task-id').value = task.id;
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description || '';
    document.getElementById('priority').value = task.priority;
    document.getElementById('status').value = task.status;
    document.getElementById('form-title').textContent = 'Edit Task';
    reveal(document.getElementById('status-field'));
    showView('form-view');
  }

  function validate(values) {
    var errors = [];

    if (!values.title || values.title.trim() === '') {
      errors.push('Title is required.');
    } else if (values.title.trim().length > 255) {
      errors.push('Title must be 255 characters or fewer.');
    }

    if (PRIORITIES.indexOf(values.priority) === -1) {
      errors.push('Priority must be Low, Medium, or High.');
    }

    if (STATUSES.indexOf(values.status) === -1) {
      errors.push('Status must be Open, In Progress, or Completed.');
    }

    if (!errors.length) {
      var tasks = getTasks();
      var normalized = values.title.trim().toLowerCase();
      var duplicate = tasks.some(function (task) {
        return String(task.id) !== String(values.id) &&
          task.title.trim().toLowerCase() === normalized;
      });
      if (duplicate) {
        errors.push('A task with this title already exists');
      }
    }

    return errors;
  }

  function handleSave(event) {
    event.preventDefault();

    var id = document.getElementById('task-id').value;
    var values = {
      id: id,
      title: document.getElementById('title').value,
      description: document.getElementById('description').value,
      priority: document.getElementById('priority').value,
      status: document.getElementById('status').value
    };

    var validationErrors = validate(values);
    if (validationErrors.length) {
      showToast(validationErrors.join(' '), 'error');
      return;
    }

    var tasks = getTasks();
    var now = Date.now();

    if (id) {
      var index = tasks.findIndex(function (task) {
        return String(task.id) === String(id);
      });
      if (index === -1) {
        showToast('Task not found', 'error');
        return;
      }
      tasks[index].title = values.title.trim();
      tasks[index].description = values.description.trim();
      tasks[index].priority = values.priority;
      tasks[index].status = values.status;
      tasks[index].updatedAt = now;
      saveTasks(tasks);
      showToast(MESSAGES.updated);
      state.currentTaskId = id;
      openDetails(id);
    } else {
      var task = {
        id: generateId(),
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        status: 'Open',
        createdAt: now,
        updatedAt: now
      };
      tasks.push(task);
      saveTasks(tasks);
      showToast(MESSAGES.created);
      renderList();
      showView('list-view');
    }
  }

  function generateId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'task-' + Date.now() + '-' + Math.random().toString(36).slice(2, 10);
  }

  function confirmDelete(id) {
    var task = findTask(id);
    if (!task) {
      showToast('Task not found', 'error');
      renderList();
      return;
    }
    state.pendingDeleteId = task.id;
    document.getElementById('modal-task-title').textContent = task.title;
    reveal(document.getElementById('confirm-modal'));
  }

  function handleConfirmedDelete() {
    var id = state.pendingDeleteId;
    if (!id) return;

    var tasks = getTasks().filter(function (task) {
      return String(task.id) !== String(id);
    });
    saveTasks(tasks);
    state.pendingDeleteId = null;
    state.currentTaskId = null;
    conceal(document.getElementById('confirm-modal'));
    showToast(MESSAGES.deleted);
    renderList();
    showView('list-view');
  }

  function handleCancelDelete() {
    state.pendingDeleteId = null;
    conceal(document.getElementById('confirm-modal'));
  }

  function bindEvents() {
    document.getElementById('add-task-btn').addEventListener('click', openCreateForm);
    document.getElementById('cancel-btn').addEventListener('click', function () {
      renderList();
      showView('list-view');
    });
    document.getElementById('back-btn').addEventListener('click', function () {
      renderList();
      showView('list-view');
    });
    document.getElementById('edit-task-btn').addEventListener('click', function () {
      if (state.currentTaskId) openEditForm(state.currentTaskId);
    });
    document.getElementById('delete-task-btn').addEventListener('click', function () {
      if (state.currentTaskId) confirmDelete(state.currentTaskId);
    });
    document.getElementById('task-form').addEventListener('submit', handleSave);
    document.getElementById('confirm-delete-btn').addEventListener('click', handleConfirmedDelete);
    document.getElementById('cancel-delete-btn').addEventListener('click', handleCancelDelete);
  }

  function init() {
    bindEvents();
    renderList();
    showView('list-view');
  }

  document.addEventListener('DOMContentLoaded', init);
})();