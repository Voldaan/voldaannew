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

  if (viewName === 'plan') {
    renderTasks();
  }
  if (viewName === 'vitality') {
    renderHabits();
    renderSnacks();
  }
  if (viewName === 'money') {
    renderMoney();
  }
  if (viewName === 'ideas') {
    renderIdeas();
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

// --- 3. ZACHT PLANBORD & TAKEN LOGICA ---
let currentTaskFilter = 'all';

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
    if (task.done) {
      addMarble(`Taak volbracht: "${task.text}"`, 'Planbord');
    }
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

function setTaskFilter(filter) {
  currentTaskFilter = filter;
  document.querySelectorAll('#view-plan .tab-btn').forEach(btn => btn.classList.remove('active'));
  const filterBtn = document.getElementById(`filter-${filter}`);
  if (filterBtn) filterBtn.classList.add('active');
  renderTasks();
}

function renderTasks() {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  const container = document.getElementById('tasks-list');
  
  if (!container) return;
  container.innerHTML = '';

  let filteredTasks = tasks.filter(t => {
    if (currentTaskFilter === 'active') return !t.done;
    if (currentTaskFilter === 'done') return t.done;
    return true;
  });

  if (filteredTasks.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted); text-align:center; padding: 10px; display:block;">Geen taken in deze categorie. Rustig aan! 🎉</span>';
    return;
  }

  filteredTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = `item-card ${task.done ? 'done' : ''}`;
    div.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; flex: 1; cursor: pointer;" onclick="toggleTask(${task.id})">
        <span style="font-size: 1.1rem;">${task.done ? '✅' : '⚪'}</span>
        <div>
          <span style="${task.done ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${task.text}</span>
          <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">Aangemaakt: ${task.created}</span>
        </div>
      </div>
      <button style="background:none; border:none; color:#E53E3E; cursor:pointer; font-size: 0.9rem; padding: 4px;" onclick="removeTask(${task.id})" title="Verwijderen">✕</button>
    `;
    container.appendChild(div);
  });
}

// --- 4. VITALITEIT & GEWOONTES LOGICA ---
function getTodayKey() {
  return new Date().toISOString().split('T')[0];
}

function toggleHabit(habitName) {
  let habits = JSON.parse(localStorage.getItem('voldaan_habits') || '{}');
  const today = getTodayKey();
  
  if (!habits[today]) habits[today] = {};
  habits[today][habitName] = !habits[today][habitName];

  if (habits[today][habitName]) {
    addMarble(`Balans-stempel: ${habitName}`, 'Vitaliteit');
  }

  localStorage.setItem('voldaan_habits', JSON.stringify(habits));
  renderHabits();
}

function renderHabits() {
  const habits = JSON.parse(localStorage.getItem('voldaan_habits') || '{}');
  const today = getTodayKey();
  const todayHabits = habits[today] || {};

  const habitList = ['water', 'walk', 'screen', 'rest'];
  habitList.forEach(h => {
    const btn = document.getElementById(`habit-${h}`);
    if (btn) {
      if (todayHabits[h]) {
        btn.classList.add('completed');
      } else {
        btn.classList.remove('completed');
      }
    }
  });
}

function addSnackWait() {
  const input = document.getElementById('snack-input');
  if (!input || !input.value.trim()) return;

  let snacks = JSON.parse(localStorage.getItem('voldaan_snacks') || '[]');
  snacks.unshift({
    id: Date.now(),
    text: input.value.trim(),
    time: new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
  });

  localStorage.setItem('voldaan_snacks', JSON.stringify(snacks));
  input.value = '';
  renderSnacks();
}

function removeSnack(id) {
  let snacks = JSON.parse(localStorage.getItem('voldaan_snacks') || '[]');
  snacks = snacks.filter(s => s.id !== id);
  localStorage.setItem('voldaan_snacks', JSON.stringify(snacks));
  renderSnacks();
}

function renderSnacks() {
  let snacks = JSON.parse(localStorage.getItem('voldaan_snacks') || '[]');
  const container = document.getElementById('snack-list');
  
  if (!container) return;
  container.innerHTML = '';

  if (snacks.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted); text-align:center; padding: 10px; display:block;">Geen verleidingen in de wachtkamer. Goed bezig! 🌟</span>';
    return;
  }

  snacks.forEach(snack => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <span>🍪 ${snack.text}</span>
        <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">In de wacht gezet om ${snack.time}</span>
      </div>
      <button style="background:none; border:none; color:#E53E3E; cursor:pointer; font-size: 0.9rem; padding: 4px;" onclick="removeSnack(${snack.id})" title="Verwijderen">✕</button>
    `;
    container.appendChild(div);
  });
}

// --- 5. GELD-KOMPAS LOGICA ---
function openBalanceModal() {
  const newBalance = prompt('Voer je huidige banksaldo in (bijv. 1250.50):');
  if (newBalance !== null && !isNaN(parseFloat(newBalance))) {
    localStorage.setItem('voldaan_balance', parseFloat(newBalance).toFixed(2));
    renderMoney();
  }
}

function addTransaction() {
  const descInput = document.getElementById('tx-desc');
  const amountInput = document.getElementById('tx-amount');
  const typeSelect = document.getElementById('tx-type');

  if (!descInput || !amountInput || !descInput.value.trim() || !amountInput.value) return;

  const desc = descInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const type = typeSelect.value;

  let transactions = JSON.parse(localStorage.getItem('voldaan_transactions') || '[]');
  let currentBalance = parseFloat(localStorage.getItem('voldaan_balance') || '0');

  if (type === 'income') {
    currentBalance += amount;
  } else {
    currentBalance -= amount;
  }

  transactions.unshift({
    id: Date.now(),
    desc: desc,
    amount: amount,
    type: type,
    date: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  });

  localStorage.setItem('voldaan_balance', currentBalance.toFixed(2));
  localStorage.setItem('voldaan_transactions', JSON.stringify(transactions));

  descInput.value = '';
  amountInput.value = '';
  renderMoney();
}

function removeTransaction(id) {
  let transactions = JSON.parse(localStorage.getItem('voldaan_transactions') || '[]');
  const tx = transactions.find(t => t.id === id);
  
  if (tx) {
    let currentBalance = parseFloat(localStorage.getItem('voldaan_balance') || '0');
    if (tx.type === 'income') {
      currentBalance -= tx.amount;
    } else {
      currentBalance += tx.amount;
    }

    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('voldaan_balance', currentBalance.toFixed(2));
    localStorage.setItem('voldaan_transactions', JSON.stringify(transactions));
    renderMoney();
  }
}

function renderMoney() {
  const balance = parseFloat(localStorage.getItem('voldaan_balance') || '0');
  const balanceDisplay = document.getElementById('money-balance-display');
  if (balanceDisplay) {
    balanceDisplay.innerText = `€ ${balance.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  let transactions = JSON.parse(localStorage.getItem('voldaan_transactions') || '[]');
  const container = document.getElementById('transactions-list');
  if (!container) return;

  container.innerHTML = '';

  if (transactions.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted); text-align:center; padding: 10px; display:block;">Nog geen transacties ingevoerd. Rustig overzicht! 💶</span>';
    return;
  }

  transactions.forEach(tx => {
    const isIncome = tx.type === 'income';
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <span style="font-weight: 500;">${isIncome ? '➕' : '➖'} ${tx.desc}</span>
        <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">${tx.date}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-weight: 600; color: ${isIncome ? '#38A169' : '#E53E3E'};">
          ${isIncome ? '+' : '-'} € ${tx.amount.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <button style="background:none; border:none; color:#E53E3E; cursor:pointer; font-size: 0.9rem; padding: 4px;" onclick="removeTransaction(${tx.id})" title="Verwijderen">✕</button>
      </div>
    `;
    container.appendChild(div);
  });
}

// --- 6. IDEEËNKLUIS LOGICA ---
function addIdea() {
  const input = document.getElementById('idea-input');
  if (!input || !input.value.trim()) return;

  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  ideas.unshift({
    id: Date.now(),
    text: input.value.trim(),
    date: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  });

  localStorage.setItem('voldaan_ideas', JSON.stringify(ideas));
  input.value = '';
  renderIdeas();
}

function removeIdea(id) {
  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  ideas = ideas.filter(i => i.id !== id);
  localStorage.setItem('voldaan_ideas', JSON.stringify(ideas));
  renderIdeas();
}

function renderIdeas() {
  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  const container = document.getElementById('ideas-list');
  
  if (!container) return;
  container.innerHTML = '';

  if (ideas.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted); text-align:center; padding: 10px; display:block;">Nog geen ideeën opgeslagen. Leeg hoofd! 📌</span>';
    return;
  }

  ideas.forEach(idea => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <span>💡 ${idea.text}</span>
        <span style="font-size: 0.7rem; color: var(--text-muted); display: block; margin-top: 2px;">Opgeslagen: ${idea.date}</span>
      </div>
      <button style="background:none; border:none; color:#E53E3E; cursor:pointer; font-size: 0.9rem; padding: 4px;" onclick="removeIdea(${idea.id})" title="Verwijderen">✕</button>
    `;
    container.appendChild(div);
  });
}

// --- 7. ENERGIE SELECTIE (VANDAAG TABBLAD) ---
function selectEnergy(el, energy) {
  document.querySelectorAll('.energy-btn').forEach(btn => btn.classList.remove('selected'));
  el.classList.add('selected');
  localStorage.setItem('voldaan_today_energy', energy);
}

// --- 8. DE TROTS-KLUIS LOGICA ---
const marbleColors = ['#5A67D8', '#38A169', '#ED8936', '#9F7AEA', '#E53E3E', '#319795', '#D69E2E', '#ED64A6'];

function addMarble(reason, category = 'Algemeen') {
  let marbles = JSON.parse(localStorage.getItem('voldaan_marbles') || '[]');
  const randomColor = marbleColors[Math.floor(Math.random() * marbleColors.length)];
  const now = new Date();
  
  marbles.push({
    id: Date.now(),
    color: randomColor,
    reason: reason || 'Kleine zege',
    category: category || 'Algemeen',
    date: new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    timestamp: now.getTime()
  });
  
  localStorage.setItem('voldaan_marbles', JSON.stringify(marbles));
  renderMarbleJar();
}

function renderMarbleJar() {
  let marbles = JSON.parse(localStorage.getItem('voldaan_marbles') || '[]');
  const container = document.getElementById('marble-jar-visual');
  const badge = document.getElementById('marble-count-badge');
  
  if (!container || !badge) return;

  badge.innerText = `${marbles.length} Knikker${marbles.length === 1 ? '' : 's'}`;
  container.innerHTML = '<div style="position: absolute; top: 10px; left: 12px; width: 12px; height: 140px; background: linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.05)); border-radius: 6px; pointer-events: none; z-index: 2;"></div>';

  if (marbles.length === 0) return;

  const marbleStyles = [
    'radial-gradient(circle at 35% 35%, #ffeaa7, #fdcb6e, #d35400)',
    'radial-gradient(circle at 35% 35%, #ff7675, #d63031, #801414)',
    'radial-gradient(circle at 35% 35%, #74b9ff, #0984e3, #093463)',
    'radial-gradient(circle at 35% 35%, #55efc4, #00b894, #004d3c)',
    'radial-gradient(circle at 35% 35%, #a29bfe, #6c5ce7, #3b289a)'
  ];

  marbles.forEach((m, index) => {
    const div = document.createElement('div');
    div.className = 'marble-3d';
    div.style.background = marbleStyles[index % marbleStyles.length];
    div.title = `[${m.category}] ${m.reason} (${m.date})`;
    container.appendChild(div);
  });
}

// --- INITIALISATIE BIJ OPSTARTEN ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderTasks();
  renderMarbleJar();
  renderHabits();
  renderSnacks();
  renderMoney();
  renderIdeas();
});
