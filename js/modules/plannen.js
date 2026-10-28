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

    let showAllTasks = false;

    container.innerHTML = `
        <!-- 1. Het Avond-Pact -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">🌙 Het Avond-Pact</h2>
                <button id="open-pact-beheer" class="text-[11px] text-indigo-600 hover:underline font-medium">Beheer / Archief</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Wat laat je vandaag achter voor morgen?</p>
            
            <form id="evening-pact-form" class="flex flex-col gap-2 mb-2">
                <input type="text" id="evening-pact-input" placeholder="Bijv. Loslaten wat vandaag niet af is..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Leg vast voor morgen 🌙</button>
            </form>
            <ul id="evening-pact-list" class="space-y-1.5"></ul>
        </div>

        <!-- 2. Het Zachte Planbord -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">🎯 Het Zachte Planbord</h2>
                <button id="open-plan-beheer-modal" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 transition">Beheer & Archief ⚙️</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Taken structureren op jouw tempo.</p>

            <!-- Inline Categorie Beheer (Nooit meer overflow) -->
            <div id="category-manager-box" class="hidden mb-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2 text-xs">
                <p class="font-bold text-indigo-950">Categorieën Beheren</p>
                <div class="flex gap-2 w-full">
                    <input type="text" id="new-cat-input" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs">
                    <button id="add-cat-submit" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition whitespace-nowrap">Toevoegen</button>
                </div>
                <div id="category-chips-list" class="flex flex-wrap gap-1.5 pt-1"></div>
            </div>

            <!-- Invoer Formulier (Verfijnd & kleiner) -->
            <form id="task-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="task-input" placeholder="Nieuwe taak..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                <div class="grid grid-cols-2 gap-2">
                    <select id="task-category" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white"></select>
                    <select id="task-priority" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white">
                        ${PRIORITIES.map(p => `<option value="${p}">Prioriteit: ${p}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Taak Toevoegen</button>
            </form>

            <!-- Compacte Filterbalk -->
            <div class="flex flex-col gap-1.5 mb-3 bg-gray-50 p-2 rounded-xl border border-gray-200">
                <div class="flex gap-2">
                    <input type="text" id="task-search" placeholder="Zoek taak..." class="flex-1 px-2.5 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                    <button id="toggle-filters-btn" class="px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl text-xs text-gray-700 font-medium">Filters ▾</button>
                </div>
                <div id="advanced-filters-box" class="hidden grid grid-cols-2 gap-2 pt-1">
                    <select id="task-filter-cat" class="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg">
                        <option value="Alle">Alle categorieën</option>
                    </select>
                    <select id="task-filter-date" class="w-full px-2 py-1 text-xs bg-white border border-gray-200 rounded-lg">
                        <option value="all">Alle datums</option>
                        <option value="today">Vandaag</option>
                        <option value="week">Deze week</option>
                        <option value="specific-week">Specifieke week</option>
                        <option value="month">Deze maand</option>
                        <option value="specific-month">Specifieke maand</option>
                        <option value="year">Dit jaar</option>
                        <option value="specific-year">Specifiek jaar</option>
                        <option value="specific-day">Specifieke dag</option>
                    </select>
                </div>
                <div id="task-specific-date-box" class="hidden pt-1">
                    <input type="date" id="task-specific-date-input" class="w-full px-2.5 py-1 text-xs bg-white border border-gray-200 rounded-lg">
                </div>
            </div>

            <ul id="task-list" class="space-y-2 mb-2"></ul>
            <div id="task-more-container" class="text-center"></div>
        </div>

        <!-- 3. Het Zachte Kompas -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">🧭 Het Zachte Kompas</h2>
                <button id="open-goal-beheer" class="text-[11px] text-indigo-600 hover:underline font-medium">Beheer</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Langetermijn voornemens met een ingebouwd veiligheidsnet.</p>

            <form id="goal-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="goal-title" placeholder="Doel (bijv. 10 minuten gitaar)..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                <input type="text" id="goal-shield" placeholder="Zacht schild (als het tegenzit)..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs">
                <select id="goal-priority" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white">
                    ${PRIORITIES.map(p => `<option value="${p}">Prioriteit: ${p}</option>`).join('')}
                </select>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Doel Toevoegen</button>
            </form>

            <div id="goal-list" class="space-y-2"></div>
        </div>
    `;

    initPlannenModals(appData);
    initPlannenLogic(appData);
}

function initPlannenModals(appData) {
    const modalHTML = `
        <div id="plan-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer & Archief Planbord</h3>
                    <button id="close-plan-beheer" class="text-gray-400 hover:text-gray-600 font-bold text-base">✕</button>
                </div>
                
                <div class="space-y-3 text-xs">
                    <div>
                        <p class="font-bold text-indigo-900 mb-1">Categorieën Beheren</p>
                        <div class="flex gap-2 mb-2">
                            <input type="text" id="modal-new-cat" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 border rounded-xl">
                            <button id="modal-add-cat-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen</button>
                        </div>
                        <div id="modal-cat-chips" class="flex flex-wrap gap-1.5"></div>
                    </div>

                    <div class="border-t pt-2">
                        <p class="font-bold text-indigo-900 mb-1">Gearchiveerde & Voltooide Taken</p>
                        <div id="modal-archived-tasks-list" class="space-y-1.5 max-h-48 overflow-y-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('plan-beheer-modal');
    document.getElementById('open-plan-beheer-modal').onclick = () => {
        modal.classList.remove('hidden');
        renderPlanBeheerModal(appData);
    };
    document.getElementById('close-plan-beheer').onclick = () => modal.classList.add('hidden');
}

function renderPlanBeheerModal(appData) {
    const chipsContainer = document.getElementById('modal-cat-chips');
    const cats = appData.plans.categories || DEFAULT_PLAN_CATEGORIES;
    chipsContainer.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border rounded-lg text-indigo-900 font-medium text-[11px]">
            ${c} ${cats.length > 1 ? `<button onclick="window.removePlanCatModal('${c}')" class="text-red-400 hover:text-red-600 font-bold ml-1">✕</button>` : ''}
        </span>
    `).join('');

    window.removePlanCatModal = (catName) => {
        appData.plans.categories = appData.plans.categories.filter(c => c !== catName);
        saveAppData(appData);
        renderPlanBeheerModal(appData);
        initPlannenModule(appData);
    };

    document.getElementById('modal-add-cat-btn').onclick = () => {
        const val = document.getElementById('modal-new-cat').value.trim();
        if (val && !cats.includes(val)) {
            cats.push(val);
            saveAppData(appData);
            document.getElementById('modal-new-cat').value = '';
            renderPlanBeheerModal(appData);
            initPlannenModule(appData);
            showToast(`Categorie '${val}' toegevoegd! ✨`);
        }
    };

    const archivedList = document.getElementById('modal-archived-tasks-list');
    const archived = (appData.plans.archivedTasks || []).concat((appData.plans.tasks || []).filter(t => t.completed || t.archived));
    archivedList.innerHTML = archived.length === 0 ? '<p class="text-gray-400 italic">Geen gearchiveerde taken.</p>' : archived.map(t => `
        <div class="flex justify-between items-center p-2 bg-gray-50 border rounded-xl text-xs">
            <span>[${t.category}] ${t.text}</span>
            <div class="flex gap-2">
                <button onclick="window.restoreTaskModal(${t.id})" class="text-indigo-600 font-semibold hover:underline">Terugzetten</button>
                <button onclick="window.permaDeleteTask(${t.id})" class="text-red-500 font-semibold hover:underline">Verwijderen</button>
            </div>
        </div>
    `).join('');

    window.restoreTaskModal = (id) => {
        let item = (appData.plans.archivedTasks || []).find(x => x.id === id);
        if (item) {
            appData.plans.archivedTasks = appData.plans.archivedTasks.filter(x => x.id !== id);
            item.completed = false;
            item.archived = false;
            appData.plans.tasks.push(item);
        } else {
            let t = appData.plans.tasks.find(x => x.id === id);
            if (t) { t.completed = false; t.archived = false; }
        }
        saveAppData(appData);
        renderPlanBeheerModal(appData);
        initPlannenModule(appData);
        showToast("Taak hersteld naar planbord!");
    };

    window.permaDeleteTask = (id) => {
        appData.plans.archivedTasks = (appData.plans.archivedTasks || []).filter(x => x.id !== id);
        appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlanBeheerModal(appData);
        initPlannenModule(appData);
        showToast("Taak definitief verwijderd.");
    };
}

function initPlannenLogic(appData) {
    const plans = appData.plans;
    updateCategoryDropdowns(plans);

    let showAllTasks = false;

    document.getElementById('toggle-filters-btn').onclick = () => {
        document.getElementById('advanced-filters-box').classList.toggle('hidden');
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
            showToast("Taak toegevoegd! 🎯");
        }
    };

    document.getElementById('task-search').oninput = () => renderTasks(appData);
    document.getElementById('task-filter-cat').onchange = () => renderTasks(appData);
    
    const dateFilterSelect = document.getElementById('task-filter-date');
    const specificDateBox = document.getElementById('task-specific-date-box');
    dateFilterSelect.onchange = () => {
        const val = dateFilterSelect.value;
        specificDateBox.classList.toggle('hidden', !['specific-day', 'specific-week', 'specific-month', 'specific-year'].includes(val));
        renderTasks(appData);
    };
    document.getElementById('task-specific-date-input').onchange = () => renderTasks(appData);

    renderTasks(appData);
    renderGoals(appData);

    function renderTasks(appData) {
        const list = document.getElementById('task-list');
        const moreContainer = document.getElementById('task-more-container');
        const searchVal = document.getElementById('task-search').value.toLowerCase();
        const catVal = document.getElementById('task-filter-cat').value;
        const dateVal = document.getElementById('task-filter-date').value;
        const specificDateVal = document.getElementById('task-specific-date-input')?.value;

        const tasks = (plans.tasks || []).filter(t => {
            const matchSearch = t.text.toLowerCase().includes(searchVal);
            const matchCat = catVal === 'Alle' || t.category === catVal;
            const matchDate = checkDateFilter(t.date, dateVal, specificDateVal);
            return matchSearch && matchCat && matchDate && !t.completed && !t.archived;
        });

        const displayedTasks = showAllTasks ? tasks : tasks.slice(-5).reverse();

        list.innerHTML = displayedTasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken gevonden.</p>' : displayedTasks.map(t => `
            <li class="flex justify-between items-center p-2.5 border border-gray-200 rounded-xl text-xs bg-white shadow-xs">
                <div class="flex-1 pr-2">
                    <div class="flex items-center gap-1.5 mb-0.5">
                        <span class="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">[${t.category}]</span>
                        <span class="text-[10px] text-gray-400">${new Date(t.date).toLocaleDateString('nl-NL', { dateStyle: 'short' })}</span>
                    </div>
                    <p class="text-gray-900 font-medium text-xs">${t.text}</p>
                </div>
                <div class="flex items-center gap-1.5">
                    <button onclick="window.toggleTaskComplete(${t.id})" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-[11px] hover:bg-emerald-100 transition">Klaar ✨</button>
                    <button onclick="window.openEditTaskModal(${t.id})" class="p-1 text-gray-400 hover:text-indigo-600">✏️</button>
                </div>
            </li>
        `).join('');

        if (tasks.length > 5) {
            moreContainer.innerHTML = `<button id="toggle-more-tasks-btn" class="mt-1 text-[11px] text-indigo-600 font-semibold hover:underline">${showAllTasks ? 'Minder weergeven' : `+ ${tasks.length - 5} meer weergeven...`}</button>`;
            document.getElementById('toggle-more-tasks-btn').onclick = () => {
                showAllTasks = !showAllTasks;
                renderTasks(appData);
            };
        } else {
            moreContainer.innerHTML = '';
        }

        window.toggleTaskComplete = (id) => {
            const t = plans.tasks.find(x => x.id === id);
            if (t) {
                t.completed = true;
                voegTrotsKnikkerToe(appData, `Taak volbracht: ${t.text}`, t.category || 'Taken');
                saveAppData(appData);
                renderTasks(appData);
            }
        };

        window.openEditTaskModal = (id) => {
            const t = plans.tasks.find(x => x.id === id);
            if (t) {
                const newText = prompt("Taak bewerken:", t.text);
                if (newText !== null && newText.trim() !== '') {
                    t.text = newText.trim();
                    saveAppData(appData);
                    renderTasks(appData);
                    showToast("Taak bijgewerkt! ✏️");
                }
            }
        };
    }

    function renderGoals() {
        const list = document.getElementById('goal-list');
        const goals = plans.goals || [];
        list.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen doelen ingesteld.</p>' : goals.map(g => `
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-indigo-950">🎯 ${g.title}</span>
                    <button onclick="window.deleteGoal(${g.id})" class="text-gray-400 hover:text-red-500 font-bold px-1">✕</button>
                </div>
                <p class="text-gray-500 text-[11px]">🛡️ Schild: ${g.shield}</p>
            </div>
        `).join('');

        window.deleteGoal = (id) => {
            plans.goals = plans.goals.filter(x => x.id !== id);
            saveAppData(appData);
            renderGoals();
        };
    }
}

function updateCategoryDropdowns(plans) {
    const taskCat = document.getElementById('task-category');
    const filterCat = document.getElementById('task-filter-cat');
    if (!taskCat || !filterCat) return;

    const cats = plans.categories || DEFAULT_PLAN_CATEGORIES;
    taskCat.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    filterCat.innerHTML = `<option value="Alle">Alle categorieën</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');
}
