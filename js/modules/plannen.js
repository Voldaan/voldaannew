// js/modules/plannen.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

const DEFAULT_PLAN_CATEGORIES = ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'];
const PRIORITIES = ['Laag', 'Normaal', 'Hoog'];

export function initPlannenModule(appData) {
    const container = document.getElementById('plannen');
    if (!container) return;

    if (!appData.plans) {
        appData.plans = { tasks: [], categories: [...DEFAULT_PLAN_CATEGORIES], archivedTasks: [] };
    }
    if (!appData.plans.categories) appData.plans.categories = [...DEFAULT_PLAN_CATEGORIES];

    let showAllTasks = false;

    container.innerHTML = `
        <!-- Het Zachte Planbord -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">🎯 Het Zachte Planbord</h2>
                <button id="open-plan-beheer-modal" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 transition">Beheer & Archief ⚙️</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Taken structureren op jouw tempo.</p>

            <!-- Kleinere invoervelden & knoppen -->
            <form id="task-form" class="space-y-2 mb-3">
                <input type="text" id="task-input" placeholder="Nieuwe taak toevoegen..." class="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" required>
                <div class="grid grid-cols-2 gap-2">
                    <select id="task-category" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white"></select>
                    <select id="task-priority" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white">
                        ${PRIORITIES.map(p => `<option value="${p}">Prioriteit: ${p}</option>`).join('')}
                    </select>
                </div>
                <button type="submit" class="w-full py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Taak Toevoegen</button>
            </form>

            <!-- Subtiele inklapbare filters -->
            <div class="mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                <div class="flex gap-2 mb-1.5">
                    <input type="text" id="task-search" placeholder="Zoek taak..." class="flex-1 px-2.5 py-1 bg-white border border-gray-200 rounded-xl">
                    <button id="toggle-plan-filters" class="px-2.5 py-1 bg-white border border-gray-200 rounded-xl text-indigo-700 font-semibold">Filters ▾</button>
                </div>
                <div id="plan-filters-box" class="hidden grid grid-cols-2 gap-2 pt-1 border-t border-gray-200 mt-1.5">
                    <select id="task-filter-cat" class="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg">
                        <option value="Alle">Alle categorieën</option>
                    </select>
                    <select id="task-filter-date" class="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg">
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
                    <input type="date" id="task-specific-date" class="hidden col-span-2 w-full px-2 py-1 bg-white border border-gray-200 rounded-lg">
                </div>
            </div>

            <!-- Takenlijst & uitvouw container -->
            <ul id="task-list" class="space-y-2 mb-2"></ul>
            <div id="task-more-container" class="text-center"></div>
        </div>
    `;

    initPlanModals(appData);
    initPlanLogic(appData);
}

function initPlanModals(appData) {
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
                        <p class="font-bold text-indigo-900 mb-1">Gearchiveerde / Voltooide Taken</p>
                        <div id="modal-archived-tasks-list" class="space-y-1.5 max-h-48 overflow-y-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const editTaskModalHTML = `
        <div id="edit-task-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">✏️ Taak Bewerken</h3>
                    <button id="close-edit-task" class="text-gray-400 hover:text-gray-600 text-base">✕</button>
                </div>
                <form id="edit-task-form" class="space-y-2.5 text-xs">
                    <input type="hidden" id="edit-task-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Taak omschrijving</label>
                        <input type="text" id="edit-task-text" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                            <select id="edit-task-cat" class="w-full px-2.5 py-1.5 border rounded-xl bg-white"></select>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Prioriteit</label>
                            <select id="edit-task-prio" class="w-full px-2.5 py-1.5 border rounded-xl bg-white">
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

    if (!document.getElementById('plan-beheer-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML + editTaskModalHTML);
    }

    const beheerModal = document.getElementById('plan-beheer-modal');
    document.getElementById('open-plan-beheer-modal').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderPlanBeheerModal(appData);
    };
    document.getElementById('close-plan-beheer').onclick = () => beheerModal.classList.add('hidden');

    const editModal = document.getElementById('edit-task-modal');
    document.getElementById('close-edit-task').onclick = () => editModal.classList.add('hidden');
    document.getElementById('cancel-edit-task').onclick = () => editModal.classList.add('hidden');

    document.getElementById('edit-task-form').onsubmit = (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-task-id').value);
        const text = document.getElementById('edit-task-text').value.trim();
        const category = document.getElementById('edit-task-cat').value;
        const priority = document.getElementById('edit-task-prio').value;

        const task = appData.plans.tasks.find(x => x.id === id);
        if (task && text) {
            task.text = text;
            task.category = category;
            task.priority = priority;
            saveAppData(appData);
            editModal.classList.add('hidden');
            initPlannenModule(appData);
            showToast("Taak bijgewerkt! ✏️");
        }
    };
}

function renderPlanBeheerModal(appData) {
    const chipsContainer = document.getElementById('modal-cat-chips');
    const cats = appData.plans.categories || DEFAULT_PLAN_CATEGORIES;
    chipsContainer.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border rounded-lg text-indigo-900 font-medium text-[11px]">
            ${c} ${cats.length > 1 ? `<button onclick="window.removePlanCat('${c}')" class="text-red-400 hover:text-red-600 font-bold ml-1">✕</button>` : ''}
        </span>
    `).join('');

    window.removePlanCat = (catName) => {
        appData.plans.categories = appData.plans.categories.filter(c => c !== catName);
        saveAppData(appData);
        renderPlanBeheerModal(appData);
        initPlannenModule(appData);
        showToast("Categorie verwijderd.");
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
    const archived = appData.plans.archivedTasks || [];
    archivedList.innerHTML = archived.length === 0 ? '<p class="text-gray-400 italic">Geen gearchiveerde taken.</p>' : archived.map(t => `
        <div class="flex justify-between items-center p-2 bg-gray-50 border rounded-xl text-xs">
            <span>[${t.category}] ${t.text}</span>
            <div class="flex gap-2">
                <button onclick="window.restoreTask(${t.id})" class="text-indigo-600 font-semibold hover:underline">Terugzetten</button>
                <button onclick="window.permaDeleteTask(${t.id})" class="text-red-500 font-semibold hover:underline">Verwijderen</button>
            </div>
        </div>
    `).join('');

    window.restoreTask = (id) => {
        const item = appData.plans.archivedTasks.find(x => x.id === id);
        if (item) {
            appData.plans.archivedTasks = appData.plans.archivedTasks.filter(x => x.id !== id);
            item.completed = false;
            appData.plans.tasks.push(item);
            saveAppData(appData);
            renderPlanBeheerModal(appData);
            initPlannenModule(appData);
            showToast("Taak hersteld naar planbord!");
        }
    };

    window.permaDeleteTask = (id) => {
        appData.plans.archivedTasks = appData.plans.archivedTasks.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlanBeheerModal(appData);
        showToast("Taak definitief verwijderd.");
    };
}

function initPlanLogic(appData) {
    const plans = appData.plans;
    const cats = plans.categories || DEFAULT_PLAN_CATEGORIES;

    const taskCat = document.getElementById('task-category');
    const filterCat = document.getElementById('task-filter-cat');
    if (taskCat && filterCat) {
        taskCat.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
        filterCat.innerHTML = `<option value="Alle">Alle categorieën</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    document.getElementById('toggle-plan-filters').onclick = () => {
        document.getElementById('plan-filters-box').classList.toggle('hidden');
    };

    document.getElementById('task-search').oninput = () => renderTasksView(appData);
    document.getElementById('task-filter-cat').onchange = () => renderTasksView(appData);
    document.getElementById('task-filter-date').onchange = (e) => {
        const val = e.target.value;
        document.getElementById('task-specific-date').classList.toggle('hidden', !['specific-day', 'specific-week', 'specific-month', 'specific-year'].includes(val));
        renderTasksView(appData);
    };
    document.getElementById('task-specific-date').onchange = () => renderTasksView(appData);

    document.getElementById('task-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('task-input').value.trim();
        const category = document.getElementById('task-category').value;
        const priority = document.getElementById('task-priority').value;
        if (text) {
            if (!plans.tasks) plans.tasks = [];
            plans.tasks.push({ id: Date.now(), text, category, priority, completed: false, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderTasksView(appData);
            showToast("Taak toegevoegd! 🎯");
        }
    };

    let showAllTasks = false;
    renderTasksView(appData);

    function renderTasksView(appData) {
        const list = document.getElementById('task-list');
        const moreContainer = document.getElementById('task-more-container');
        const searchTerm = document.getElementById('task-search').value.toLowerCase();
        const catFilter = document.getElementById('task-filter-cat').value;
        const dateFilter = document.getElementById('task-filter-date').value;
        const specificDate = document.getElementById('task-specific-date').value;

        const tasks = (plans.tasks || []).filter(t => !t.completed && !t.archived);
        const filtered = tasks.filter(t => {
            const matchSearch = t.text.toLowerCase().includes(searchTerm);
            const matchCat = catFilter === 'Alle' || t.category === catFilter;
            const matchDate = checkDateFilter(t.date, dateFilter, specificDate);
            return matchSearch && matchCat && matchDate;
        });

        const displayed = showAllTasks ? filtered : filtered.slice(-5).reverse();

        list.innerHTML = displayed.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken gevonden.</p>' : displayed.map(t => `
            <li class="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1.5 flex flex-col">
                <div class="flex justify-between items-start">
                    <div>
                        <span class="font-bold text-indigo-700">[${t.category}]</span> 
                        <span class="text-[10px] text-gray-500 font-medium">(${t.priority})</span>
                    </div>
                    <button onclick="window.completeTask(${t.id})" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-[11px] hover:bg-emerald-100 transition">Klaar ✨</button>
                </div>
                <p class="text-gray-900 font-medium text-sm leading-snug cursor-pointer hover:text-indigo-600" onclick="window.openEditTask(${t.id})">${t.text}</p>
                <div class="flex justify-between items-center text-[10px] text-gray-400 border-t pt-1">
                    <span>📅 ${new Date(t.date).toLocaleString('nl-NL')}</span>
                    <button onclick="window.openEditTask(${t.id})" class="text-indigo-600 hover:underline font-semibold">Bewerken ✏️</button>
                </div>
            </li>
        `).join('');

        if (filtered.length > 5) {
            moreContainer.innerHTML = `<button id="toggle-more-tasks" class="text-[11px] text-indigo-600 font-semibold hover:underline">${showAllTasks ? 'Minder weergeven' : `+ ${filtered.length - 5} meer weergeven...`}</button>`;
            document.getElementById('toggle-more-tasks').onclick = () => {
                showAllTasks = !showAllTasks;
                renderTasksView(appData);
            };
        } else {
            moreContainer.innerHTML = '';
        }

        window.completeTask = (id) => {
            const task = plans.tasks.find(x => x.id === id);
            if (task) {
                plans.tasks = plans.tasks.filter(x => x.id !== id);
                task.completed = true;
                if (!plans.archivedTasks) plans.archivedTasks = [];
                plans.archivedTasks.push(task);
                voegTrotsKnikkerToe(appData, `Taak volbracht: ${task.text}`, task.category);
                saveAppData(appData);
                renderTasksView(appData);
            }
        };

        window.openEditTask = (id) => {
            const task = plans.tasks.find(x => x.id === id);
            if (task) {
                document.getElementById('edit-task-id').value = task.id;
                document.getElementById('edit-task-text').value = task.text;
                
                const catSelect = document.getElementById('edit-task-cat');
                const cats = plans.categories || DEFAULT_PLAN_CATEGORIES;
                catSelect.innerHTML = cats.map(c => `<option value="${c}" ${c === task.category ? 'selected' : ''}>${c}</option>`).join('');
                document.getElementById('edit-task-prio').value = task.priority || 'Normaal';

                document.getElementById('edit-task-modal').classList.remove('hidden');
            }
        };
    }
}
