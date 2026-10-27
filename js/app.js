// --- 1. NAVIGATIE TUSSEN TABBLADEN ---
function switchView(viewName) {
  const views = ['today', 'plan', 'vitality', 'money', 'ideas', 'hacks'];
  
  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const tab = document.getElementById(`tab-${v}`);
    if (el) el.classList.add('hidden');
    if (tab) tab.classList.remove('active');
  });

  const activeEl = document.getElementById(`view-${viewName}`);
  const activeTab = document.getElementById(`tab-${viewName}`);
  
  if (activeEl) activeEl.classList.remove('hidden');
  if (activeTab) activeTab.classList.add('active');

  // Als we op het plan-tabblad komen, laden we direct de taken
  if (viewName === 'plan') {
    renderTasks();
  }
}

// --- 2. THEMA TOGGLE (DAG / NACHT) ---
function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('voldaan_theme', isDark ? 'dark' : 'light');
  
  const themeBtn = document.getElementById('theme-btn');
  if (themeBtn) {
    themeBtn.innerText = isDark ? '☀️ Dag' : '🌙 Nacht';
  }
}

function initTheme() {
  if (localStorage.getItem('voldaan_theme') === 'dark') {
    document.body.classList.add('dark-theme');
    const themeBtn = document.getElementById('theme-btn');
    if (themeBtn) themeBtn.innerText = '☀️ Dag';
  }
}

// --- 3. SIMPELE TAKEN / PLANBORD LOGICA ---
function addTask() {
  const input = document.getElementById('task-input');
  if (!input || !input.value.trim()) return;

  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  
  tasks.unshift({
    id: Date.now(),
    text: input.value.trim(),
    done: false,
    created: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  });

  localStorage.setItem('voldaan_tasks', JSON.stringify(tasks));
  input.value = '';
  renderTasks();
}

function toggleTask(id) {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  const task = tasks.find(t => t.id === id);
  
  if (task) {
    task.done = !task.done;
    localStorage.setItem('voldaan_tasks', JSON.stringify(tasks));
    renderTasks();
  }
}

function removeTask(id) {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('voldaan_tasks', JSON.stringify(tasks));
  renderTasks();
}

function renderTasks() {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  const container = document.getElementById('tasks-list');
  
  if (!container) return;
  container.innerHTML = '';

  if (tasks.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Nog geen actieve taken. Rustig aan! 🎉</span>';
    return;
  }

  tasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `item-card ${task.done ? 'done' : ''}`;
    div.innerHTML = `
      <div>
        <span style="cursor:pointer; ${task.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}" onclick="toggleTask(${task.id})">
          ${task.done ? '✅' : '⚪'} ${task.text}
        </span>
        <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">Aangemaakt: ${task.created}</span>
      </div>
      <button style="background:none; border:none; color:#E53E3E; cursor:pointer; font-size: 0.9rem;" onclick="removeTask(${task.id})" title="Verwijderen">✕</button>
    `;
    container.appendChild(div);
  });
}

// --- 4. ENERGIE SELECTIE (VANDAAG TABBLAD) ---
function selectEnergy(el, energy) {
  document.querySelectorAll('.energy-btn').forEach(btn => btn.classList.remove('selected'));
  el.classList.add('selected');
  
  // Opslaan in localStorage voor de volgende stap
  localStorage.setItem('voldaan_today_energy', energy);
}

// --- INITIALISATIE BIJ OPSTARTEN ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderTasks();
});
