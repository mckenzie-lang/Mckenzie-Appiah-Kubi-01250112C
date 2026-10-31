const STORAGE_KEY = 'atu-study-planner-tasks';
const form = document.getElementById('task-form');
const titleInput = document.getElementById('task-title');
const subjectInput = document.getElementById('task-subject');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const count = document.getElementById('task-count');
const progressText = document.getElementById('progress-text');
const progressBar = document.getElementById('progress-bar');
const message = document.getElementById('form-message');
let tasks = loadTasks();
let currentFilter = 'all';

function loadTasks() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function renderTasks() {
  taskList.innerHTML = '';
  const visibleTasks = tasks.filter(task =>
    currentFilter === 'all' || (currentFilter === 'active' && !task.completed) ||
    (currentFilter === 'completed' && task.completed)
  );
  emptyState.hidden = visibleTasks.length !== 0;
  if (tasks.length === 0) {
    emptyState.querySelector('h3').textContent = 'No tasks yet';
    emptyState.querySelector('p').textContent = 'Add your first study task above and it will appear here.';
  } else if (visibleTasks.length === 0) {
    emptyState.querySelector('h3').textContent = 'Nothing in this filter';
    emptyState.querySelector('p').textContent = 'Try another filter to see your tasks.';
  }
  visibleTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item${task.completed ? ' completed' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.className = 'task-check';
    checkbox.checked = task.completed; checkbox.setAttribute('aria-label', 'Mark task complete');
    checkbox.addEventListener('change', () => {
      tasks = tasks.map(item => item.id === task.id ? {...item, completed: checkbox.checked} : item);
      saveTasks(); renderTasks();
    });
    const info = document.createElement('div'); info.className = 'task-info';
    const taskTitle = document.createElement('div'); taskTitle.className = 'task-title';
    taskTitle.textContent = task.title;
    const subject = document.createElement('div'); subject.className = 'task-subject';
    subject.textContent = task.subject || 'General study';
    info.append(taskTitle, subject);
    const del = document.createElement('button'); del.className = 'delete-btn';
    del.type = 'button'; del.textContent = 'Delete';
    del.addEventListener('click', () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks(); renderTasks();
    });
    li.append(checkbox, info, del); taskList.append(li);
  });
  count.textContent = tasks.length;
  const done = tasks.filter(task => task.completed).length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  progressText.textContent = `${percent}%`;
  progressBar.style.width = `${percent}%`;
}
form.addEventListener('submit', event => {
  event.preventDefault();
  const title = titleInput.value.trim();
  if (!title) { message.textContent = 'Please enter a task title.'; titleInput.focus(); return; }
  tasks.unshift({id: Date.now().toString(), title, subject: subjectInput.value.trim(), completed: false});
  saveTasks(); form.reset(); message.textContent = ''; currentFilter = 'all';
  document.querySelectorAll('.filter').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === 'all'));
  renderTasks(); titleInput.focus();
});
document.querySelectorAll('.filter').forEach(button => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll('.filter').forEach(btn => btn.classList.toggle('active', btn === button));
    renderTasks();
  });
});
renderTasks();
