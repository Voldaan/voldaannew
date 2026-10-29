// js/modules/plannen.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

const PLAN_CATEGORIES = ['Algemeen', 'Taken', 'Doelen', 'Gezondheid', 'Geld & Aflossingen', 'Contacten', 'Prive'];
const KNOWLEDGE_HACKS = [
    { title: "🧠 De 2-Minuten Regel", text: "Als een taak minder dan 2 minuten kost om te doen, doe hem dan direct. Dit voorkomt dat je hoofd volloopt met 'openstaande lusjes'." },
    { title: "🌱 Zachte Focus", text: "Je hoeft niet de hele dag door te knallen. Drie gerichte, rustige blokken van 20 minuten leveren meer op dan uren achter elkaar geforceerd doorwerken." },
    { title: "🛡️ Het Prioriteiten-Schild", text: "Bescherm je energie door 'Nee' te zeggen tegen afleidingen die niet bijdragen aan je hoofddoel van vandaag. Rust is geen stilstand, het is onderhoud." },
    { title: "⚓ Ankerpunt in de Ochtend", text: "Begin je dag met één kleine overwinning. Dat zet je brein in de stand van 'ik kan het aan' in plaats van 'wat moet er allemaal nog'." },
    { title: "🎯 Klein Begin", text: "Zie je op tegen een groot project? Hak het in stukjes zo klein als een luciferhoutje. Je hoeft alleen maar de eerste kleine stap te zetten." }
];

export function initPlannenModule(appData) {
    const container = document.getElementById('plannen');
    if (!container) return;

    if (!appData.plans) appData.plans = {};
    if (!appData.plans.tasks) appData.plans.tasks = [];
    if (!appData.plans.goals) appData.plans.goals = [];
    if (!appData.plans.eveningPacts) appData.plans.eveningPacts = [];
    if (!appData.plans.compass) appData.plans.compass = { vision: '', values: '' };
    if (!appData.knowledgeHacksIndex) appData.knowledgeHacksIndex = 0;
    if (!appData.knowledgeVault) appData.knowledgeVault = [];

    container.innerHTML = `
        <!-- 1. Het Avond-Pact (Met zachte sfeer-glow) -->
        <div class="bg-white p-5 rounded-2xl shadow-md border-2 border-indigo-200/80 mb-4 relative overflow-hidden" style="box-shadow: 0 0 15px rgba(99, 102, 241, 0.08);">
            <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-indigo-50 rounded-full pointer-events-none opacity-50"></div>
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950 flex items-center gap-1.5"><span>🌙</span> Het Avond-Pact</h2>
                <button id="open-pact-modal-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">+ Nieuw Pact</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Sluit de dag rustig af met één helder ankerpunt voor morgen.</p>
            <div id="avond-pact-display" class="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-950 font-medium leading-relaxed">
                Nog geen Avond-pact ingesteld.
            </div>
        </div>

        <!-- 2. Het Zachte Planbord (Taken & Doelen) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950">📋 Het Zachte Planbord</h2>
                <div class="flex gap-2">
                    <button id="open-plan-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
                    <button id="open-task-modal-btn" class="px-3 py-1 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Taak / Doel</button>
                </div>
            </div>
            <p class="text-xs text-gray-500 mb-3">Overzicht van jouw focus-taken en doelen in alle rust.</p>
            
            <div class="space-y-3">
                <div>
                    <h3 class="text-xs font-bold text-indigo-900 mb-1.5">🎯 Openstaande Taken</h3>
                    <div id="planboard-tasks-list" class="space-y-2 text-xs"></div>
                </div>
                <div class="pt-2 border-t border-gray-100">
                    <h3 class="text-xs font-bold text-indigo-900 mb-1.5">🧭 Actieve Doelen</h3>
                    <div id="planboard-goals-list" class="space-y-2 text-xs"></div>
                </div>
            </div>
        </div>

        <!-- Micro-Inspiratie Kader: Kennis Hack / Tip -->
        <div class="bg-gradient-to-r from-amber-50/80 to-amber-100/50 p-4 rounded-2xl shadow-sm border border-amber-200/70 mb-4 text-xs space-y-2">
            <div class="flex justify-between items-center">
                <span id="hack-title" class="font-bold text-amber-950 text-sm flex items-center gap-1.5">🧠 De 2-Minuten Regel</span>
                <button id="next-hack-btn" class="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 rounded-lg text-[11px] font-semibold hover:bg-amber-100 transition shadow-sm">💡 Volgende Tip</button>
            </div>
            <p id="hack-text" class="text-amber-900/90 leading-relaxed"></p>
        </div>

        <!-- 3. Het Zachte Kompas -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950">🧭 Het Zachte Kompas</h2>
                <button id="open-compass-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Jouw persoonlijke noorderster: visie en kernwaarden.</p>
            <div id="compass-display" class="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-950 space-y-2">
                <p><strong>Visie:</strong> <span id="display-vision" class="font-normal text-gray-700">Nog niet ingesteld.</span></p>
                <p><strong>Kernwaarden:</strong> <span id="display-values" class="font-normal text-gray-700">Nog niet ingesteld.</span></p>
            </div>
        </div>
    `;

    initPlannenModals(appData);
    initPlannenLogic(appData);
    renderKnowledgeHack(appData);
}

function initPlannenModals(appData) {
    if (document.getElementById('plan-beheer-modal')) return;

    const modalsHTML = `
        <!-- Beheer Modal (Gelijk aan de gewenste strakke standaard) -->
        <div id="plan-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer & Archief Planbord</h3>
                    <button id="close-plan-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                
                <!-- Uitklapbare Zoek & Uitgebreide Filters -->
                <div class="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-2">
                    <input type="text" id="beheer-search" placeholder="Zoek in taken en doelen..." class="w-full px-3 py-2 bg-white border rounded-xl">
                    <div class="grid grid-cols-2 gap-2">
                        <select id="beheer-cat-filter" class="px-3 py-2 bg-white border rounded-xl">
                            <option value="Alle">Alle categorieën</option>
                            ${PLAN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                        <select id="beheer-status-filter" class="px-3 py-2 bg-white border rounded-xl">
                            <option value="all">Alle statussen</option>
                            <option value="open">Openstaand</option>
                            <option value="completed">Voltooid / Archief</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-2">
                    <h4 class="font-bold text-indigo-900">Beheer Categorieën & Voltooide Taken</h4>
                    <div id="beheer-items-list" class="space-y-1.5 max-h-56 overflow-y-auto"></div>
                </div>

                <div class="pt-2">
                    <button id="close-beheer-bottom" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Sluiten ✨</button>
                </div>
            </div>
        </div>

        <!-- Taak / Doel Invoeren Modal -->
        <div id="task-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 id="task-modal-title" class="text-sm font-bold text-indigo-950">✨ Nieuwe Taak of Doel Toevoegen</h3>
                    <button id="close-task-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="task-modal-form" class="space-y-3">
                    <input type="hidden" id="modal-task-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Type item</label>
                        <select id="modal-task-type" class="w-full px-3 py-2 border rounded-xl bg-white">
                            <option value="task">Taak (Focus-taak)</option>
                            <option value="goal">Doel (Met schild)</option>
                        </select>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving / Titel</label>
                        <input type="text" id="modal-task-text" placeholder="Wat wil je bereiken of doen?" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                            <select id="modal-task-cat" class="w-full px-3 py-2 border rounded-xl bg-white">
                                ${PLAN_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div id="modal-shield-box">
                            <label class="block font-semibold text-gray-600 mb-1">Schild / Buffer</label>
                            <input type="text" id="modal-task-shield" placeholder="Bijv. Tijd / Rust" class="w-full px-3 py-2 border rounded-xl">
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-task-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Avond-Pact Modal -->
        <div id="pact-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🌙 Avond-Pact Instellen</h3>
                    <button id="close-pact-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="pact-modal-form" class="space-y-3">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Jouw ankerpunt voor morgen</label>
                        <textarea rows="3" id="modal-pact-text" placeholder="Bijv. Morgen start ik om 09:00 met één taak zonder afleiding..." class="w-full px-3 py-2 border rounded-xl" required></textarea>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-pact-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Pact Vastleggen ✨</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Kompas Beheer Modal -->
        <div id="compass-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🧭 Beheer Het Zachte Kompas</h3>
                    <button id="close-compass-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="compass-modal-form" class="space-y-3">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Jouw Visie / Noorderster</label>
                        <textarea rows="2" id="modal-compass-vision" placeholder="Waar sta je voor?" class="w-full px-3 py-2 border rounded-xl"></textarea>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Kernwaarden</label>
                        <input type="text" id="modal-compass-values" placeholder="Bijv. Rust, Eerlijkheid, Balans" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-compass-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    setupPlannenModalHandlers(appData);
}

function setupPlannenModalHandlers(appData) {
    // Plan Beheer Modal
    const beheerModal = document.getElementById('plan-beheer-modal');
    document.getElementById('open-plan-beheer-btn').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderBeheerItemsList(appData);
    };
    document.getElementById('close-plan-beheer').onclick = () => beheerModal.classList.add('hidden');
    document.getElementById('close-beheer-bottom').onclick = () => beheerModal.classList.add('hidden');

    document.getElementById('beheer-search').oninput = () => renderBeheerItemsList(appData);
    document.getElementById('beheer-cat-filter').onchange = () => renderBeheerItemsList(appData);
    document.getElementById('beheer-status-filter').onchange = () => renderBeheerItemsList(appData);

    // Taak / Doel Modal
    const taskModal = document.getElementById('task-modal');
    document.getElementById('open-task-modal-btn').onclick = () => {
        document.getElementById('modal-task-id').value = '';
        document.getElementById('task-modal-form').reset();
        document.getElementById('task-modal-title').textContent = '✨ Nieuwe Taak of Doel Toevoegen';
        taskModal.classList.remove('hidden');
    };
    document.getElementById('close-task-modal').onclick = () => taskModal.classList.add('hidden');
    document.getElementById('cancel-task-modal').onclick = () => taskModal.classList.add('hidden');

    document.getElementById('modal-task-type').onchange = (e) => {
        const shieldBox = document.getElementById('modal-shield-box');
        if (e.target.value === 'goal') shieldBox.classList.remove('hidden');
        else shieldBox.classList.add('hidden');
    };

    document.getElementById('task-modal-form').onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('modal-task-type').value;
        const text = document.getElementById('modal-task-text').value.trim();
        const category = document.getElementById('modal-task-cat').value;
        const shield = document.getElementById('modal-task-shield').value.trim();
        
        if (text) {
            if (type === 'task') {
                if (!appData.plans.tasks) appData.plans.tasks = [];
                appData.plans.tasks.push({ id: Date.now(), text, category, completed: false, archived: false, date: new Date().toISOString() });
                showToast("Taak toegevoegd! 📋");
            } else {
                if (!appData.plans.goals) appData.plans.goals = [];
                appData.plans.goals.push({ id: Date.now(), title: text, category, shield: shield || 'Geen', status: 'open', date: new Date().toISOString() });
                showToast("Doel toegevoegd! 🎯");
            }
            saveAppData(appData);
            taskModal.classList.add('hidden');
            renderPlanboardViews(appData);
        }
    };

    // Avond-Pact Modal
    const pactModal = document.getElementById('pact-modal');
    document.getElementById('open-pact-modal-btn').onclick = () => {
        pactModal.classList.remove('hidden');
    };
    document.getElementById('close-pact-modal').onclick = () => pactModal.classList.add('hidden');
    document.getElementById('cancel-pact-modal').onclick = () => pactModal.classList.add('hidden');

    document.getElementById('pact-modal-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('modal-pact-text').value.trim();
        if (text) {
            if (!appData.plans.eveningPacts) appData.plans.eveningPacts = [];
            appData.plans.eveningPacts.push({ id: Date.now(), text, date: new Date().toISOString() });
            saveAppData(appData);
            pactModal.classList.add('hidden');
            renderPlanboardViews(appData);
            showToast("Avond-pact vastgelegd! 🌙");
        }
    };

    // Kompas Beheer Modal
    const compassModal = document.getElementById('compass-modal');
    document.getElementById('open-compass-beheer-btn').onclick = () => {
        document.getElementById('modal-compass-vision').value = appData.plans.compass?.vision || '';
        document.getElementById('modal-compass-values').value = appData.plans.compass?.values || '';
        compassModal.classList.remove('hidden');
    };
    document.getElementById('close-compass-modal').onclick = () => compassModal.classList.add('hidden');
    document.getElementById('cancel-compass-modal').onclick = () => compassModal.classList.add('hidden');

    document.getElementById('compass-modal-form').onsubmit = (e) => {
        e.preventDefault();
        const vision = document.getElementById('modal-compass-vision').value.trim();
        const values = document.getElementById('modal-compass-values').value.trim();
        appData.plans.compass = { vision, values };
        saveAppData(appData);
        compassModal.classList.add('hidden');
        renderPlanboardViews(appData);
        showToast("Zachte Kompas bijgewerkt! 🧭");
    };
}

function initPlannenLogic(appData) {
    document.getElementById('next-hack-btn').onclick = () => {
        appData.knowledgeHacksIndex = ((appData.knowledgeHacksIndex || 0) + 1) % KNOWLEDGE_HACKS.length;
        const currentHack = KNOWLEDGE_HACKS[appData.knowledgeHacksIndex];
        
        // Sla op in de Kennis-kluis zodat deze later op het Kennis-tabblad terugkomt
        if (!appData.knowledgeVault) appData.knowledgeVault = [];
        if (!appData.knowledgeVault.some(k => k.title === currentHack.title)) {
            appData.knowledgeVault.push({ id: Date.now(), title: currentHack.title, text: currentHack.text, category: 'Kennis Hacks', date: new Date().toISOString() });
        }
        saveAppData(appData);
        renderKnowledgeHack(appData);
    };

    renderPlanboardViews(appData);
}

function renderKnowledgeHack(appData) {
    const idx = appData.knowledgeHacksIndex || 0;
    const hack = KNOWLEDGE_HACKS[idx];
    document.getElementById('hack-title').textContent = hack.title;
    document.getElementById('hack-text').textContent = hack.text;
}

function renderPlanboardViews(appData) {
    // Avond-Pact
    const pactDisplay = document.getElementById('avond-pact-display');
    const pacts = appData.plans?.eveningPacts || [];
    if (pacts.length > 0) {
        pactDisplay.textContent = pacts[pacts.length - 1].text;
    } else {
        pactDisplay.textContent = 'Nog geen Avond-pact ingesteld voor vandaag.';
    }

    // Kompas
    const comp = appData.plans?.compass || {};
    document.getElementById('display-vision').textContent = comp.vision || 'Nog niet ingesteld.';
    document.getElementById('display-values').textContent = comp.values || 'Nog niet ingesteld.';

    // Openstaande Taken (Met strakke afvinkknop gelijk aan de Actie-Hub)
    const taskListEl = document.getElementById('planboard-tasks-list');
    const tasks = (appData.plans?.tasks || []).filter(t => !t.archived && !t.completed && !t.done);
    
    taskListEl.innerHTML = tasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken.</p>' : tasks.map(t => `
        <div class="flex justify-between items-center p-3 bg-white border rounded-xl shadow-sm">
            <div>
                <span class="font-bold text-indigo-900 mr-1">[${t.category || 'Algemeen'}]</span> <span class="text-gray-900 font-medium text-sm">${t.text}</span>
            </div>
            <button onclick="window.completePlanTask(${t.id})" class="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-1">
                <span>✓</span> Afvinken
            </button>
        </div>
    `).join('');

    window.completePlanTask = (id) => {
        const t = appData.plans.tasks.find(x => x.id === id);
        if (t) {
            t.completed = true;
            t.done = true;
            voegTrotsKnikkerToe(appData, `Taak volbracht: ${t.text}`, t.category || 'Taken');
            saveAppData(appData);
            renderPlanboardViews(appData);
            showToast("Taak volbracht en knikker toegevoegd! ✨");
        }
    };

    // Actieve Doelen
    const goalsListEl = document.getElementById('planboard-goals-list');
    const goals = (appData.plans?.goals || []).filter(g => g.status === 'open');

    goalsListEl.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen actieve doelen.</p>' : goals.map(g => `
        <div class="flex justify-between items-center p-3 bg-white border rounded-xl shadow-sm">
            <div>
                <span class="font-bold text-indigo-950 text-sm">🎯 ${g.title}</span>
                <span class="text-[10px] text-gray-500 block">Schild: ${g.shield || 'Geen'} • [${g.category || 'Doelen'}]</span>
            </div>
            <div class="flex gap-1.5 items-center">
                <button onclick="window.completePlanGoal(${g.id}, 'volledig')" class="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs shadow-sm" title="Voltooien">✓ Voltooid</button>
                <button onclick="window.completePlanGoal(${g.id}, 'schild')" class="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold text-xs shadow-sm" title="Schild">🛡️</button>
            </div>
        </div>
    `).join('');

    window.completePlanGoal = (id, status) => {
        const g = appData.plans.goals.find(x => x.id === id);
        if (g) {
            g.status = status;
            if (status === 'volledig') voegTrotsKnikkerToe(appData, `Doel volbracht: ${g.title}`, 'Doelen');
            saveAppData(appData);
            renderPlanboardViews(appData);
            showToast("Doel-status bijgewerkt! 🎯");
        }
    };
}

function renderBeheerItemsList(appData) {
    const listEl = document.getElementById('beheer-items-list');
    const searchTerm = document.getElementById('beheer-search').value.toLowerCase();
    const catFilter = document.getElementById('beheer-cat-filter').value;
    const statusFilter = document.getElementById('beheer-status-filter').value;

    const allTasks = appData.plans?.tasks || [];
    const allGoals = appData.plans?.goals || [];

    const filteredTasks = allTasks.filter(t => {
        const matchSearch = t.text.toLowerCase().includes(searchTerm);
        const matchCat = catFilter === 'Alle' || t.category === catFilter;
        const isCompleted = t.completed || t.done || t.archived;
        const matchStatus = statusFilter === 'all' || (statusFilter === 'open' && !isCompleted) || (statusFilter === 'completed' && isCompleted);
        return matchSearch && matchCat && matchStatus;
    });

    listEl.innerHTML = filteredTasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen items gevonden in beheer.</p>' : filteredTasks.map(t => {
        const isCompleted = t.completed || t.done || t.archived;
        return `
            <div class="flex justify-between items-center p-2.5 bg-gray-50 border rounded-xl text-xs">
                <div>
                    <span class="font-bold text-indigo-900">[${t.category || 'Algemeen'}]</span> <span class="${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}">${t.text}</span>
                </div>
                <div class="flex gap-2 items-center">
                    ${isCompleted ? `<button onclick="window.restorePlanItem(${t.id})" class="text-indigo-600 font-semibold hover:underline">Terugzetten</button>` : ''}
                    <button onclick="window.deletePlanItem(${t.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
                </div>
            </div>
        `;
    }).join('');

    window.restorePlanItem = (id) => {
        const t = appData.plans.tasks.find(x => x.id === id);
        if (t) {
            t.completed = false;
            t.done = false;
            t.archived = false;
            saveAppData(appData);
            renderBeheerItemsList(appData);
            renderPlanboardViews(appData);
            showToast("Taak teruggezet naar openstaand! ✨");
        }
    };

    window.deletePlanItem = (id) => {
        appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
        appData.plans.goals = appData.plans.goals.filter(x => x.id !== id);
        saveAppData(appData);
        renderBeheerItemsList(appData);
        renderPlanboardViews(appData);
        showToast("Item permanent verwijderd.");
    };
}
