// js/modules/plannen.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe } from './storage.js';

const DEFAULT_PLAN_CATEGORIES = ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'];
const PRIORITIES = ['Laag', 'Normaal', 'Hoog'];

export function initPlannenModule(appData) {
    const container = document.getElementById('plannen');
    if (!container) return;

    if (!appData.plans) {
        appData.plans = { eveningPacts: [], tasks: [], goals: [], categories: [...DEFAULT_PLAN_CATEGORIES], archivedTasks: [], archivedPacts: [], archivedGoals: [] };
    }
    if (!appData.plans.categories) appData.plans.categories = [...DEFAULT_PLAN_CATEGORIES];

    container.innerHTML = `
        <!-- 1. Het Avond-Pact -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🌙 Het Avond-Pact</h2>
                <button id="toggle-pact-archief" class="text-xs text-indigo-600 hover:underline font-medium">Archief</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Wat laat je vandaag achter voor morgen?</p>
            
            <form id="evening-pact-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="evening-pact-input" placeholder="Bijv. Loslaten wat vandaag niet af is..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs" required>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Leg vast voor morgen 🌙</button>
            </form>
            <ul id="evening-pact-list" class="space-y-2"></ul>
            <div id="pact-archief-box" class="hidden mt-3 pt-3 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-2 uppercase">Archief Pacten</h3>
                <ul id="pact-archief-list" class="space-y-1 text-xs text-gray-500"></ul>
            </div>
        </div>

        <!-- 2. Het Zachte Planbord -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🎯 Het Zachte Planbord</h2>
                <div class="flex gap-2">
                    <button id="manage-plan-categories-btn" class="text-xs text-indigo-600 hover:underline">Categorieën</button>
                    <button id="toggle-task-archief" class="text-xs text-indigo-600 hover:underline font-medium">Archief</button>
                </div>
            </div>
            <p class="text-xs text-gray-500 mb-3">Taken structureren op jouw tempo.</p>

            <form id="task-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="task-input" placeholder="Nieuwe taak..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs" required>
                <div class="grid grid-cols-2 gap-2">
                    <select id="task-category" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"></select>
                    <select id="task-priority" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white">
                        ${PRIORITIES.map(p => `<option value="${p}">Prioriteit: ${p}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold">+ Taak Toevoegen</button>
            </form>

            <div class="flex flex-col gap-2 mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <input type="text" id="task-search" placeholder="Zoek taak..." class="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl">
                <div class="grid grid-cols-2 gap-2">
                    <select id="task-filter-cat" class="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                        <option value="Alle">Alle categorieën</option>
                    </select>
                    <select id="task-filter-date" class="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                        <option value="all">Alles</option>
                        <option value="today">Vandaag</option>
                        <option value="week">Deze week</option>
                        <option value="month">Deze maand</option>
                        <option value="year">Dit jaar</option>
                    </select>
                </div>
            </div>

            <ul id="task-list" class="space-y-2 mb-3"></ul>
            <div id="task-archief-box" class="hidden mt-3 pt-3 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-2 uppercase">Archief Taken</h3>
                <ul id="task-archief-list" class="space-y-1 text-xs text-gray-500"></ul>
            </div>
        </div>

        <!-- 3. Het Zachte Kompas -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🧭 Het Zachte Kompas</h2>
                <button id="toggle-goal-archief" class="text-xs text-indigo-600 hover:underline font-medium">Archief</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Langetermijn voornemens met een ingebouwd veiligheidsnet.</p>

            <form id="goal-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="goal-title" placeholder="Doel (bijv. 10 minuten gitaar)..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs" required>
                <input type="text" id="goal-shield" placeholder="Zacht schild (als het tegenzit)..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs">
                <select id="goal-priority" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white">
                    ${PRIORITIES.map(p => `<option value="${p}">Prioriteit: ${p}</option>`).join('')}
                </select>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold">+ Doel Toevoegen</button>
            </form>

            <div id="goal-list" class="space-y-3"></div>
            <div id="goal-archief-box" class="hidden mt-3 pt-3 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-2 uppercase">Archief Doelen</h3>
                <ul id="goal-archief-list" class="space-y-1 text-xs text-gray-500"></ul>
            </div>
        </div>
    `;

    initPlannenLogic(appData);
}

function initPlannenLogic(appData) {
    const plans = appData.plans;

    updateCategoryDropdowns(plans);

    document.getElementById('manage-plan-categories-btn').onclick = () => {
        const action = prompt("Wil je een categorie Toevoegen of Verwijderen? Typ 'toevoegen' of 'verwijderen':");
        if (action && action.toLowerCase() === 'toevoegen') {
            const cat = prompt("Naam van nieuwe categorie:");
            if (cat && !plans.categories.includes(cat)) {
                plans.categories.push(cat);
                saveAppData(appData);
                updateCategoryDropdowns(plans);
            }
        } else if (action && action.toLowerCase() === 'verwijderen') {
            const cat = prompt(`Welke categorie verwijderen? (${plans.categories.join(', ')})`);
            if (cat && plans.categories.includes(cat)) {
                plans.categories = plans.categories.filter(c => c !== cat);
                saveAppData(appData);
                updateCategoryDropdowns(plans);
            }
        }
    };

    const pactForm = document.getElementById('evening-pact-form');
    pactForm.onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('evening-pact-input').value.trim();
        if (text) {
            plans.eveningPacts.push({ id: Date.now(), text, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderPacts(appData);
        }
    };

    document.getElementById('toggle-pact-archief').onclick = () => {
        document.getElementById('pact-archief-box').classList.toggle('hidden');
    };

    const taskForm = document.getElementById('task-form');
    taskForm.onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('task-input').value.trim();
        const category = document.getElementById('task-category').value;
        const priority = document.getElementById('task-priority').value;
        if (text) {
            plans.tasks.push({ id: Date.now(), text, category, priority, completed: false, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderTasks(appData);
        }
    };

    document.getElementById('task-search').oninput = () => renderTasks(appData);
    document.getElementById('task-filter-cat').onchange = () => renderTasks(appData);
    document.getElementById('task-filter-date').onchange = () => renderTasks(appData);
    document.getElementById('toggle-task-archief').onclick = () => {
        document.getElementById('task-archief-box').classList.toggle('hidden');
    };

    const goalForm = document.getElementById('goal-form');
    goalForm.onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('goal-title').value.trim();
        const shield = document.getElementById('goal-shield').value.trim();
        const priority = document.getElementById('goal-priority').value;
        if (title) {
            plans.goals.push({ id: Date.now(), title, shield: shield || 'Geen schild opgegeven', priority, status: 'open', date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderGoals(appData);
        }
    };

    document.getElementById('toggle-goal-archief').onclick = () => {
        document.getElementById('goal-archief-box').classList.toggle('hidden');
    };

    renderPacts(appData);
    renderTasks(appData);
    renderGoals(appData);
}

function updateCategoryDropdowns(plans) {
    const taskCat = document.getElementById('task-category');
    const filterCat = document.getElementById('task-filter-cat');
    if (!taskCat || !filterCat) return;

    const cats = plans.categories || DEFAULT_PLAN_CATEGORIES;
    taskCat.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    filterCat.innerHTML = `<option value="Alle">Alle categorieën</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderPacts(appData) {
    const plans = appData.plans;
    const list = document.getElementById('evening-pact-list');
    const archiefList = document.getElementById('pact-archief-list');

    const active = plans.eveningPacts || [];
    const archived = plans.archivedPacts || [];

    list.innerHTML = active.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen actief avond-pact.</p>' : active.map(p => `
        <li class="flex justify-between items-center p-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs">
            <span>🌙 ${p.text}</span>
            <div class="flex gap-2">
                <button onclick="window.archivePact(${p.id})" class="text-indigo-600 hover:underline font-semibold">Archiveren</button>
                <button onclick="window.deletePact(${p.id})" class="text-gray-300 hover:text-red-500 font-bold">✕</button>
            </div>
        </li>
    `).join('');

    archiefList.innerHTML = archived.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen archief.</p>' : archived.map(p => `
        <li class="flex justify-between items-center py-1"><span>${p.text}</span><button onclick="window.restorePact(${p.id})" class="text-indigo-600 font-semibold">Terugzetten</button></li>
    `).join('');

    window.archivePact = (id) => {
        const item = plans.eveningPacts.find(x => x.id === id);
        if (item) {
            plans.eveningPacts = plans.eveningPacts.filter(x => x.id !== id);
            plans.archivedPacts.push(item);
            saveAppData(appData);
            renderPacts(appData);
        }
    };
    window.restorePact = (id) => {
        const item = plans.archivedPacts.find(x => x.id === id);
        if (item) {
            plans.archivedPacts = plans.archivedPacts.filter(x => x.id !== id);
            plans.eveningPacts.push(item);
            saveAppData(appData);
            renderPacts(appData);
        }
    };
    window.deletePact = (id) => {
        plans.eveningPacts = plans.eveningPacts.filter(x => x.id !== id);
        saveAppData(appData);
        renderPacts(appData);
    };
}

function renderTasks(appData) {
    const plans = appData.plans;
    const list = document.getElementById('task-list');
    const archiefList = document.getElementById('task-archief-list');
    const searchVal = document.getElementById('task-search').value.toLowerCase();
    const catVal = document.getElementById('task-filter-cat').value;
    const dateVal = document.getElementById('task-filter-date').value;

    const tasks = (plans.tasks || []).filter(t => {
        const matchSearch = t.text.toLowerCase().includes(searchVal);
        const matchCat = catVal === 'Alle' || t.category === catVal;
        const matchDate = checkDateFilter(t.date, dateVal);
        return matchSearch && matchCat && matchDate;
    });

    list.innerHTML = tasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen taken gevonden.</p>' : tasks.slice(-15).reverse().map(t => `
        <li class="flex justify-between items-center p-2.5 border rounded-xl text-xs ${t.completed ? 'bg-gray-50 line-through text-gray-400' : 'bg-white text-gray-800 shadow-sm'}">
            <div>
                <span class="font-bold text-indigo-700 mr-1">[${t.category}]</span> 
                <span>${t.text}</span>
                <span class="text-[10px] text-gray-400 block">Prioriteit: ${t.priority || 'Normaal'}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="window.toggleTaskComplete(${t.id})" class="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-semibold">${t.completed ? 'Herstel' : 'Klaar ✨'}</button>
                <button onclick="window.archiveTask(${t.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </li>
    `).join('');

    const archived = plans.archivedTasks || [];
    archiefList.innerHTML = archived.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen archief.</p>' : archived.map(t => `
        <li class="flex justify-between items-center py-1"><span>${t.text}</span><button onclick="window.restoreTask(${t.id})" class="text-indigo-600 font-semibold">Terugzetten</button></li>
    `).join('');

    window.toggleTaskComplete = (id) => {
        const t = plans.tasks.find(x => x.id === id);
        if (t) {
            t.completed = !t.completed;
            if (t.completed) {
                voegTrotsKnikkerToe(appData, `Taak volbracht: ${t.text}`, t.category || 'Taken');
            }
            saveAppData(appData);
            renderTasks(appData);
        }
    };
    window.archiveTask = (id) => {
        const t = plans.tasks.find(x => x.id === id);
        if (t) {
            plans.tasks = plans.tasks.filter(x => x.id !== id);
            plans.archivedTasks.push(t);
            saveAppData(appData);
            renderTasks(appData);
        }
    };
    window.restoreTask = (id) => {
        const t = plans.archivedTasks.find(x => x.id === id);
        if (t) {
            plans.archivedTasks = plans.archivedTasks.filter(x => x.id !== id);
            plans.tasks.push(t);
            saveAppData(appData);
            renderTasks(appData);
        }
    };
}

function renderGoals(appData) {
    const plans = appData.plans;
    const list = document.getElementById('goal-list');
    const archiefList = document.getElementById('goal-archief-list');

    const goals = plans.goals || [];
    const archived = plans.archivedGoals || [];

    list.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen doelen ingesteld.</p>' : goals.map(g => `
        <div class="p-3.5 bg-gray-50 border border-gray-100 rounded-xl space-y-2 text-xs">
            <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-950">🎯 ${g.title}</span>
                <button onclick="window.archiveGoal(${g.id})" class="text-gray-400 hover:text-red-500 font-bold px-1">Archiveren</button>
            </div>
            <p class="text-gray-500">🛡️ Veiligheidsschild: ${g.shield}</p>
            <div class="flex gap-1.5 pt-1">
                <button onclick="window.setGoalStatus(${g.id}, 'volledig')" class="px-2 py-1 text-[11px] rounded-lg ${g.status === 'volledig' ? 'bg-green-600 text-white' : 'bg-white border text-gray-700'}">Volledig ✨</button>
                <button onclick="window.setGoalStatus(${g.id}, 'schild')" class="px-2 py-1 text-[11px] rounded-lg ${g.status === 'schild' ? 'bg-amber-600 text-white' : 'bg-white border text-gray-700'}">Schild</button>
                <button onclick="window.setGoalStatus(${g.id}, 'rustdag')" class="px-2 py-1 text-[11px] rounded-lg ${g.status === 'rustdag' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}">Rustdag ☕</button>
            </div>
        </div>
    `).join('');

    archiefList.innerHTML = archived.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen archief.</p>' : archived.map(g => `
        <li class="flex justify-between items-center py-1"><span>${g.title}</span><button onclick="window.restoreGoal(${g.id})" class="text-indigo-600 font-semibold">Terugzetten</button></li>
    `).join('');

    window.setGoalStatus = (id, status) => {
        const g = plans.goals.find(x => x.id === id);
        if (g) {
            g.status = status;
            if (status === 'volledig') {
                voegTrotsKnikkerToe(appData, `Doel volbracht: ${g.title}`, 'Doelen');
            }
            saveAppData(appData);
            renderGoals(appData);
        }
    };
    window.archiveGoal = (id) => {
        const g = plans.goals.find(x => x.id === id);
        if (g) {
            plans.goals = plans.goals.filter(x => x.id !== id);
            plans.archivedGoals.push(g);
            saveAppData(appData);
            renderGoals(appData);
        }
    };
    window.restoreGoal = (id) => {
        const g = plans.archivedGoals.find(x => x.id === id);
        if (g) {
            plans.archivedGoals = plans.archivedGoals.filter(x => x.id !== id);
            plans.goals.push(g);
            saveAppData(appData);
            renderGoals(appData);
        }
    };
}
