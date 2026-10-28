// js/modules/plannen.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

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
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🌙 Het Avond-Pact</h2>
                <button id="open-pact-beheer-modal" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition">Beheer & Archief</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Wat laat je vandaag achter voor morgen?</p>
            
            <form id="evening-pact-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="evening-pact-input" placeholder="Bijv. Loslaten wat vandaag niet af is..." class="w-full px-3 py-2.5 border rounded-xl text-xs" required>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">Leg vast voor morgen 🌙</button>
            </form>
            <ul id="evening-pact-list" class="space-y-2"></ul>
        </div>

        <!-- 2. Het Zachte Planbord -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🎯 Het Zachte Planbord</h2>
                <button id="open-plan-beheer-modal" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Taken structureren op jouw tempo.</p>
            
            <form id="task-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="task-input" placeholder="Nieuwe taak..." class="w-full px-3 py-2.5 border rounded-xl text-xs" required>
                <div class="grid grid-cols-2 gap-2">
                    <select id="task-category" class="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-white"></select>
                    <select id="task-priority" class="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-white">
                        ${PRIORITIES.map(p => `<option value="${p}">Prioriteit: ${p}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Taak Toevoegen</button>
            </form>

            <!-- Subtiele inklapbare zoek & filter balk -->
            <details class="mb-3 bg-gray-50 p-2.5 rounded-xl border text-xs">
                <summary class="font-semibold text-indigo-900 cursor-pointer select-none">🔍 Zoeken & Uitgebreide Filters</summary>
                <div class="mt-2 space-y-2 pt-2 border-t border-gray-200">
                    <input type="text" id="task-search" placeholder="Zoek taak..." class="w-full px-3 py-1.5 bg-white border rounded-xl">
                    <div class="grid grid-cols-2 gap-2">
                        <select id="task-filter-cat" class="px-2 py-1.5 bg-white border rounded-xl">
                            <option value="Alle">Alle categorieën</option>
                        </select>
                        <select id="task-filter-date" class="px-2 py-1.5 bg-white border rounded-xl">
                            <option value="all">Alle data</option>
                            <option value="today">Vandaag</option>
                            <option value="week">Deze week</option>
                            <option value="specific-week">Specifieke week...</option>
                            <option value="month">Deze maand</option>
                            <option value="specific-month">Specifieke maand...</option>
                            <option value="year">Dit jaar</option>
                            <option value="specific-year">Specifiek jaar...</option>
                            <option value="specific-day">Specifieke dag...</option>
                        </select>
                    </div>
                    <div id="task-custom-filter-box" class="hidden">
                        <input type="date" id="task-custom-date" class="w-full px-2.5 py-1.5 bg-white border rounded-xl hidden">
                        <input type="month" id="task-custom-month" class="w-full px-2.5 py-1.5 bg-white border rounded-xl hidden">
                        <input type="number" id="task-custom-year" placeholder="Bijv. 2026" class="w-full px-2.5 py-1.5 bg-white border rounded-xl hidden">
                        <input type="week" id="task-custom-week" class="w-full px-2.5 py-1.5 bg-white border rounded-xl hidden">
                    </div>
                </div>
            </details>

            <ul id="task-list" class="space-y-2 mb-2"></ul>
            <div id="task-expand-toggle-container" class="text-center"></div>
        </div>

        <!-- 3. Het Zachte Kompas -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🧭 Het Zachte Kompas</h2>
                <button id="open-goal-beheer-modal" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition">Beheer & Archief</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Langetermijn voornemens met een ingebouwd veiligheidsnet.</p>
            <form id="goal-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="goal-title" placeholder="Doel (bijv. 10 minuten gitaar)..." class="w-full px-3 py-2.5 border rounded-xl text-xs" required>
                <input type="text" id="goal-shield" placeholder="Zacht schild (als het tegenzit)..." class="w-full px-3 py-2.5 border rounded-xl text-xs">
                <select id="goal-priority" class="w-full px-2.5 py-1.5 border rounded-xl text-xs bg-white">
                    ${PRIORITIES.map(p => `<option value="${p}">Prioriteit: ${p}</option>`).join('')}
                </select>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">+ Doel Toevoegen</button>
            </form>
            <div id="goal-list" class="space-y-3"></div>
        </div>
    `;

    initPlannenModals(appData);
    initPlannenLogic(appData);
}

function initPlannenModals(appData) {
    const planBeheerModalHTML = `
        <div id="plan-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer Planbord, Categorieën & Archief</h3>
                    <button id="close-plan-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <div class="space-y-3">
                    <div>
                        <p class="font-bold text-indigo-900 mb-1">Categorieën Beheren</p>
                        <div class="flex gap-2 mb-2">
                            <input type="text" id="modal-new-cat" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 border rounded-xl">
                            <button id="modal-add-cat-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen</button>
                        </div>
                        <div id="modal-cat-chips" class="flex flex-wrap gap-1.5"></div>
                    </div>
                    <div class="pt-3 border-t">
                        <p class="font-bold text-indigo-900 mb-1">Archief Voltooide Taken</p>
                        <ul id="modal-task-archief-list" class="space-y-1 text-gray-600 max-h-40 overflow-y-auto"></ul>
                    </div>
                </div>
            </div>
        </div>
    `;

    const editTaskModalHTML = `
        <div id="edit-task-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">✏️ Taak Bewerken</h3>
                    <button id="close-edit-task-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="edit-task-form" class="space-y-3">
                    <input type="hidden" id="edit-task-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Taakomschrijving</label>
                        <textarea id="edit-task-text" rows="3" class="w-full px-3 py-2 border rounded-xl" required></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                            <select id="edit-task-cat" class="w-full px-2.5 py-2 border rounded-xl bg-white"></select>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Prioriteit</label>
                            <select id="edit-task-prio" class="w-full px-2.5 py-2 border rounded-xl bg-white">
                                ${PRIORITIES.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-edit-task" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', planBeheerModalHTML + editTaskModalHTML);

    const modal = document.getElementById('plan-beheer-modal');
    document.getElementById('open-plan-beheer-modal').onclick = () => {
        modal.classList.remove('hidden');
        renderPlanBeheerModal(appData);
    };
    document.getElementById('close-plan-beheer').onclick = () => modal.classList.add('hidden');

    const editModal = document.getElementById('edit-task-modal');
    document.getElementById('close-edit-task-modal').onclick = () => editModal.classList.add('hidden');
    document.getElementById('cancel-edit-task').onclick = () => editModal.classList.add('hidden');

    document.getElementById('edit-task-form').onsubmit = (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-task-id').value);
        const text = document.getElementById('edit-task-text').value.trim();
        const category = document.getElementById('edit-task-cat').value;
        const priority = document.getElementById('edit-task-prio').value;

        const t = appData.plans.tasks.find(x => x.id === id);
        if (t && text) {
            t.text = text;
            t.category = category;
            t.priority = priority;
            saveAppData(appData);
            editModal.classList.add('hidden');
            renderTasks(appData);
            showToast("Taak bijgewerkt! ✏️");
        }
    };
}

function renderPlanBeheerModal(appData) {
    const chipsContainer = document.getElementById('modal-cat-chips');
    const archiefContainer = document.getElementById('modal-task-archief-list');
    const cats = appData.plans.categories || DEFAULT_PLAN_CATEGORIES;

    chipsContainer.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 font-medium">
            ${c} ${cats.length > 1 ? `<button onclick="window.removePlanCat('${c}')" class="text-red-500 font-bold ml-1">✕</button>` : ''}
        </span>
    `).join('');

    window.removePlanCat = (catName) => {
        appData.plans.categories = appData.plans.categories.filter(c => c !== catName);
        saveAppData(appData);
        updateCategoryDropdowns(appData.plans);
        renderPlanBeheerModal(appData);
    };

    document.getElementById('modal-add-cat-btn').onclick = () => {
        const input = document.getElementById('modal-new-cat');
        const val = input.value.trim();
        if (val && !cats.includes(val)) {
            cats.push(val);
            saveAppData(appData);
            updateCategoryDropdowns(appData.plans);
            renderPlanBeheerModal(appData);
            input.value = '';
        }
    };

    const archived = (appData.plans.archivedTasks || []).concat((appData.plans.tasks || []).filter(t => t.completed || t.archived));
    archiefContainer.innerHTML = archived.length === 0 ? '<p class="italic text-gray-400">Geen gearchiveerde taken.</p>' : archived.map(t => `
        <li class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span class="line-through text-gray-500">${t.text}</span>
            <div class="flex gap-2">
                <button onclick="window.restoreTaskModal(${t.id})" class="text-indigo-600 font-semibold">Terugzetten</button>
                <button onclick="window.definitelyDeleteTask(${t.id})" class="text-red-500 font-semibold">Verwijderen</button>
            </div>
        </li>
    `).join('');

    window.restoreTaskModal = (id) => {
        let t = (appData.plans.archivedTasks || []).find(x => x.id === id);
        if (!t) {
            t = appData.plans.tasks.find(x => x.id === id);
            appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
        } else {
            appData.plans.archivedTasks = appData.plans.archivedTasks.filter(x => x.id !== id);
        }
        if (t) {
            t.completed = false;
            t.archived = false;
            appData.plans.tasks.push(t);
            saveAppData(appData);
            renderPlanBeheerModal(appData);
            renderTasks(appData);
        }
    };

    window.definitelyDeleteTask = (id) => {
        appData.plans.archivedTasks = (appData.plans.archivedTasks || []).filter(x => x.id !== id);
        appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlanBeheerModal(appData);
        renderTasks(appData);
        showToast("Taak definitief verwijderd.");
    };
}

function initPlannenLogic(appData) {
    const plans = appData.plans;
    updateCategoryDropdowns(plans);

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

    const dateFilterSelect = document.getElementById('task-filter-date');
    const customBox = document.getElementById('task-custom-filter-box');
    const dateInput = document.getElementById('task-custom-date');
    const monthInput = document.getElementById('task-custom-month');
    const yearInput = document.getElementById('task-custom-year');
    const weekInput = document.getElementById('task-custom-week');

    dateFilterSelect.onchange = () => {
        customBox.classList.add('hidden');
        dateInput.classList.add('hidden');
        monthInput.classList.add('hidden');
        yearInput.classList.add('hidden');
        weekInput.classList.add('hidden');

        if (dateFilterSelect.value.startsWith('specific-')) {
            customBox.classList.remove('hidden');
            if (dateFilterSelect.value === 'specific-day') dateInput.classList.remove('hidden');
            if (dateFilterSelect.value === 'specific-month') monthInput.classList.remove('hidden');
            if (dateFilterSelect.value === 'specific-year') yearInput.classList.remove('hidden');
            if (dateFilterSelect.value === 'specific-week') weekInput.classList.remove('hidden');
        }
        renderTasks(appData);
    };

    [dateInput, monthInput, yearInput, weekInput].forEach(inp => inp.onchange = () => renderTasks(appData));
    yearInput.oninput = () => renderTasks(appData);

    renderPacts(appData);
    renderTasks(appData);
    renderGoals(appData);
}

function updateCategoryDropdowns(plans) {
    const taskCat = document.getElementById('task-category');
    const filterCat = document.getElementById('task-filter-cat');
    const editTaskCat = document.getElementById('edit-task-cat');
    if (!taskCat || !filterCat) return;

    const cats = plans.categories || DEFAULT_PLAN_CATEGORIES;
    taskCat.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    filterCat.innerHTML = `<option value="Alle">Alle categorieën</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    if (editTaskCat) {
        editTaskCat.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

function renderPacts(appData) {
    const plans = appData.plans;
    const list = document.getElementById('evening-pact-list');
    const active = plans.eveningPacts || [];
    
    list.innerHTML = active.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen actief avond-pact.</p>' : active.slice(0, 5).map(p => `
        <li class="flex justify-between items-center p-2.5 bg-indigo-50/50 border rounded-xl text-xs">
            <span>🌙 ${p.text}</span>
            <button onclick="window.archivePact(${p.id})" class="text-indigo-600 hover:underline font-semibold">Archiveren</button>
        </li>
    `).join('');

    window.archivePact = (id) => {
        const item = plans.eveningPacts.find(x => x.id === id);
        if (item) {
            plans.eveningPacts = plans.eveningPacts.filter(x => x.id !== id);
            if (!plans.archivedPacts) plans.archivedPacts = [];
            plans.archivedPacts.push(item);
            saveAppData(appData);
            renderPacts(appData);
        }
    };
}

let showAllTasks = false;

function renderTasks(appData) {
    const plans = appData.plans;
    const list = document.getElementById('task-list');
    const toggleContainer = document.getElementById('task-expand-toggle-container');
    const searchVal = document.getElementById('task-search').value.toLowerCase();
    const catVal = document.getElementById('task-filter-cat').value;
    const dateVal = document.getElementById('task-filter-date').value;

    let customVal = null;
    if (dateVal === 'specific-day') customVal = document.getElementById('task-custom-date').value;
    if (dateVal === 'specific-month') customVal = document.getElementById('task-custom-month').value;
    if (dateVal === 'specific-year') customVal = document.getElementById('task-custom-year').value;
    if (dateVal === 'specific-week') customVal = document.getElementById('task-custom-week').value;

    const tasks = (plans.tasks || []).filter(t => {
        const matchSearch = t.text.toLowerCase().includes(searchVal);
        const matchCat = catVal === 'Alle' || t.category === catVal;
        const matchDate = checkDateFilter(t.date, dateVal, customVal);
        return matchSearch && matchCat && !t.completed && !t.archived;
    });

    const displayTasks = showAllTasks ? tasks.slice().reverse() : tasks.slice(-5).reverse();

    list.innerHTML = displayTasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken gevonden.</p>' : displayTasks.map(t => `
        <li onclick="window.openEditTaskModal(${t.id})" class="flex justify-between items-center p-3 border rounded-xl text-xs bg-white shadow-sm cursor-pointer hover:bg-gray-50/80 transition">
            <div>
                <span class="font-bold text-indigo-700 mr-1">[${t.category}]</span> 
                <span class="text-gray-800 text-sm font-medium">${t.text}</span>
                <span class="text-[10px] text-gray-400 block mt-0.5">⏱️ ${new Date(t.date).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })} • Prioriteit: ${t.priority || 'Normaal'}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="event.stopPropagation(); window.toggleTaskComplete(${t.id})" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">Klaar ✨</button>
                <button onclick="event.stopPropagation(); window.archiveTask(${t.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </li>
    `).join('');

    if (tasks.length > 5) {
        toggleContainer.innerHTML = `<button onclick="window.toggleShowAllTasks()" class="text-xs text-indigo-600 font-semibold underline mt-1">${showAllTasks ? 'Minder weergeven (max 5)' : `Alles weergeven (${tasks.length} taken)`}</button>`;
    } else {
        toggleContainer.innerHTML = '';
    }

    window.toggleShowAllTasks = () => {
        showAllTasks = !showAllTasks;
        renderTasks(appData);
    };

    window.openEditTaskModal = (id) => {
        const t = plans.tasks.find(x => x.id === id);
        if (t) {
            document.getElementById('edit-task-id').value = t.id;
            document.getElementById('edit-task-text').value = t.text;
            document.getElementById('edit-task-cat').value = t.category;
            document.getElementById('edit-task-prio').value = t.priority || 'Normaal';
            document.getElementById('edit-task-modal').classList.remove('hidden');
        }
    };

    window.toggleTaskComplete = (id) => {
        const t = plans.tasks.find(x => x.id === id);
        if (t) {
            t.completed = true;
            voegTrotsKnikkerToe(appData, `Taak volbracht: ${t.text}`, t.category || 'Taken');
            saveAppData(appData);
            renderTasks(appData);
        }
    };

    window.archiveTask = (id) => {
        const t = plans.tasks.find(x => x.id === id);
        if (t) {
            plans.tasks = plans.tasks.filter(x => x.id !== id);
            if (!plans.archivedTasks) plans.archivedTasks = [];
            plans.archivedTasks.push(t);
            saveAppData(appData);
            renderTasks(appData);
        }
    };
}

function renderGoals(appData) {
    const plans = appData.plans;
    const list = document.getElementById('goal-list');
    const goals = plans.goals || [];

    list.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen doelen ingesteld.</p>' : goals.map(g => `
        <div class="p-3.5 bg-gray-50 border rounded-xl space-y-2 text-xs">
            <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-950 text-sm">🎯 ${g.title}</span>
                <button onclick="window.archiveGoal(${g.id})" class="text-gray-400 hover:text-red-500 font-bold px-1">Archiveren</button>
            </div>
            <p class="text-gray-500">🛡️ Veiligheidsschild: ${g.shield}</p>
            <div class="flex gap-1.5 pt-1">
                <button onclick="window.setGoalStatus(${g.id}, 'volledig')" class="px-2.5 py-1 text-[11px] rounded-lg ${g.status === 'volledig' ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'}">Volledig ✨</button>
                <button onclick="window.setGoalStatus(${g.id}, 'schild')" class="px-2.5 py-1 text-[11px] rounded-lg ${g.status === 'schild' ? 'bg-amber-600 text-white' : 'bg-white border text-gray-700'}">Schild</button>
                <button onclick="window.setGoalStatus(${g.id}, 'rustdag')" class="px-2.5 py-1 text-[11px] rounded-lg ${g.status === 'rustdag' ? 'bg-blue-600 text-white' : 'bg-white border text-gray-700'}">Rustdag ☕</button>
            </div>
        </div>
    `).join('');

    window.setGoalStatus = (id, status) => {
        const g = plans.goals.find(x => x.id === id);
        if (g) {
            g.status = status;
            if (status === 'volledig') voegTrotsKnikkerToe(appData, `Doel volbracht: ${g.title}`, 'Doelen');
            saveAppData(appData);
            renderGoals(appData);
        }
    };

    window.archiveGoal = (id) => {
        const g = plans.goals.find(x => x.id === id);
        if (g) {
            plans.goals = plans.goals.filter(x => x.id !== id);
            if (!plans.archivedGoals) plans.archivedGoals = [];
            plans.archivedGoals.push(g);
            saveAppData(appData);
            renderGoals(appData);
        }
    };
}
