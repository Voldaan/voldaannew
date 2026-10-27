// js/modules/plannen.js
import { saveAppData, checkDateFilter } from './storage.js';

const PLAN_CATEGORIES = ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'];

export function initPlannenModule(appData) {
    const container = document.getElementById('plannen');
    if (!container) return;

    // Bouw de HTML structuur voor het Plannen tabblad
    container.innerHTML = `
        <!-- 1. Het Avond-Pact -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-bold text-indigo-900">🌙 Het Avond-Pact</h2>
                <button id="toggle-pact-archief" class="text-xs text-indigo-600 hover:underline font-medium">Archief</button>
            </div>
            <p class="text-sm text-gray-500 mb-4">Wat laat je vandaag achter zodat je morgen rustig start?</p>
            
            <form id="evening-pact-form" class="flex gap-2 mb-4">
                <input type="text" id="evening-pact-input" placeholder="Bijv. Loslaten wat vandaag niet af is..." class="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Vastleggen</button>
            </form>
            <ul id="evening-pact-list" class="space-y-2"></ul>
            <div id="pact-archief-box" class="hidden mt-4 pt-4 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-2 uppercase">Archief Avond-Pacten</h3>
                <ul id="pact-archief-list" class="space-y-1 text-xs text-gray-500"></ul>
            </div>
        </div>

        <!-- 2. Het Zachte Planbord -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-bold text-indigo-900">🎯 Het Zachte Planbord</h2>
                <button id="toggle-task-archief" class="text-xs text-indigo-600 hover:underline font-medium">Archief</button>
            </div>
            <p class="text-sm text-gray-500 mb-4">Zonder druk of schuldgevoel taken structureren op jouw tempo.</p>

            <!-- Formulier taak toevoegen -->
            <form id="task-form" class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <input type="text" id="task-input" placeholder="Nieuwe taak..." class="md:col-span-2 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <select id="task-category" class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                    ${PLAN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">+ Taak</button>
            </form>

            <!-- Zoek- en filterbalk -->
            <div class="flex flex-wrap gap-2 mb-4 items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input type="text" id="task-search" placeholder="Zoek taak..." class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl flex-1 min-w-[140px]">
                <select id="task-filter-cat" class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                    <option value="Alle">Alle categorieën</option>
                    ${PLAN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <select id="task-filter-date" class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                    <option value="all">Alles</option>
                    <option value="today">Vandaag</option>
                    <option value="week">Deze week</option>
                    <option value="month">Deze maand</option>
                </select>
            </div>

            <ul id="task-list" class="space-y-2 mb-4"></ul>
            <div id="task-archief-box" class="hidden mt-4 pt-4 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-2 uppercase">Archief Taken</h3>
                <ul id="task-archief-list" class="space-y-1 text-xs text-gray-500"></ul>
            </div>
        </div>

        <!-- 3. Het Zachte Kompas (Doelen) -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-lg font-bold text-indigo-900">🧭 Het Zachte Kompas</h2>
                <button id="toggle-goal-archief" class="text-xs text-indigo-600 hover:underline font-medium">Archief</button>
            </div>
            <p class="text-sm text-gray-500 mb-4">Langetermijn voornemens met een ingebouwd veiligheidsnet.</p>

            <form id="goal-form" class="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                <input type="text" id="goal-title" placeholder="Doel (bijv. 10 min gitaar)..." class="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <input type="text" id="goal-shield" placeholder="Zacht schild (als het tegenzit)..." class="px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">+ Doel</button>
            </form>

            <div id="goal-list" class="space-y-3"></div>
            <div id="goal-archief-box" class="hidden mt-4 pt-4 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-2 uppercase">Archief Doelen</h3>
                <ul id="goal-archief-list" class="space-y-1 text-xs text-gray-500"></ul>
            </div>
        </div>
    `;

    // Initialiseer functionaliteiten binnen deze module
    initEveningPactLogic(appData);
    initTaskLogic(appData);
    initGoalLogic(appData);
}

// --- LOGICA 1: AVOND-PACT ---
function initEveningPactLogic(appData) {
    const form = document.getElementById('evening-pact-form');
    const input = document.getElementById('evening-pact-input');
    const list = document.getElementById('evening-pact-list');
    const archiefBtn = document.getElementById('toggle-pact-archief');
    const archiefBox = document.getElementById('pact-archief-box');
    const archiefList = document.getElementById('pact-archief-list');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (text) {
            if (!appData.eveningPacts) appData.eveningPacts = [];
            appData.eveningPacts.push({ id: Date.now(), text, achieved: false, archived: false, date: new Date().toISOString() });
            saveAppData(appData);
            input.value = '';
            renderPacts();
        }
    });

    archiefBtn.addEventListener('click', () => archiefBox.classList.toggle('hidden'));

    function renderPacts() {
        const pacts = appData.eveningPacts || [];
        const active = pacts.filter(p => !p.archived);
        const archived = pacts.filter(p => p.archived);

        list.innerHTML = active.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen actief avond-pact.</p>' : active.map(p => `
            <li class="flex justify-between items-center p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl text-sm">
                <span>🌙 ${p.text}</span>
                <div class="flex gap-2">
                    <button onclick="window.archivePact(${p.id})" class="text-xs text-gray-400 hover:text-red-500">Archiveren</button>
                </div>
            </li>
        `).join('');

        archiefList.innerHTML = archived.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen gearchiveerde pacten.</p>' : archived.map(p => `
            <li class="flex justify-between items-center py-1">
                <span>${p.text}</span>
                <button onclick="window.restorePact(${p.id})" class="text-indigo-600 hover:underline">Terugzetten</button>
            </li>
        `).join('');
    }

    window.archivePact = (id) => {
        const p = appData.eveningPacts.find(x => x.id === id);
        if (p) { p.archived = true; saveAppData(appData); renderPacts(); }
    };
    window.restorePact = (id) => {
        const p = appData.eveningPacts.find(x => x.id === id);
        if (p) { p.archived = false; saveAppData(appData); renderPacts(); }
    };

    renderPacts();
}

// --- LOGICA 2: ZACHTE PLANBORD (TAKEN) ---
function initTaskLogic(appData) {
    const form = document.getElementById('task-form');
    const input = document.getElementById('task-input');
    const catSelect = document.getElementById('task-category');
    const list = document.getElementById('task-list');
    const searchInput = document.getElementById('task-search');
    const filterCat = document.getElementById('task-filter-cat');
    const filterDate = document.getElementById('task-filter-date');
    const archiefBtn = document.getElementById('toggle-task-archief');
    const archiefBox = document.getElementById('task-archief-box');
    const archiefList = document.getElementById('task-archief-list');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = input.value.trim();
        const category = catSelect.value;
        if (text) {
            if (!appData.tasks) appData.tasks = [];
            appData.tasks.push({ id: Date.now(), text, category, completed: false, archived: false, date: new Date().toISOString() });
            saveAppData(appData);
            input.value = '';
            renderTasks();
        }
    });

    searchInput.addEventListener('input', renderTasks);
    filterCat.addEventListener('change', renderTasks);
    filterDate.addEventListener('change', renderTasks);
    archiefBtn.addEventListener('click', () => archiefBox.classList.toggle('hidden'));

    function renderTasks() {
        const tasks = appData.tasks || [];
        const searchTerm = searchInput.value.toLowerCase();
        const selCat = filterCat.value;
        const selDate = filterDate.value;

        const active = tasks.filter(t => !t.archived);
        const filtered = active.filter(t => {
            const matchSearch = t.text.toLowerCase().includes(searchTerm);
            const matchCat = selCat === 'Alle' || t.category === selCat;
            const matchDate = checkDateFilter(t.date, selDate);
            return matchSearch && matchCat && matchDate;
        });

        list.innerHTML = filtered.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen taken gevonden.</p>' : filtered.map(t => `
            <li class="flex justify-between items-center p-3 border rounded-xl text-sm ${t.completed ? 'bg-gray-50 line-through text-gray-400' : 'bg-white text-gray-800 shadow-sm'}">
                <div>
                    <span class="text-xs font-bold text-indigo-700 mr-2">[${t.category}]</span>
                    <span>${t.text}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.toggleTask(${t.id})" class="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg">${t.completed ? 'Herstel' : 'Klaar ✨'}</button>
                    <button onclick="window.archiveTask(${t.id})" class="text-xs text-gray-400 hover:text-red-500">✕</button>
                </div>
            </li>
        `).join('');

        const archived = tasks.filter(t => t.archived);
        archiefList.innerHTML = archived.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen gearchiveerde taken.</p>' : archived.map(t => `
            <li class="flex justify-between items-center py-1">
                <span>${t.text}</span>
                <button onclick="window.restoreTask(${t.id})" class="text-indigo-600 hover:underline">Terugzetten</button>
            </li>
        `).join('');
    }

    window.toggleTask = (id) => {
        const t = appData.tasks.find(x => x.id === id);
        if (t) { t.completed = !t.completed; saveAppData(appData); renderTasks(); }
    };
    window.archiveTask = (id) => {
        const t = appData.tasks.find(x => x.id === id);
        if (t) { t.archived = true; saveAppData(appData); renderTasks(); }
    };
    window.restoreTask = (id) => {
        const t = appData.tasks.find(x => x.id === id);
        if (t) { t.archived = false; saveAppData(appData); renderTasks(); }
    };

    renderTasks();
}

// --- LOGICA 3: ZACHTE KOMPAS (DOELEN) ---
function initGoalLogic(appData) {
    const form = document.getElementById('goal-form');
    const titleInput = document.getElementById('goal-title');
    const shieldInput = document.getElementById('goal-shield');
    const list = document.getElementById('goal-list');
    const archiefBtn = document.getElementById('toggle-goal-archief');
    const archiefBox = document.getElementById('goal-archief-box');
    const archiefList = document.getElementById('goal-archief-list');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const shield = shieldInput.value.trim();
        if (title) {
            if (!appData.goals) appData.goals = [];
            appData.goals.push({ id: Date.now(), title, shield: shield || 'Geen zacht schild ingesteld', status: 'open', archived: false, date: new Date().toISOString() });
            saveAppData(appData);
            titleInput.value = '';
            shieldInput.value = '';
            renderGoals();
        }
    });

    archiefBtn.addEventListener('click', () => archiefBox.classList.toggle('hidden'));

    function renderGoals() {
        const goals = appData.goals || [];
        const active = goals.filter(g => !g.archived);

        list.innerHTML = active.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen langetermijn doelen ingesteld.</p>' : active.map(g => `
            <div class="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-indigo-950 text-sm">🎯 ${g.title}</span>
                    <button onclick="window.archiveGoal(${g.id})" class="text-xs text-gray-400 hover:text-red-500">Archiveren</button>
                </div>
                <p class="text-xs text-gray-500">🛡️ Zacht schild: ${g.shield}</p>
                <div class="flex gap-2 pt-1">
                    <button onclick="window.setGoalStatus(${g.id}, 'volledig')" class="px-2.5 py-1 text-xs rounded-lg ${g.status === 'volledig' ? 'bg-green-600 text-white' : 'bg-white border text-gray-700'}">Volledig ✨</button>
                    <button onclick="window.setGoalStatus(${g.id}, 'schild')" class="px-2.5 py-1 text-xs rounded-lg ${g.status === 'schild' ? 'bg-amber-600 text-white' : 'bg-white border text-gray-700'}">Zacht Schild</button>
                    <button onclick="window.setGoalStatus(${g.id}, 'rustdag')" class="px-2.5 py-1 text-xs rounded-lg ${g.status === 'rustdag' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}">Rustdag ☕</button>
                </div>
            </div>
        `).join('');

        const archived = goals.filter(g => g.archived);
        archiefList.innerHTML = archived.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen gearchiveerde doelen.</p>' : archived.map(g => `
            <li class="flex justify-between items-center py-1">
                <span>${g.title}</span>
                <button onclick="window.restoreGoal(${g.id})" class="text-indigo-600 hover:underline">Terugzetten</button>
            </li>
        `).join('');
    }

    window.setGoalStatus = (id, status) => {
        const g = appData.goals.find(x => x.id === id);
        if (g) { g.status = status; saveAppData(appData); renderGoals(); }
    };
    window.archiveGoal = (id) => {
        const g = appData.goals.find(x => x.id === id);
        if (g) { g.archived = true; saveAppData(appData); renderGoals(); }
    };
    window.restoreGoal = (id) => {
        const g = appData.goals.find(x => x.id === id);
        if (g) { g.archived = false; saveAppData(appData); renderGoals(); }
    };

    renderGoals();
}
