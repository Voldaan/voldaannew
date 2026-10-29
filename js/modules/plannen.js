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

    if (!appData.plans) appData.plans = {};
    if (!appData.plans.tasks) appData.plans.tasks = [];
    if (!appData.plans.goals) appData.plans.goals = [];
    if (!appData.plans.eveningPacts) appData.plans.eveningPacts = [];
    if (!appData.plans.categories) appData.plans.categories = ['Privé', 'Klussen', 'Gezin', 'Financieel', 'Algemeen'];
    if (!appData.knowledgeHacksIndex) appData.knowledgeHacksIndex = 0;
    if (!appData.knowledgeVault) appData.knowledgeVault = [];

    container.innerHTML = `
        <!-- 1. Het Avond-Pact (Met vertrouwde blauwe stijl en lichte gele glow) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 mb-4 relative overflow-hidden" style="box-shadow: 0 0 15px rgba(234, 179, 8, 0.15); border-color: rgba(253, 230, 138, 0.9);">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950 flex items-center gap-1.5"><span>🌙</span> Het Avond-Pact</h2>
                <button id="open-pact-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer & Archief</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Wat laat je vandaag achter voor morgen?</p>
            
            <div class="space-y-3">
                <input type="text" id="pact-input-field" placeholder="Bijv. Loslaten wat vandaag niet af is..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-300">
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
                        ${appData.plans.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="task-priority-select" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                        <option value="Laag">Prioriteit: Laag</option>
                        <option value="Normaal">Prioriteit: Normaal</option>
                        <option value="Hoog">Prioriteit: Hoog</option>
                    </select>
                </div>
                <button id="add-task-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Taak Toevoegen</button>
                
                <!-- Uitklapbare Zoek & Uitgebreide Filters -->
                <div class="border border-gray-200 rounded-xl overflow-hidden">
                    <button id="toggle-plan-filter-bar" class="w-full p-2.5 bg-gray-50 text-indigo-900 font-semibold text-xs flex items-center justify-between hover:bg-gray-100 transition">
                        <span>▼ 🔍 Zoek & Uitgebreide Filters</span>
                    </button>
                    <div id="plan-filter-content" class="p-3 bg-white border-t border-gray-200 space-y-2">
                        <input type="text" id="plan-search-input" placeholder="Zoek taak..." class="w-full px-3 py-1.5 border rounded-lg text-xs">
                        <div class="grid grid-cols-2 gap-2">
                            <select id="plan-cat-filter" class="px-3 py-1.5 border rounded-lg text-xs">
                                <option value="Alle">Alle categorieën</option>
                                ${appData.plans.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                            <select id="plan-date-filter" class="px-3 py-1.5 border rounded-lg text-xs">
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
                    </div>
                </div>

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

        <!-- 3. Het Zachte Kompas -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950">🧭 Het Zachte KomPAS</h2>
                <button id="open-compass-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer & Archief</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Langetermijn voornemens met een ingebouwd veiligheidsnet.</p>
            
            <div class="space-y-3">
                <div class="border border-indigo-100 p-3.5 rounded-2xl bg-indigo-50/30 space-y-3">
                    <input type="text" id="goal-title-field" placeholder="🎯 Wat wil je opbouwen?" class="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-300 focus:outline-none">
                    
                    <div id="compass-extra-fields" class="hidden space-y-3 pt-1">
                        <input type="text" id="goal-pitfall-field" placeholder="🌑 Bekende valkuil?" class="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs">
                        <input type="text" id="goal-shield-field" placeholder="🛡️ Zacht Schild op zware dagen?" class="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs">
                        
                        <div class="grid grid-cols-2 gap-2">
                            <select id="goal-frequency-select" class="px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs">
                                <option value="Dagelijks">🔄 Dagelijks doel</option>
                                <option value="Wekelijks">📅 Wekelijks doel</option>
                                <option value="Maandelijks">🗓️ Maandelijks doel</option>
                            </select>
                            <select id="goal-priority-select" class="px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs">
                                <option value="Laag">Prioriteit: Laag</option>
                                <option value="Normaal" selected>Prioriteit: Normaal</option>
                                <option value="Hoog">Prioriteit: Hoog</option>
                            </select>
                        </div>

                        <div class="flex gap-2 pt-1">
                            <button id="add-goal-btn" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">Opslaan</button>
                            <button type="button" id="cancel-goal-btn" class="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50">Annuleren</button>
                        </div>
                    </div>
                </div>
                
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
        <!-- Planbord Beheer Modal -->
        <div id="plan-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer Planbord, Categorieën & Archief</h3>
                    <button id="close-plan-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                
                <div class="space-y-2">
                    <h4 class="font-bold text-indigo-900">Categorieën Beheren</h4>
                    <div class="flex gap-2">
                        <input type="text" id="new-cat-input" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 border rounded-xl">
                        <button id="add-cat-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen</button>
                    </div>
                    <div id="categories-tags-list" class="flex flex-wrap gap-1.5 pt-1"></div>
                </div>

                <div class="pt-2 border-t space-y-2">
                    <h4 class="font-bold text-indigo-900">Archief Voltooide Taken</h4>
                    <div id="beheer-archive-list" class="space-y-1.5 max-h-48 overflow-y-auto"></div>
                </div>

                <div class="pt-2">
                    <button id="close-beheer-bottom" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Sluiten ✨</button>
                </div>
            </div>
        </div>

        <!-- Avond-Pact Beheer Modal -->
        <div id="pact-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🌙 Beheer Avond-Pact Historie</h3>
                    <button id="close-pact-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <div id="pact-archive-list" class="space-y-2 max-h-60 overflow-y-auto"></div>
                <div class="pt-2">
                    <button id="close-pact-bottom" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Sluiten ✨</button>
                </div>
            </div>
        </div>

        <!-- Zachte Kompas Beheer Modal -->
        <div id="compass-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🧭 Beheer Zachte Kompas Doelen</h3>
                    <button id="close-compass-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <div id="compass-archive-list" class="space-y-2 max-h-60 overflow-y-auto"></div>
                <div class="pt-2">
                    <button id="close-compass-bottom" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Sluiten ✨</button>
                </div>
            </div>
        </div>

        <!-- Taak Bewerken Modal -->
        <div id="edit-task-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">✏️ Taak Bewerken & Details</h3>
                    <button id="close-edit-task" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <input type="hidden" id="edit-task-id">
                <div class="space-y-3">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Taakomschrijving</label>
                        <input type="text" id="edit-task-text" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                            <select id="edit-task-cat" class="w-full px-3 py-2 border rounded-xl bg-white"></select>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Prioriteit</label>
                            <select id="edit-task-priority" class="w-full px-3 py-2 border rounded-xl bg-white">
                                <option value="Laag">Laag</option>
                                <option value="Normaal">Normaal</option>
                                <option value="Hoog">Hoog</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-edit-task" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="button" id="save-edit-task-btn" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Doel Bewerken & Details Modal (Kompas) -->
        <div id="edit-goal-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🎯 Doel Details & Bewerken</h3>
                    <button id="close-edit-goal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <input type="hidden" id="edit-goal-id">
                <div class="space-y-3">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Wat wil je opbouwen?</label>
                        <input type="text" id="edit-goal-title" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Bekende valkuil</label>
                        <input type="text" id="edit-goal-pitfall" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Zacht Schild op zware dagen</label>
                        <input type="text" id="edit-goal-shield" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Frequentie</label>
                            <select id="edit-goal-frequency" class="w-full px-3 py-2 border rounded-xl bg-white">
                                <option value="Dagelijks">Dagelijks</option>
                                <option value="Wekelijks">Wekelijks</option>
                                <option value="Maandelijks">Maandelijks</option>
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Prioriteit</label>
                            <select id="edit-goal-priority" class="w-full px-3 py-2 border rounded-xl bg-white">
                                <option value="Laag">Laag</option>
                                <option value="Normaal">Normaal</option>
                                <option value="Hoog">Hoog</option>
                            </select>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-edit-goal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="button" id="save-edit-goal-btn" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    const planModal = document.getElementById('plan-beheer-modal');
    const pactModal = document.getElementById('pact-beheer-modal');
    const compassModal = document.getElementById('compass-beheer-modal');
    const editTaskModal = document.getElementById('edit-task-modal');
    const editGoalModal = document.getElementById('edit-goal-modal');

    document.getElementById('open-plan-beheer-btn').onclick = () => { planModal.classList.remove('hidden'); renderPlanBeheerContent(appData); };
    document.getElementById('close-plan-beheer').onclick = () => planModal.classList.add('hidden');
    document.getElementById('close-beheer-bottom').onclick = () => planModal.classList.add('hidden');

    document.getElementById('open-pact-beheer-btn').onclick = () => { pactModal.classList.remove('hidden'); renderPactBeheerContent(appData); };
    document.getElementById('close-pact-beheer').onclick = () => pactModal.classList.add('hidden');
    document.getElementById('close-pact-bottom').onclick = () => pactModal.classList.add('hidden');

    document.getElementById('open-compass-beheer-btn').onclick = () => { compassModal.classList.remove('hidden'); renderCompassBeheerContent(appData); };
    document.getElementById('close-compass-beheer').onclick = () => compassModal.classList.add('hidden');
    document.getElementById('close-compass-bottom').onclick = () => compassModal.classList.add('hidden');

    document.getElementById('close-edit-task').onclick = () => editTaskModal.classList.add('hidden');
    document.getElementById('cancel-edit-task').onclick = () => editTaskModal.classList.add('hidden');

    document.getElementById('close-edit-goal').onclick = () => editGoalModal.classList.add('hidden');
    document.getElementById('cancel-edit-goal').onclick = () => editGoalModal.classList.add('hidden');

    document.getElementById('save-edit-task-btn').onclick = () => {
        const id = Number(document.getElementById('edit-task-id').value);
        const text = document.getElementById('edit-task-text').value.trim();
        const category = document.getElementById('edit-task-cat').value;
        const priority = document.getElementById('edit-task-priority').value;

        const task = (appData.plans?.tasks || []).find(t => t.id === id);
        if (task && text) {
            task.text = text;
            task.category = category;
            task.priority = priority;
            saveAppData(appData);
            editTaskModal.classList.add('hidden');
            renderPlanboardViews(appData);
            showToast("Taak bijgewerkt! ✨");
        }
    };

    document.getElementById('save-edit-goal-btn').onclick = () => {
        const id = Number(document.getElementById('edit-goal-id').value);
        const title = document.getElementById('edit-goal-title').value.trim();
        const pitfall = document.getElementById('edit-goal-pitfall').value.trim();
        const shield = document.getElementById('edit-goal-shield').value.trim();
        const frequency = document.getElementById('edit-goal-frequency').value;
        const priority = document.getElementById('edit-goal-priority').value;

        const goal = (appData.plans?.goals || []).find(g => g.id === id);
        if (goal && title) {
            goal.title = title;
            goal.pitfall = pitfall;
            goal.shield = shield;
            goal.frequency = frequency;
            goal.priority = priority;
            saveAppData(appData);
            editGoalModal.classList.add('hidden');
            renderPlanboardViews(appData);
            showToast("Doel bijgewerkt! 🧭");
        }
    };
}

function initPlannenLogic(appData) {
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

    const goalTitleInput = document.getElementById('goal-title-field');
    const extraFields = document.getElementById('compass-extra-fields');
    const cancelGoalBtn = document.getElementById('cancel-goal-btn');

    if (goalTitleInput) {
        goalTitleInput.onfocus = () => {
            if (extraFields) extraFields.classList.remove('hidden');
        };
    }

    if (cancelGoalBtn) {
        cancelGoalBtn.onclick = () => {
            if (extraFields) extraFields.classList.add('hidden');
            goalTitleInput.value = '';
            document.getElementById('goal-pitfall-field').value = '';
            document.getElementById('goal-shield-field').value = '';
        };
    }

    const toggleFilterBtn = document.getElementById('toggle-plan-filter-bar');
    const filterContent = document.getElementById('plan-filter-content');
    if (toggleFilterBtn && filterContent) {
        toggleFilterBtn.onclick = () => {
            filterContent.classList.toggle('hidden');
            toggleFilterBtn.querySelector('span').textContent = filterContent.classList.contains('hidden') ? '▶ 🔍 Zoek & Uitgebreide Filters' : '▼ 🔍 Zoek & Uitgebreide Filters';
        };
    }

    const searchInput = document.getElementById('plan-search-input');
    const catFilter = document.getElementById('plan-cat-filter');
    const dateFilter = document.getElementById('plan-date-filter');
    if (searchInput) searchInput.oninput = () => renderPlanboardTasks(appData);
    if (catFilter) catFilter.onchange = () => renderPlanboardTasks(appData);
    if (dateFilter) dateFilter.onchange = () => renderPlanboardTasks(appData);

    const savePactBtn = document.getElementById('save-pact-btn');
    if (savePactBtn) {
        savePactBtn.onclick = () => {
            const text = document.getElementById('pact-input-field').value.trim();
            if (text) {
                appData.plans.eveningPacts.push({ id: Date.now(), text, date: new Date().toISOString() });
                saveAppData(appData);
                document.getElementById('pact-input-field').value = '';
                renderPlanboardViews(appData);
                showToast("Avond-pact vastgelegd! 🌙");
            }
        };
    }

    const addTaskBtn = document.getElementById('add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.onclick = () => {
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
    }

    const addGoalBtn = document.getElementById('add-goal-btn');
    if (addGoalBtn) {
        addGoalBtn.onclick = () => {
            const title = goalTitleInput.value.trim();
            const pitfall = document.getElementById('goal-pitfall-field').value.trim();
            const shield = document.getElementById('goal-shield-field').value.trim();
            const frequency = document.getElementById('goal-frequency-select').value;
            const priority = document.getElementById('goal-priority-select').value;
            
            if (title) {
                appData.plans.goals.push({ 
                    id: Date.now(), 
                    title, 
                    pitfall: pitfall || 'Geen', 
                    shield: shield || 'Geen', 
                    frequency, 
                    priority,
                    status: 'open', 
                    archived: false,
                    date: new Date().toISOString() 
                });
                saveAppData(appData);
                goalTitleInput.value = '';
                document.getElementById('goal-pitfall-field').value = '';
                document.getElementById('goal-shield-field').value = '';
                if (extraFields) extraFields.classList.add('hidden');
                renderCompassGoals(appData);
                showToast("Doel toegevoegd aan je kompas! 🧭");
            }
        };
    }

    renderPlanboardViews(appData);
}

function renderKnowledgeHack(appData) {
    const idx = appData.knowledgeHacksIndex || 0;
    const hack = KNOWLEDGE_HACKS[idx];
    const titleEl = document.getElementById('hack-title');
    const textEl = document.getElementById('hack-text');
    if (titleEl) titleEl.textContent = hack.title;
    if (textEl) textEl.textContent = hack.text;
}

function renderPlanboardViews(appData) {
    const pactDisplay = document.getElementById('avond-pact-display');
    const pacts = appData.plans?.eveningPacts || [];
    if (pactDisplay) {
        if (pacts.length > 0) {
            pactDisplay.textContent = pacts[pacts.length - 1].text;
            pactDisplay.className = "text-xs text-indigo-950 font-medium p-3 bg-white/80 rounded-xl border border-indigo-100 shadow-sm";
        } else {
            pactDisplay.textContent = 'Geen actief avond-pact.';
            pactDisplay.className = "text-xs text-gray-500 italic";
        }
    }

    renderPlanboardTasks(appData);
    renderCompassGoals(appData);
}

function renderPlanboardTasks(appData) {
    const listEl = document.getElementById('planboard-tasks-list');
    if (!listEl) return;
    const searchTerm = document.getElementById('plan-search-input')?.value.toLowerCase() || '';
    const catFilter = document.getElementById('plan-cat-filter')?.value || 'Alle';
    const dateFilter = document.getElementById('plan-date-filter')?.value || 'all';

    const tasks = (appData.plans?.tasks || []).filter(t => !t.archived && !t.completed && !t.done);
    const filtered = tasks.filter(t => {
        const matchSearch = t.text.toLowerCase().includes(searchTerm);
        const matchCat = catFilter === 'Alle' || t.category === catFilter;
        const matchDate = checkDateFilter(t.date || new Date().toISOString(), dateFilter, null);
        return matchSearch && matchCat && matchDate;
    });

    listEl.innerHTML = filtered.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken.</p>' : filtered.map(t => `
        <div class="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-xs cursor-pointer hover:border-indigo-200 transition" onclick="window.editPlanTask(${t.id})">
            <div>
                <span class="font-bold text-indigo-900 mr-1">[${t.category || 'Algemeen'}]</span> 
                <span class="text-gray-900 font-medium">${t.text}</span>
                <span class="text-[10px] text-gray-400 block mt-0.5">📅 ${new Date(t.date || Date.now()).toLocaleString('nl-NL', {dateStyle: 'short', timeStyle: 'short'})} • Prioriteit: ${t.priority || 'Normaal'}</span>
            </div>
            <div class="flex items-center gap-2" onclick="event.stopPropagation()">
                <button onclick="window.completePlanTask(${t.id})" class="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-1">
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

    window.editPlanTask = (id) => {
        const t = appData.plans.tasks.find(x => x.id === id);
        if (t) {
            const cats = appData.plans.categories || ['Privé', 'Klussen', 'Gezin', 'Financieel', 'Algemeen'];
            const catSelect = document.getElementById('edit-task-cat');
            catSelect.innerHTML = cats.map(c => `<option value="${c}" ${t.category === c ? 'selected' : ''}>${c}</option>`).join('');

            document.getElementById('edit-task-id').value = t.id;
            document.getElementById('edit-task-text').value = t.text;
            document.getElementById('edit-task-priority').value = t.priority || 'Normaal';
            document.getElementById('edit-task-modal').classList.remove('hidden');
        }
    };
}

function renderCompassGoals(appData) {
    const listEl = document.getElementById('compass-goals-list');
    if (!listEl) return;
    const goals = (appData.plans?.goals || []).filter(g => !g.archived);

    listEl.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen doelen ingesteld.</p>' : goals.map(g => `
        <div class="p-3.5 bg-white border border-gray-100 rounded-xl shadow-sm text-xs space-y-1.5 cursor-pointer hover:border-indigo-200 transition" onclick="window.editCompassGoal(${g.id})">
            <div class="flex justify-between items-start">
                <span class="font-bold text-indigo-950 text-sm">🎯 ${g.title}</span>
                <button onclick="event.stopPropagation(); window.deleteGoal(${g.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
            <p class="text-gray-600">🌑 Valkuil: ${g.pitfall || 'Geen'}</p>
            <p class="text-indigo-900 font-medium">🛡️ Zacht Schild: ${g.shield || 'Geen'}</p>
            <span class="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] font-medium">🔄 ${g.frequency || 'Dagelijks'} • Prioriteit: ${g.priority || 'Normaal'}</span>
            <div class="flex gap-1.5 pt-2 border-t border-gray-50" onclick="event.stopPropagation()">
                <button onclick="window.completeGoal(${g.id}, 'Volledig')" class="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold text-xs shadow-sm">✓ Volledig</button>
                <button onclick="window.completeGoal(${g.id}, 'Zacht Schild')" class="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold text-xs shadow-sm">🛡️ Zacht Schild</button>
                <button onclick="window.completeGoal(${g.id}, 'Rustdag')" class="px-2.5 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-semibold text-xs">🌱 Rustdag</button>
            </div>
        </div>
    `).join('');

    window.completeGoal = (id, actie) => {
        const g = appData.plans.goals.find(x => x.id === id);
        if (g) {
            g.status = actie;
            voegTrotsKnikkerToe(appData, `Kompas doel (${actie}): ${g.title}`, 'Doelen');
            saveAppData(appData);
            renderPlanboardViews(appData);
            showToast(`Doel geregistreerd (${actie})! 🎯`);
        }
    };

    window.deleteGoal = (id) => {
        appData.plans.goals = appData.plans.goals.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlanboardViews(appData);
        showToast("Doel verwijderd.");
    };

    window.editCompassGoal = (id) => {
        const g = appData.plans.goals.find(x => x.id === id);
        if (g) {
            document.getElementById('edit-goal-id').value = g.id;
            document.getElementById('edit-goal-title').value = g.title;
            document.getElementById('edit-goal-pitfall').value = g.pitfall || '';
            document.getElementById('edit-goal-shield').value = g.shield || '';
            document.getElementById('edit-goal-frequency').value = g.frequency || 'Dagelijks';
            document.getElementById('edit-goal-priority').value = g.priority || 'Normaal';
            document.getElementById('edit-goal-modal').classList.remove('hidden');
        }
    };
}

function renderPlanBeheerContent(appData) {
    const tagsList = document.getElementById('categories-tags-list');
    const archiveList = document.getElementById('beheer-archive-list');
    if (!tagsList || !archiveList) return;
    const cats = appData.plans.categories || ['Privé', 'Klussen', 'Gezin', 'Financieel', 'Algemeen'];

    tagsList.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-xs font-medium">
            ${c} <button onclick="window.deletePlanCat('${c}')" class="text-red-500 font-bold hover:text-red-700 ml-0.5">✕</button>
        </span>
    `).join('');

    const addCatBtn = document.getElementById('add-cat-btn');
    if (addCatBtn) {
        addCatBtn.onclick = () => {
            const input = document.getElementById('new-cat-input');
            const val = input.value.trim();
            if (val && !cats.includes(val)) {
                cats.push(val);
                appData.plans.categories = cats;
                saveAppData(appData);
                input.value = '';
                renderPlanBeheerContent(appData);
                showToast("Categorie toegevoegd! ✨");
            }
        };
    }

    window.deletePlanCat = (catName) => {
        appData.plans.categories = cats.filter(c => c !== catName);
        saveAppData(appData);
        renderPlanBeheerContent(appData);
        showToast("Categorie verwijderd.");
    };

    const completedTasks = (appData.plans?.tasks || []).filter(t => t.completed || t.done || t.archived);
    archiveList.innerHTML = completedTasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen voltooide taken in archief.</p>' : completedTasks.map(t => `
        <div class="flex justify-between items-center p-2 bg-gray-50 border rounded-xl text-xs">
            <span class="line-through text-gray-500 truncate max-w-[170px]">${t.text}</span>
            <div class="flex gap-2 items-center font-semibold text-xs">
                <button onclick="window.restoreTask(${t.id})" class="text-indigo-600 hover:underline">Terugzetten</button>
                <button onclick="window.permDeleteTask(${t.id})" class="text-red-600 hover:underline">Verwijderen</button>
            </div>
        </div>
    `).join('');

    window.restoreTask = (id) => {
        const t = appData.plans.tasks.find(x => x.id === id);
        if (t) { t.completed = false; t.done = false; t.archived = false; }
        saveAppData(appData);
        renderPlanBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast("Taak teruggezet! ✨");
    };

    window.permDeleteTask = (id) => {
        appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlanBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast("Taak definitief verwijderd.");
    };
}

function renderPactBeheerContent(appData) {
    const listEl = document.getElementById('pact-archive-list');
    if (!listEl) return;
    const pacts = appData.plans?.eveningPacts || [];

    listEl.innerHTML = pacts.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen avond-pacten in historie.</p>' : pacts.map(p => `
        <div class="flex justify-between items-center p-2.5 bg-gray-50 border rounded-xl text-xs">
            <div>
                <span class="text-gray-800 font-medium">${p.text}</span>
                <span class="text-[10px] text-gray-400 block">📅 ${new Date(p.date || Date.now()).toLocaleDateString('nl-NL')}</span>
            </div>
            <button onclick="window.deletePact(${p.id})" class="text-red-600 hover:underline font-semibold">Verwijderen</button>
        </div>
    `).join('');

    window.deletePact = (id) => {
        appData.plans.eveningPacts = appData.plans.eveningPacts.filter(x => x.id !== id);
        saveAppData(appData);
        renderPactBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast("Avond-pact verwijderd.");
    };
}

function renderCompassBeheerContent(appData) {
    const listEl = document.getElementById('compass-archive-list');
    if (!listEl) return;
    const goals = appData.plans?.goals || [];

    listEl.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen kompas-doelen gevonden.</p>' : goals.map(g => `
        <div class="flex justify-between items-center p-2.5 bg-gray-50 border rounded-xl text-xs">
            <div>
                <span class="font-bold text-indigo-950">${g.title}</span>
                <span class="text-[10px] text-indigo-600 block">Status: ${g.status || 'open'} • ${g.frequency || 'Dagelijks'}</span>
            </div>
            <div class="flex gap-2 items-center font-semibold text-xs">
                <button onclick="window.toggleArchiveGoal(${g.id})" class="text-indigo-600 hover:underline">${g.archived ? 'Activeren' : 'Archiveren'}</button>
                <button onclick="window.permDeleteGoal(${g.id})" class="text-red-600 hover:underline">Verwijderen</button>
            </div>
        </div>
    `).join('');

    window.toggleArchiveGoal = (id) => {
        const g = appData.plans.goals.find(x => x.id === id);
        if (g) { g.archived = !g.archived; }
        saveAppData(appData);
        renderCompassBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast("Doel archiefstatus gewijzigd! ✨");
    };

    window.permDeleteGoal = (id) => {
        appData.plans.goals = appData.plans.goals.filter(x => x.id !== id);
        saveAppData(appData);
        renderCompassBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast("Doel definitief verwijderd.");
    };
}