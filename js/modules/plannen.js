// js/modules/plannen.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

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

    // Zorg dat de data structuren bestaan
    if (!appData.plans) appData.plans = {};
    if (!appData.plans.tasks) appData.plans.tasks = [];
    if (!appData.plans.goals) appData.plans.goals = [];
    if (!appData.plans.eveningPacts) appData.plans.eveningPacts = [];
    if (!appData.plans.compass) appData.plans.compass = [];
    if (!appData.knowledgeHacksIndex) appData.knowledgeHacksIndex = 0;
    if (!appData.knowledgeVault) appData.knowledgeVault = [];

    container.innerHTML = `
        <!-- 1. Het Avond-Pact (Met zachte sfeer-glow en nette Beheer-knop) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4 relative overflow-hidden" style="box-shadow: 0 0 15px rgba(99, 102, 241, 0.08); border-color: rgba(199, 210, 254, 0.8);">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950 flex items-center gap-1.5"><span>🌙</span> Het Avond-Pact</h2>
                <button id="open-pact-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Wat laat je vandaag achter voor morgen?</p>
            
            <div class="space-y-3">
                <input type="text" id="pact-input-field" placeholder="Bijv. Loslaten wat vandaag niet af is..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                <button id="save-pact-btn" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">Leg vast voor morgen 🌙</button>
                <div id="avond-pact-display" class="text-xs text-gray-500 italic">Geen actief avond-pact.</div>
            </div>
        </div>

        <!-- 2. Het Zachte Planbord -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950">🎯 Het Zachte Planbord</h2>
                <button id="open-plan-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Taken structureren op jouw tempo.</p>
            
            <div class="space-y-3">
                <input type="text" id="task-input-field" placeholder="Nieuwe taak..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                <div class="grid grid-cols-2 gap-2">
                    <select id="task-category-select" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                        <option value="Privé">Privé</option>
                        <option value="Klussen">Klussen</option>
                        <option value="Gezin">Gezin</option>
                        <option value="Financieel">Financieel</option>
                        <option value="Algemeen">Algemeen</option>
                    </select>
                    <select id="task-priority-select" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                        <option value="Laag">Prioriteit: Laag</option>
                        <option value="Normaal">Prioriteit: Normaal</option>
                        <option value="Hoog">Prioriteit: Hoog</option>
                    </select>
                </div>
                <button id="add-task-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Taak Toevoegen</button>
                
                <!-- Uitklapbare zoek & filter bar -->
                <div class="border border-gray-200 rounded-xl overflow-hidden">
                    <button id="toggle-plan-filter-bar" class="w-full p-2.5 bg-gray-50 text-indigo-900 font-semibold text-xs flex items-center justify-between hover:bg-gray-100 transition">
                        <span>▶ 🔍 Zoek & Uitgebreide Filters</span>
                    </button>
                    <div id="plan-filter-content" class="hidden p-3 bg-white border-t border-gray-200 space-y-2">
                        <input type="text" id="plan-search-input" placeholder="Zoek in taken..." class="w-full px-3 py-1.5 border rounded-lg text-xs">
                        <select id="plan-cat-filter" class="w-full px-3 py-1.5 border rounded-lg text-xs">
                            <option value="Alle">Alle categorieën</option>
                            <option value="Privé">Privé</option>
                            <option value="Klussen">Klussen</option>
                            <option value="Gezin">Gezin</option>
                            <option value="Financieel">Financieel</option>
                            <option value="Algemeen">Algemeen</option>
                        </select>
                    </div>
                </div>

                <!-- Lijst met openstaande taken -->
                <div id="planboard-tasks-list" class="space-y-2 pt-1"></div>
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

        <!-- 3. Het Zachte Kompas (Met strakke Beheer-knop) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950">🧭 Het Zachte Kompas</h2>
                <button id="open-compass-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Langetermijn voornemens met een ingebouwd veiligheidsnet.</p>
            
            <div class="space-y-3">
                <input type="text" id="goal-input-field" placeholder="Doel (bijv. 10 minuten gitaar)..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                <input type="text" id="goal-shield-field" placeholder="Zacht schild (als het tegenzit)..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                <select id="goal-priority-select" class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                    <option value="Laag">Prioriteit: Laag</option>
                    <option value="Normaal">Prioriteit: Normaal</option>
                    <option value="Hoog">Prioriteit: Hoog</option>
                </select>
                <button id="add-goal-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Doel Toevoegen</button>
                
                <div id="compass-goals-list" class="space-y-2 pt-1 text-xs"></div>
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
        <!-- Beheer & Archief Modal -->
        <div id="plan-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer & Voltooide Taken</h3>
                    <button id="close-plan-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <p class="text-gray-500">Beheer je categorieën, bekijk en beheer voltooide of gearchiveerde items.</p>
                <div id="beheer-items-list" class="space-y-2 max-h-60 overflow-y-auto"></div>
                <div class="pt-2">
                    <button id="close-beheer-bottom" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Sluiten ✨</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    const beheerModal = document.getElementById('plan-beheer-modal');
    
    // Open Beheer modal vanuit Planbord of Kompas
    document.getElementById('open-plan-beheer-btn').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderBeheerItemsList(appData);
    };
    document.getElementById('open-compass-beheer-btn').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderBeheerItemsList(appData);
    };
    document.getElementById('open-pact-beheer-btn').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderBeheerItemsList(appData);
    };

    document.getElementById('close-plan-beheer').onclick = () => beheerModal.classList.add('hidden');
    document.getElementById('close-beheer-bottom').onclick = () => beheerModal.classList.add('hidden');
}

function initPlannenLogic(appData) {
    // Kennis hack verversen
    document.getElementById('next-hack-btn').onclick = () => {
        appData.knowledgeHacksIndex = ((appData.knowledgeHacksIndex || 0) + 1) % KNOWLEDGE_HACKS.length;
        const currentHack = KNOWLEDGE_HACKS[appData.knowledgeHacksIndex];
        
        if (!appData.knowledgeVault) appData.knowledgeVault = [];
        if (!appData.knowledgeVault.some(k => k.title === currentHack.title)) {
            appData.knowledgeVault.push({ id: Date.now(), title: currentHack.title, text: currentHack.text, category: 'Kennis Hacks', date: new Date().toISOString() });
        }
        saveAppData(appData);
        renderKnowledgeHack(appData);
    };

    // Uitklapbare filter bar
    const toggleFilterBtn = document.getElementById('toggle-plan-filter-bar');
    const filterContent = document.getElementById('plan-filter-content');
    toggleFilterBtn.onclick = () => {
        filterContent.classList.toggle('hidden');
        toggleFilterBtn.querySelector('span').textContent = filterContent.classList.contains('hidden') ? '▶ 🔍 Zoek & Uitgebreide Filters' : '▼ 🔍 Zoek & Uitgebreide Filters';
    };

    document.getElementById('plan-search-input').oninput = () => renderPlanboardTasks(appData);
    document.getElementById('plan-cat-filter').onchange = () => renderPlanboardTasks(appData);

    // Avond-pact opslaan
    document.getElementById('save-pact-btn').onclick = () => {
        const text = document.getElementById('pact-input-field').value.trim();
        if (text) {
            appData.plans.eveningPacts.push({ id: Date.now(), text, date: new Date().toISOString() });
            saveAppData(appData);
            document.getElementById('pact-input-field').value = '';
            renderPlanboardViews(appData);
            showToast("Avond-pact vastgelegd! 🌙");
        }
    };

    // Taak toevoegen
    document.getElementById('add-task-btn').onclick = () => {
        const text = document.getElementById('task-input-field').value.trim();
        const category = document.getElementById('task-category-select').value;
        const priority = document.getElementById('task-priority-select').value;
        if (text) {
            appData.plans.tasks.push({ id: Date.now(), text, category, priority, completed: false, archived: false, date: new Date().toISOString() });
            saveAppData(appData);
            document.getElementById('task-input-field').value = '';
            renderPlanboardTasks(appData);
            showToast("Taak toegevoegd! 🎯");
        }
    };

    // Doel toevoegen
    document.getElementById('add-goal-btn').onclick = () => {
        const title = document.getElementById('goal-input-field').value.trim();
        const shield = document.getElementById('goal-shield-field').value.trim();
        const priority = document.getElementById('goal-priority-select').value;
        if (title) {
            appData.plans.goals.push({ id: Date.now(), title, shield: shield || 'Geen', priority, status: 'open', date: new Date().toISOString() });
            saveAppData(appData);
            document.getElementById('goal-input-field').value = '';
            document.getElementById('goal-shield-field').value = '';
            renderCompassGoals(appData);
            showToast("Doel toegevoegd aan je kompas! 🧭");
        }
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
    // Avond-pact display
    const pactDisplay = document.getElementById('avond-pact-display');
    const pacts = appData.plans?.eveningPacts || [];
    if (pacts.length > 0) {
        pactDisplay.textContent = pacts[pacts.length - 1].text;
        pactDisplay.className = "text-xs text-indigo-950 font-medium p-3 bg-indigo-50/60 rounded-xl border border-indigo-100";
    } else {
        pactDisplay.textContent = 'Geen actief avond-pact.';
        pactDisplay.className = "text-xs text-gray-500 italic";
    }

    renderPlanboardTasks(appData);
    renderCompassGoals(appData);
}

function renderPlanboardTasks(appData) {
    const listEl = document.getElementById('planboard-tasks-list');
    const searchTerm = document.getElementById('plan-search-input')?.value.toLowerCase() || '';
    const catFilter = document.getElementById('plan-cat-filter')?.value || 'Alle';

    const tasks = (appData.plans?.tasks || []).filter(t => !t.archived && !t.completed && !t.done);
    const filtered = tasks.filter(t => {
        const matchSearch = t.text.toLowerCase().includes(searchTerm);
        const matchCat = catFilter === 'Alle' || t.category === catFilter;
        return matchSearch && matchCat;
    });

    listEl.innerHTML = filtered.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken.</p>' : filtered.map(t => `
        <div class="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-xs">
            <div>
                <span class="font-bold text-indigo-900 mr-1">[${t.category || 'Algemeen'}]</span> 
                <span class="text-gray-900 font-medium">${t.text}</span>
                <span class="text-[10px] text-gray-400 block mt-0.5">📅 ${new Date(t.date || Date.now()).toLocaleString('nl-NL', {dateStyle: 'short', timeStyle: 'short'})} • Prioriteit: ${t.priority || 'Normaal'}</span>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="window.completePlanTask(${t.id})" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-1">
                    <span>✓</span> Afvinken
                </button>
                <button onclick="window.deletePlanTask(${t.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
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

    window.deletePlanTask = (id) => {
        appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlanboardViews(appData);
        showToast("Taak verwijderd.");
    };
}

function renderCompassGoals(appData) {
    const listEl = document.getElementById('compass-goals-list');
    const goals = (appData.plans?.goals || []).filter(g => g.status === 'open');

    listEl.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen doelen ingesteld.</p>' : goals.map(g => `
        <div class="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-xs">
            <div>
                <span class="font-bold text-indigo-950">🎯 ${g.title}</span>
                <span class="text-[10px] text-gray-500 block">Zacht schild: ${g.shield || 'Geen'} • Prioriteit: ${g.priority || 'Normaal'}</span>
            </div>
            <div class="flex gap-1.5 items-center">
                <button onclick="window.completeGoal(${g.id})" class="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs shadow-sm" title="Voltooien">✓ Voltooid</button>
                <button onclick="window.deleteGoal(${g.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </div>
    `).join('');

    window.completeGoal = (id) => {
        const g = appData.plans.goals.find(x => x.id === id);
        if (g) {
            g.status = 'volledig';
            voegTrotsKnikkerToe(appData, `Doel volbracht: ${g.title}`, 'Doelen');
            saveAppData(appData);
            renderPlanboardViews(appData);
            showToast("Doel volbracht en knikker toegevoegd! 🎯");
        }
    };

    window.deleteGoal = (id) => {
        appData.plans.goals = appData.plans.goals.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlanboardViews(appData);
        showToast("Doel verwijderd.");
    };
}

function renderBeheerItemsList(appData) {
    const listEl = document.getElementById('beheer-items-list');
    const allTasks = appData.plans?.tasks || [];
    const allGoals = appData.plans?.goals || [];

    const completedTasks = allTasks.filter(t => t.completed || t.done || t.archived);
    const completedGoals = allGoals.filter(g => g.status && g.status !== 'open');

    const totalItems = [...completedTasks, ...completedGoals];

    listEl.innerHTML = totalItems.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen voltooide items of archief gevonden.</p>' : totalItems.map(item => {
        const title = item.text || item.title;
        const isTask = !!item.text;
        return `
            <div class="flex justify-between items-center p-2.5 bg-gray-50 border rounded-xl text-xs">
                <div>
                    <span class="font-bold text-indigo-950">${isTask ? 'Taak' : 'Doel'}:</span> <span class="line-through text-gray-500">${title}</span>
                </div>
                <div class="flex gap-2 items-center">
                    <button onclick="window.restoreArchivedItem(${item.id}, ${isTask})" class="text-indigo-600 font-semibold hover:underline">Terugzetten</button>
                    <button onclick="window.permanentlyDelete(${item.id}, ${isTask})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
                </div>
            </div>
        `;
    }).join('');

    window.restoreArchivedItem = (id, isTask) => {
        if (isTask) {
            const t = appData.plans.tasks.find(x => x.id === id);
            if (t) { t.completed = false; t.done = false; t.archived = false; }
        } else {
            const g = appData.plans.goals.find(x => x.id === id);
            if (g) { g.status = 'open'; }
        }
        saveAppData(appData);
        renderBeheerItemsList(appData);
        renderPlanboardViews(appData);
        showToast("Item teruggezet naar openstaand! ✨");
    };

    window.permanentlyDelete = (id, isTask) => {
        if (isTask) {
            appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
        } else {
            appData.plans.goals = appData.plans.goals.filter(x => x.id !== id);
        }
        saveAppData(appData);
        renderBeheerItemsList(appData);
        renderPlanboardViews(appData);
        showToast("Item definitief verwijderd.");
    };
}
