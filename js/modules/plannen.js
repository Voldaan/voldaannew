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
        <!-- 1. Het Avond-Pact -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 mb-4 relative overflow-hidden" style="box-shadow: 0 0 15px rgba(234, 179, 8, 0.15); border-color: rgba(253, 230, 138, 0.9);">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-950 flex items-center gap-1.5"><span>🌙</span> Het Avond-Pact</h2>
                <button id="open-pact-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
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
                <button id="open-compass-beheer-btn" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition shadow-sm">Beheer</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Langetermijn voornemens met een ingebouwd veiligheidsnet.</p>
            
            <div class="space-y-3">
                <div class="border border-indigo-100 p-3.5 rounded-2xl bg-indigo-50/30 space-y-3">
                    <input type="text" id="goal-title-field" placeholder="🎯 Wat wil je opbouwen?" class="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-300 focus:outline-none">
                    
                    <div id="compass-extra-fields" class="hidden space-y-3 pt-1">
                        <select id="goal-category-select" class="w-full px-3 py-2 bg-white border border-indigo-200 rounded-xl text-xs">
                            ${appData.plans.categories.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
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
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer Planbord, Categorieën & Taken</h3>
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
                    <h4 class="font-bold text-indigo-900">Taken Zoeken, Filteren & Archief</h4>
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
                    <h3 class="text-sm font-bold text-indigo-950">🌙 Beheer & Historie Avond-Pacts</h3>
                    <button id="close-pact-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <p class="text-gray-500">Doorzoek al je eerdere avond-pacts, filter op datum, bewerk ze of zet ze terug.</p>

                <div class="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <input type="text" id="pact-search-input" placeholder="🔍 Zoek in avond-pacts..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                    <div class="grid grid-cols-2 gap-2">
                        <select id="pact-filter-date" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
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
                    <div id="pact-custom-filter-box" class="hidden pt-1">
                        <input type="date" id="pact-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                        <input type="month" id="pact-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                        <input type="number" id="pact-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                        <input type="week" id="pact-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                    </div>
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
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer Kompas, Categorieën & Doelen</h3>
                    <button id="close-compass-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>

                <div class="space-y-2">
                    <h4 class="font-bold text-indigo-900">Categorieën Beheren</h4>
                    <div class="flex gap-2">
                        <input type="text" id="compass-new-cat-input" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 border rounded-xl">
                        <button id="compass-add-cat-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen</button>
                    </div>
                    <div id="compass-categories-tags-list" class="flex flex-wrap gap-1.5 pt-1"></div>
                </div>

                <div class="pt-2 border-t space-y-2">
                    <h4 class="font-bold text-indigo-900">Doelen Zoeken, Filteren & Archief</h4>
                    <div id="compass-archive-list" class="space-y-1.5 max-h-48 overflow-y-auto"></div>
                </div>

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
                        <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                        <select id="edit-goal-cat" class="w-full px-3 py-2 border rounded-xl bg-white"></select>
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
        const category = document.getElementById('edit-goal-cat').value;
        const pitfall = document.getElementById('edit-goal-pitfall').value.trim();
        const shield = document.getElementById('edit-goal-shield').value.trim();
        const frequency = document.getElementById('edit-goal-frequency').value;
        const priority = document.getElementById('edit-goal-priority').value;

        const goal = (appData.plans?.goals || []).find(g => g.id === id);
        if (goal && title) {
            goal.title = title;
            goal.category = category;
            goal.pitfall = pitfall;
            goal.shield = shield;
            goal.frequency = frequency;
            goal.priority = priority;
            saveAppData(appData);
            editGoalModal.classList.add('hidden');
            renderPlanboardViews(appData);
            renderCompassBeheerContent(appData);
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
            const category = document.getElementById('goal-category-select')?.value || 'Privé';
            const pitfall = document.getElementById('goal-pitfall-field').value.trim();
            const shield = document.getElementById('goal-shield-field').value.trim();
            const frequency = document.getElementById('goal-frequency-select').value;
            const priority = document.getElementById('goal-priority-select').value;
            
            if (title) {
                appData.plans.goals.push({ 
                    id: Date.now(), 
                    title, 
                    category,
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

    // Event listener voor Avond-Pact datumfilter in de modal
    const pactSearchInput = document.getElementById('pact-search-input');
    const pactDateFilter = document.getElementById('pact-filter-date');
    if (pactSearchInput) pactSearchInput.oninput = () => renderPactBeheerContent(appData);
    if (pactDateFilter) {
        pactDateFilter.onchange = () => {
            setupPactDateFilterListeners();
            renderPactBeheerContent(appData);
        };
    }

    ['pact-custom-date', 'pact-custom-month', 'pact-custom-year', 'pact-custom-week'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => {
                if (window.currentPactAppDataRef) renderPactBeheerContent(window.currentPactAppDataRef);
            });
            el.addEventListener('change', () => {
                if (window.currentPactAppDataRef) renderPactBeheerContent(window.currentPactAppDataRef);
            });
        }
    });

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
    const pacts = (appData.plans?.eveningPacts || []).filter(p => !p.completed && !p.done);
    if (pactDisplay) {
        if (pacts.length > 0) {
            const p = pacts[pacts.length - 1];
            pactDisplay.innerHTML = `
                <div class="flex justify-between items-center bg-white p-2.5 border border-indigo-100 rounded-xl shadow-sm text-xs">
                    <span class="text-gray-900 font-medium">${p.text}</span>
                    <button onclick="window.completePlannenPact(${p.id})" class="px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-1">
                        <span>✓</span> Afvinken
                    </button>
                </div>
            `;
            pactDisplay.className = ""; 
        } else {
            pactDisplay.textContent = 'Geen actief avond-pact.';
            pactDisplay.className = "text-xs text-gray-500 italic";
        }
    }

    renderPlanboardTasks(appData);
    renderCompassGoals(appData);

    window.completePlannenPact = (id) => {
        const pact = (appData.plans?.eveningPacts || []).find(x => x.id === id);
        if (pact) {
            pact.completed = true;
            pact.done = true;
            voegTrotsKnikkerToe(appData, `Avond-pact volbracht: ${pact.text}`, 'Avond-Pact');
            saveAppData(appData);
            renderPlanboardViews(appData);
            showToast("Avond-pact volbracht en knikker toegevoegd! ✨");
        }
    };
}

function renderPlanboardTasks(appData) {
    const listEl = document.getElementById('planboard-tasks-list');
    if (!listEl) return;

    const tasks = (appData.plans?.tasks || []).filter(t => !t.archived && !t.completed && !t.done);

    listEl.innerHTML = tasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken.</p>' : tasks.map(t => `
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
                <div>
                    <span class="font-bold text-indigo-900 mr-1">[${g.category || 'Privé'}]</span>
                    <span class="font-bold text-indigo-950 text-sm">🎯 ${g.title}</span>
                </div>
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
            const cats = appData.plans.categories || ['Privé', 'Klussen', 'Gezin', 'Financieel', 'Algemeen'];
            const catSelect = document.getElementById('edit-goal-cat');
            if (catSelect) {
                catSelect.innerHTML = cats.map(c => `<option value="${c}" ${g.category === c ? 'selected' : ''}>${c}</option>`).join('');
            }

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
    window.currentPlanBeheerAppDataRef = appData;
    const tagsList = document.getElementById('categories-tags-list');
    const beheerContainer = document.getElementById('beheer-archive-list');
    if (!tagsList || !beheerContainer) return;

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
                renderCompassBeheerContent(appData); // Synchroniseer direct met kompas beheer
                initPlannenModule(appData); // Herlaad om selects direct bij te werken
                showToast("Categorie toegevoegd! ✨");
            }
        };
    }

    window.deletePlanCat = (catName) => {
        appData.plans.categories = cats.filter(c => c !== catName);
        saveAppData(appData);
        renderPlanBeheerContent(appData);
        renderCompassBeheerContent(appData);
        initPlannenModule(appData);
        showToast("Categorie verwijderd.");
    };

    beheerContainer.innerHTML = `
        <div class="space-y-3 pt-2">
            <!-- Zoekbalk & Datumfilters -->
            <div class="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input type="text" id="plan-beheer-search" placeholder="🔍 Zoek in alle taken..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                <div class="grid grid-cols-2 gap-2">
                    <select id="plan-beheer-cat" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                        <option value="Alle">Alle categorieën</option>
                        ${cats.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="plan-beheer-date" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
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
                <div id="plan-beheer-custom-filter-box" class="hidden pt-1">
                    <input type="date" id="plan-beheer-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                    <input type="month" id="plan-beheer-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                    <input type="number" id="plan-beheer-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                    <input type="week" id="plan-beheer-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                </div>
            </div>

            <div id="plan-beheer-filtered-list" class="space-y-2 max-h-56 overflow-y-auto"></div>
        </div>
    `;

    setupPlanBeheerListeners(appData);
    renderPlanBeheerFilteredList(appData);
}

function setupPlanBeheerListeners(appData) {
    const searchInput = document.getElementById('plan-beheer-search');
    const catSelect = document.getElementById('plan-beheer-cat');
    const dateSelect = document.getElementById('plan-beheer-date');

    if (searchInput) searchInput.oninput = () => renderPlanBeheerFilteredList(appData);
    if (catSelect) catSelect.onchange = () => renderPlanBeheerFilteredList(appData);
    if (dateSelect) {
        dateSelect.onchange = () => {
            setupPlanBeheerDateFilter();
            renderPlanBeheerFilteredList(appData);
        };
    }

    ['plan-beheer-custom-date', 'plan-beheer-custom-month', 'plan-beheer-custom-year', 'plan-beheer-custom-week'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => renderPlanBeheerFilteredList(appData));
            el.addEventListener('change', () => renderPlanBeheerFilteredList(appData));
        }
    });
}

function setupPlanBeheerDateFilter() {
    const dateFilterSelect = document.getElementById('plan-beheer-date');
    const customBox = document.getElementById('plan-beheer-custom-filter-box');
    const dateInput = document.getElementById('plan-beheer-custom-date');
    const monthInput = document.getElementById('plan-beheer-custom-month');
    const yearInput = document.getElementById('plan-beheer-custom-year');
    const weekInput = document.getElementById('plan-beheer-custom-week');

    if (!dateFilterSelect) return;

    if (customBox) customBox.classList.add('hidden');
    if (dateInput) { dateInput.classList.add('hidden'); dateInput.value = ''; }
    if (monthInput) { monthInput.classList.add('hidden'); monthInput.value = ''; }
    if (yearInput) { yearInput.classList.add('hidden'); yearInput.value = ''; }
    if (weekInput) { weekInput.classList.add('hidden'); weekInput.value = ''; }

    const val = dateFilterSelect.value;
    if (val.startsWith('specific-')) {
        if (customBox) customBox.classList.remove('hidden');
        if (val === 'specific-day' && dateInput) dateInput.classList.remove('hidden');
        if (val === 'specific-month' && monthInput) monthInput.classList.remove('hidden');
        if (val === 'specific-year' && yearInput) yearInput.classList.remove('hidden');
        if (val === 'specific-week' && weekInput) weekInput.classList.remove('hidden');
    }
}

function renderPlanBeheerFilteredList(appData) {
    const listEl = document.getElementById('plan-beheer-filtered-list');
    if (!listEl) return;

    const searchTerm = (document.getElementById('plan-beheer-search')?.value || '').toLowerCase();
    const catFilter = document.getElementById('plan-beheer-cat')?.value || 'Alle';
    const dateFilter = document.getElementById('plan-beheer-date')?.value || 'all';

    const dateInput = document.getElementById('plan-beheer-custom-date');
    const monthInput = document.getElementById('plan-beheer-custom-month');
    const yearInput = document.getElementById('plan-beheer-custom-year');
    const weekInput = document.getElementById('plan-beheer-custom-week');

    let customVal = null;
    if (dateFilter === 'specific-day' && dateInput) customVal = dateInput.value;
    else if (dateFilter === 'specific-month' && monthInput) customVal = monthInput.value;
    else if (dateFilter === 'specific-year' && yearInput) customVal = yearInput.value;
    else if (dateFilter === 'specific-week' && weekInput) customVal = weekInput.value;

    const tasks = appData.plans?.tasks || [];

    const filtered = tasks.filter(t => {
        const matchSearch = t.text.toLowerCase().includes(searchTerm);
        const matchCat = catFilter === 'Alle' || t.category === catFilter;
        const matchDate = checkDateFilter(t.date || new Date().toISOString(), dateFilter, customVal);
        return matchSearch && matchCat && matchDate;
    });

    listEl.innerHTML = filtered.length === 0 ? 
        '<p class="text-xs text-gray-400 italic text-center py-3">Geen taken gevonden in dit beheer.</p>' : 
        filtered.slice().reverse().map(t => `
            <div class="flex flex-col gap-2 p-3.5 bg-white border border-indigo-100 rounded-2xl shadow-sm text-xs">
                <div class="flex justify-between items-start">
                    <div class="w-full pr-2">
                        <span class="font-bold text-indigo-900 mr-1">[${t.category || 'Algemeen'}]</span>
                        <span class="font-medium text-gray-900 text-sm block mt-0.5">${t.text}</span>
                        <span class="text-[10px] text-gray-400 block mt-1">📅 ${new Date(t.date || Date.now()).toLocaleDateString('nl-NL')} • Prioriteit: ${t.priority || 'Normaal'}</span>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${t.completed || t.done || t.archived ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${t.completed || t.done || t.archived ? 'Voltooid' : 'Openstaand'}
                    </span>
                </div>

                <div id="plan-edit-box-${t.id}" class="hidden space-y-2 pt-2 border-t border-gray-100">
                    <input type="text" id="plan-edit-text-${t.id}" value="${t.text}" class="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <div class="grid grid-cols-2 gap-2">
                        <select id="plan-edit-cat-${t.id}" class="px-3 py-1.5 bg-white border rounded-xl text-xs">
                            ${(appData.plans.categories || []).map(c => `<option value="${c}" ${t.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                        <select id="plan-edit-pri-${t.id}" class="px-3 py-1.5 bg-white border rounded-xl text-xs">
                            <option value="Laag" ${t.priority === 'Laag' ? 'selected' : ''}>Laag</option>
                            <option value="Normaal" ${t.priority === 'Normaal' || !t.priority ? 'selected' : ''}>Normaal</option>
                            <option value="Hoog" ${t.priority === 'Hoog' ? 'selected' : ''}>Hoog</option>
                        </select>
                    </div>
                    <div class="flex gap-2 justify-end pt-1">
                        <button onclick="window.saveBeheerTask(${t.id})" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">Opslaan ✨</button>
                        <button onclick="window.toggleBeheerEditTask(${t.id}, false)" class="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Annuleren</button>
                    </div>
                </div>

                <div id="plan-actions-${t.id}" class="flex gap-2 justify-end pt-2 border-t border-gray-50">
                    <button onclick="window.toggleBeheerEditTask(${t.id}, true)" class="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">Bewerken ✏️</button>
                    <button onclick="window.toggleRestoreBeheerTask(${t.id})" class="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition">
                        ${t.completed || t.done || t.archived ? 'Terugzetten 🔄' : 'Markeer Voltooid ✓'}
                    </button>
                    <button onclick="window.permDeleteBeheerTask(${t.id})" class="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition">Verwijderen ✕</button>
                </div>
            </div>
        `).join('');

    window.toggleBeheerEditTask = (id, show) => {
        const editBox = document.getElementById(`plan-edit-box-${id}`);
        const actions = document.getElementById(`plan-actions-${id}`);
        if (editBox && actions) {
            if (show) {
                editBox.classList.remove('hidden');
                actions.classList.add('hidden');
            } else {
                editBox.classList.add('hidden');
                actions.classList.remove('hidden');
            }
        }
    };

    window.saveBeheerTask = (id) => {
        const textInput = document.getElementById(`plan-edit-text-${id}`);
        const catSelect = document.getElementById(`plan-edit-cat-${id}`);
        const priSelect = document.getElementById(`plan-edit-pri-${id}`);
        const task = appData.plans.tasks.find(x => x.id === id);

        if (task && textInput) {
            const newText = textInput.value.trim();
            if (newText !== '') {
                task.text = newText;
                task.category = catSelect ? catSelect.value : task.category;
                task.priority = priSelect ? priSelect.value : task.priority;
                saveAppData(appData);
                renderPlanBeheerContent(appData);
                renderPlanboardViews(appData);
                showToast("Taak bijgewerkt! ✨");
            } else {
                showToast("Taaktekst mag niet leeg zijn.");
            }
        }
    };

    window.toggleRestoreBeheerTask = (id) => {
        const task = appData.plans.tasks.find(x => x.id === id);
        if (!task) return;
        const isCurrentlyDone = task.completed || task.done || task.archived;
        task.completed = !isCurrentlyDone;
        task.done = !isCurrentlyDone;
        task.archived = !isCurrentlyDone;
        saveAppData(appData);
        renderPlanBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast(isCurrentlyDone ? "Taak teruggezet naar openstaand! 🔄" : "Taak gemarkeerd als voltooid! ✓");
    };

    window.permDeleteBeheerTask = (id) => {
        if (confirm("Weet je zeker dat je deze taak wilt verwijderen?")) {
            appData.plans.tasks = appData.plans.tasks.filter(x => x.id !== id);
            saveAppData(appData);
            renderPlanBeheerContent(appData);
            renderPlanboardViews(appData);
            showToast("Taak verwijderd! 🗑️");
        }
    };
}

function setupPactDateFilterListeners() {
    const dateFilterSelect = document.getElementById('pact-filter-date');
    const customBox = document.getElementById('pact-custom-filter-box');
    const dateInput = document.getElementById('pact-custom-date');
    const monthInput = document.getElementById('pact-custom-month');
    const yearInput = document.getElementById('pact-custom-year');
    const weekInput = document.getElementById('pact-custom-week');

    if (!dateFilterSelect) return;

    if (customBox) customBox.classList.add('hidden');
    if (dateInput) { dateInput.classList.add('hidden'); dateInput.value = ''; }
    if (monthInput) { monthInput.classList.add('hidden'); monthInput.value = ''; }
    if (yearInput) { yearInput.classList.add('hidden'); yearInput.value = ''; }
    if (weekInput) { weekInput.classList.add('hidden'); weekInput.value = ''; }

    const val = dateFilterSelect.value;
    if (val.startsWith('specific-')) {
        if (customBox) customBox.classList.remove('hidden');
        if (val === 'specific-day' && dateInput) dateInput.classList.remove('hidden');
        if (val === 'specific-month' && monthInput) monthInput.classList.remove('hidden');
        if (val === 'specific-year' && yearInput) yearInput.classList.remove('hidden');
        if (val === 'specific-week' && weekInput) weekInput.classList.remove('hidden');
    }
}

function renderPactBeheerContent(appData) {
    window.currentPactAppDataRef = appData;
    const listEl = document.getElementById('pact-archive-list');
    if (!listEl) return;

    const searchTerm = (document.getElementById('pact-search-input')?.value || '').toLowerCase();
    const dateFilter = document.getElementById('pact-filter-date')?.value || 'all';

    const dateInput = document.getElementById('pact-custom-date');
    const monthInput = document.getElementById('pact-custom-month');
    const yearInput = document.getElementById('pact-custom-year');
    const weekInput = document.getElementById('pact-custom-week');

    let customVal = null;
    if (dateFilter === 'specific-day' && dateInput) customVal = dateInput.value;
    else if (dateFilter === 'specific-month' && monthInput) customVal = monthInput.value;
    else if (dateFilter === 'specific-year' && yearInput) customVal = yearInput.value;
    else if (dateFilter === 'specific-week' && weekInput) customVal = weekInput.value;

    const pacts = appData.plans?.eveningPacts || [];

    const filtered = pacts.filter(p => {
        const matchSearch = p.text.toLowerCase().includes(searchTerm);
        const matchDate = checkDateFilter(p.date || new Date().toISOString(), dateFilter, customVal);
        return matchSearch && matchDate;
    });

    listEl.innerHTML = filtered.length === 0 ? 
        '<p class="text-xs text-gray-400 italic text-center py-3">Geen avond-pacts gevonden met deze filters.</p>' : 
        filtered.slice().reverse().map(p => `
            <div id="pact-card-${p.id}" class="flex flex-col gap-2 p-3.5 bg-white border border-indigo-100 rounded-2xl shadow-sm text-xs">
                <div class="flex justify-between items-start">
                    <div class="w-full pr-2">
                        <span class="font-medium text-gray-900 text-sm block mb-1">${p.text}</span>
                        <span class="text-[10px] text-gray-400 block">📅 Ingegeven op: ${new Date(p.date || Date.now()).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${p.completed || p.done ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                        ${p.completed || p.done ? 'Volbracht' : 'Actief'}
                    </span>
                </div>

                <div id="pact-edit-box-${p.id}" class="hidden space-y-2 pt-2 border-t border-gray-100">
                    <input type="text" id="pact-edit-input-${p.id}" value="${p.text}" class="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                    <div class="flex gap-2 justify-end">
                        <button onclick="window.saveEveningPact(${p.id})" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">Opslaan ✨</button>
                        <button onclick="window.cancelEditEveningPact(${p.id})" class="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Annuleren</button>
                    </div>
                </div>

                <div id="pact-actions-${p.id}" class="flex gap-2 justify-end pt-2 border-t border-gray-50">
                    <button onclick="window.toggleEditEveningPact(${p.id}, true)" class="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">Bewerken ✏️</button>
                    <button onclick="window.toggleRestoreEveningPact(${p.id})" class="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition">
                        ${p.completed || p.done ? 'Terugzetten 🔄' : 'Markeer Voltooid ✓'}
                    </button>
                    <button onclick="window.deletePact(${p.id})" class="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition">Verwijderen ✕</button>
                </div>
            </div>
        `).join('');

    window.toggleEditEveningPact = (id, show) => {
        const editBox = document.getElementById(`pact-edit-box-${id}`);
        const actions = document.getElementById(`pact-actions-${id}`);
        if (editBox && actions) {
            if (show) {
                editBox.classList.remove('hidden');
                actions.classList.add('hidden');
            } else {
                editBox.classList.add('hidden');
                actions.classList.remove('hidden');
            }
        }
    };

    window.cancelEditEveningPact = (id) => {
        window.toggleEditEveningPact(id, false);
    };

    window.saveEveningPact = (id) => {
        const inputEl = document.getElementById(`pact-edit-input-${id}`);
        const pact = appData.plans.eveningPacts.find(x => x.id === id);
        if (pact && inputEl) {
            const newText = inputEl.value.trim();
            if (newText !== '') {
                pact.text = newText;
                saveAppData(appData);
                renderPactBeheerContent(appData);
                renderPlanboardViews(appData);
                showToast("Avond-pact bijgewerkt! ✨");
            } else {
                showToast("Tekst mag niet leeg zijn.");
            }
        }
    };

    window.toggleRestoreEveningPact = (id) => {
        const pact = appData.plans.eveningPacts.find(x => x.id === id);
        if (!pact) return;
        pact.completed = !pact.completed;
        pact.done = !pact.done;
        saveAppData(appData);
        renderPactBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast("Status van avond-pact gewijzigd! 🔄");
    };

    window.deletePact = (id) => {
        if (confirm("Weet je zeker dat je dit avond-pact wilt verwijderen?")) {
            appData.plans.eveningPacts = appData.plans.eveningPacts.filter(x => x.id !== id);
            saveAppData(appData);
            renderPactBeheerContent(appData);
            renderPlanboardViews(appData);
            showToast("Avond-pact verwijderd! 🗑️");
        }
    };
}

function renderCompassBeheerContent(appData) {
    window.currentCompassBeheerAppDataRef = appData;
    const tagsList = document.getElementById('compass-categories-tags-list');
    const beheerContainer = document.getElementById('compass-archive-list');
    if (!tagsList || !beheerContainer) return;

    const cats = appData.plans.categories || ['Privé', 'Klussen', 'Gezin', 'Financieel', 'Algemeen'];

    tagsList.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-900 rounded-xl text-xs font-medium">
            ${c} <button onclick="window.deleteCompassCat('${c}')" class="text-red-500 font-bold hover:text-red-700 ml-0.5">✕</button>
        </span>
    `).join('');

    const addCatBtn = document.getElementById('compass-add-cat-btn');
    if (addCatBtn) {
        addCatBtn.onclick = () => {
            const input = document.getElementById('compass-new-cat-input');
            const val = input.value.trim();
            if (val && !cats.includes(val)) {
                cats.push(val);
                appData.plans.categories = cats;
                saveAppData(appData);
                input.value = '';
                renderCompassBeheerContent(appData);
                renderPlanBeheerContent(appData); // Synchroniseer direct met planbord beheer
                initPlannenModule(appData); // Herlaad de module om selects bij te werken
                showToast("Categorie toegevoegd! ✨");
            }
        };
    }

    window.deleteCompassCat = (catName) => {
        appData.plans.categories = cats.filter(c => c !== catName);
        saveAppData(appData);
        renderCompassBeheerContent(appData);
        renderPlanBeheerContent(appData);
        initPlannenModule(appData);
        showToast("Categorie verwijderd.");
    };

    beheerContainer.innerHTML = `
        <div class="space-y-3 pt-2">
            <div class="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input type="text" id="compass-beheer-search" placeholder="🔍 Zoek in alle doelen..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                <div class="grid grid-cols-2 gap-2">
                    <select id="compass-beheer-cat" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
                        <option value="Alle">Alle categorieën</option>
                        ${cats.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="compass-beheer-date" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
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
                <div id="compass-beheer-custom-filter-box" class="hidden pt-1">
                    <input type="date" id="compass-beheer-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                    <input type="month" id="compass-beheer-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                    <input type="number" id="compass-beheer-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                    <input type="week" id="compass-beheer-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                </div>
            </div>

            <div id="compass-beheer-filtered-list" class="space-y-2 max-h-56 overflow-y-auto"></div>
        </div>
    `;

    setupCompassBeheerListeners(appData);
    renderCompassBeheerFilteredList(appData);
}

function setupCompassBeheerListeners(appData) {
    const searchInput = document.getElementById('compass-beheer-search');
    const catSelect = document.getElementById('compass-beheer-cat');
    const dateSelect = document.getElementById('compass-beheer-date');

    if (searchInput) searchInput.oninput = () => renderCompassBeheerFilteredList(appData);
    if (catSelect) catSelect.onchange = () => renderCompassBeheerFilteredList(appData);
    if (dateSelect) {
        dateSelect.onchange = () => {
            setupCompassBeheerDateFilter();
            renderCompassBeheerFilteredList(appData);
        };
    }

    ['compass-beheer-custom-date', 'compass-beheer-custom-month', 'compass-beheer-custom-year', 'compass-beheer-custom-week'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', () => renderCompassBeheerFilteredList(appData));
            el.addEventListener('change', () => renderCompassBeheerFilteredList(appData));
        }
    });
}

function setupCompassBeheerDateFilter() {
    const dateFilterSelect = document.getElementById('compass-beheer-date');
    const customBox = document.getElementById('compass-beheer-custom-filter-box');
    const dateInput = document.getElementById('compass-beheer-custom-date');
    const monthInput = document.getElementById('compass-beheer-custom-month');
    const yearInput = document.getElementById('compass-beheer-custom-year');
    const weekInput = document.getElementById('compass-beheer-custom-week');

    if (!dateFilterSelect) return;

    if (customBox) customBox.classList.add('hidden');
    if (dateInput) { dateInput.classList.add('hidden'); dateInput.value = ''; }
    if (monthInput) { monthInput.classList.add('hidden'); monthInput.value = ''; }
    if (yearInput) { yearInput.classList.add('hidden'); yearInput.value = ''; }
    if (weekInput) { weekInput.classList.add('hidden'); weekInput.value = ''; }

    const val = dateFilterSelect.value;
    if (val.startsWith('specific-')) {
        if (customBox) customBox.classList.remove('hidden');
        if (val === 'specific-day' && dateInput) dateInput.classList.remove('hidden');
        if (val === 'specific-month' && monthInput) monthInput.classList.remove('hidden');
        if (val === 'specific-year' && yearInput) yearInput.classList.remove('hidden');
        if (val === 'specific-week' && weekInput) weekInput.classList.remove('hidden');
    }
}

function renderCompassBeheerFilteredList(appData) {
    const listEl = document.getElementById('compass-beheer-filtered-list');
    if (!listEl) return;

    const searchTerm = (document.getElementById('compass-beheer-search')?.value || '').toLowerCase();
    const catFilter = document.getElementById('compass-beheer-cat')?.value || 'Alle';
    const dateFilter = document.getElementById('compass-beheer-date')?.value || 'all';

    const dateInput = document.getElementById('compass-beheer-custom-date');
    const monthInput = document.getElementById('compass-beheer-custom-month');
    const yearInput = document.getElementById('compass-beheer-custom-year');
    const weekInput = document.getElementById('compass-beheer-custom-week');

    let customVal = null;
    if (dateFilter === 'specific-day' && dateInput) customVal = dateInput.value;
    else if (dateFilter === 'specific-month' && monthInput) customVal = monthInput.value;
    else if (dateFilter === 'specific-year' && yearInput) customVal = yearInput.value;
    else if (dateFilter === 'specific-week' && weekInput) customVal = weekInput.value;

    const goals = appData.plans?.goals || [];

    const filtered = goals.filter(g => {
        const matchSearch = g.title.toLowerCase().includes(searchTerm) || (g.pitfall || '').toLowerCase().includes(searchTerm);
        const matchCat = catFilter === 'Alle' || (g.category || 'Privé') === catFilter;
        const matchDate = checkDateFilter(g.date || new Date().toISOString(), dateFilter, customVal);
        return matchSearch && matchCat && matchDate;
    });

    listEl.innerHTML = filtered.length === 0 ? 
        '<p class="text-xs text-gray-400 italic text-center py-3">Geen doelen gevonden in dit beheer.</p>' : 
        filtered.slice().reverse().map(g => `
            <div class="flex flex-col gap-2 p-3.5 bg-white border border-indigo-100 rounded-2xl shadow-sm text-xs">
                <div class="flex justify-between items-start">
                    <div class="w-full pr-2">
                        <span class="font-bold text-indigo-900 mr-1">[${g.category || 'Privé'}]</span>
                        <span class="font-bold text-indigo-950 text-sm block mt-0.5">🎯 ${g.title}</span>
                        <span class="text-[10px] text-gray-500 block mt-1">🌑 Valkuil: ${g.pitfall || 'Geen'} | 🛡️ Schild: ${g.shield || 'Geen'}</span>
                        <span class="text-[10px] text-gray-400 block mt-0.5">📅 ${new Date(g.date || Date.now()).toLocaleDateString('nl-NL')} • ${g.frequency || 'Dagelijks'}</span>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${g.archived ? 'bg-gray-100 text-gray-600' : 'bg-emerald-100 text-emerald-800'}">
                        ${g.archived ? 'Gearchiveerd' : 'Actief'}
                    </span>
                </div>

                <div id="goal-edit-box-${g.id}" class="hidden space-y-2 pt-2 border-t border-gray-100">
                    <input type="text" id="goal-edit-title-${g.id}" value="${g.title}" class="w-full px-3 py-2 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs text-gray-900">
                    <select id="goal-edit-cat-${g.id}" class="w-full px-3 py-1.5 bg-white border rounded-xl text-xs">
                        ${(appData.plans.categories || []).map(c => `<option value="${c}" ${(g.category || 'Privé') === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                    <input type="text" id="goal-edit-pitfall-${g.id}" value="${g.pitfall || ''}" placeholder="Valkuil..." class="w-full px-3 py-2 bg-white border rounded-xl text-xs">
                    <input type="text" id="goal-edit-shield-${g.id}" value="${g.shield || ''}" placeholder="Zacht Schild..." class="w-full px-3 py-2 bg-white border rounded-xl text-xs">
                    
                    <div class="grid grid-cols-2 gap-2">
                        <select id="goal-edit-freq-${g.id}" class="px-3 py-1.5 bg-white border rounded-xl text-xs">
                            <option value="Dagelijks" ${g.frequency === 'Dagelijks' ? 'selected' : ''}>Dagelijks</option>
                            <option value="Wekelijks" ${g.frequency === 'Wekelijks' ? 'selected' : ''}>Wekelijks</option>
                            <option value="Maandelijks" ${g.frequency === 'Maandelijks' ? 'selected' : ''}>Maandelijks</option>
                        </select>
                        <select id="goal-edit-pri-${g.id}" class="px-3 py-1.5 bg-white border rounded-xl text-xs">
                            <option value="Laag" ${g.priority === 'Laag' ? 'selected' : ''}>Laag</option>
                            <option value="Normaal" ${g.priority === 'Normaal' || !g.priority ? 'selected' : ''}>Normaal</option>
                            <option value="Hoog" ${g.priority === 'Hoog' ? 'selected' : ''}>Hoog</option>
                        </select>
                    </div>

                    <div class="flex gap-2 justify-end pt-1">
                        <button onclick="window.saveBeheerGoal(${g.id})" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">Opslaan ✨</button>
                        <button onclick="window.toggleBeheerEditGoal(${g.id}, false)" class="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50">Annuleren</button>
                    </div>
                </div>

                <div id="goal-actions-${g.id}" class="flex gap-2 justify-end pt-2 border-t border-gray-50">
                    <button onclick="window.toggleBeheerEditGoal(${g.id}, true)" class="px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition">Bewerken ✏️</button>
                    <button onclick="window.toggleArchiveCompassGoal(${g.id})" class="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl font-medium hover:bg-indigo-100 transition">
                        ${g.archived ? 'Activeren 🔄' : 'Archiveren 📦'}
                    </button>
                    <button onclick="window.permDeleteCompassGoal(${g.id})" class="px-2.5 py-1.5 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 transition">Verwijderen ✕</button>
                </div>
            </div>
        `).join('');

    window.toggleBeheerEditGoal = (id, show) => {
        const editBox = document.getElementById(`goal-edit-box-${id}`);
        const actions = document.getElementById(`goal-actions-${id}`);
        if (editBox && actions) {
            if (show) {
                editBox.classList.remove('hidden');
                actions.classList.add('hidden');
            } else {
                editBox.classList.add('hidden');
                actions.classList.remove('hidden');
            }
        }
    };

    window.saveBeheerGoal = (id) => {
        const titleInput = document.getElementById(`goal-edit-title-${id}`);
        const catSelect = document.getElementById(`goal-edit-cat-${id}`);
        const pitfallInput = document.getElementById(`goal-edit-pitfall-${id}`);
        const shieldInput = document.getElementById(`goal-edit-shield-${id}`);
        const freqSelect = document.getElementById(`goal-edit-freq-${id}`);
        const priSelect = document.getElementById(`goal-edit-pri-${id}`);
        
        const goal = appData.plans.goals.find(x => x.id === id);

        if (goal && titleInput) {
            const newTitle = titleInput.value.trim();
            if (newTitle !== '') {
                goal.title = newTitle;
                goal.category = catSelect ? catSelect.value : goal.category;
                goal.pitfall = pitfallInput ? pitfallInput.value.trim() : goal.pitfall;
                goal.shield = shieldInput ? shieldInput.value.trim() : goal.shield;
                goal.frequency = freqSelect ? freqSelect.value : goal.frequency;
                goal.priority = priSelect ? priSelect.value : goal.priority;
                
                saveAppData(appData);
                renderCompassBeheerContent(appData);
                renderPlanboardViews(appData);
                showToast("Kompas doel bijgewerkt! ✨");
            } else {
                showToast("Doeltitel mag niet leeg zijn.");
            }
        }
    };

    window.toggleArchiveCompassGoal = (id) => {
        const goal = appData.plans.goals.find(x => x.id === id);
        if (!goal) return;
        goal.archived = !goal.archived;
        saveAppData(appData);
        renderCompassBeheerContent(appData);
        renderPlanboardViews(appData);
        showToast(goal.archived ? "Doel gearchiveerd 📦" : "Doel geactiveerd ✨");
    };

    window.permDeleteCompassGoal = (id) => {
        if (confirm("Weet je zeker dat je dit kompas doel wilt verwijderen?")) {
            appData.plans.goals = appData.plans.goals.filter(x => x.id !== id);
            saveAppData(appData);
            renderCompassBeheerContent(appData);
            renderPlanboardViews(appData);
            showToast("Kompas doel verwijderd! 🗑️");
        }
    };
}
