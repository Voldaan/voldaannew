// js/modules/money.js
import { saveAppData, checkDateFilter, showToast } from './storage.js';

const MONEY_CATEGORIES = ['boodschappen', 'tanken', 'horeca', 'tabak', 'onverwachte uitgaven', 'uitje', 'cadeau', 'aanschaf', 'aflossen', 'loon', 'lening', 'verwachte uitgave'];
const MONEY_LABELS = ['Geen bewustwordingslabel', 'Besparing/Onnodig', 'Impulsaankoop', 'Noodzakelijk/Vaste last', 'Investeer in mezelf'];
const PERIODIC_OPTIONS = ['Eenmalig', 'Wekelijks', 'Maandelijks', 'Jaarlijks'];

// Uitgebreide databank met Kennis & Hacks specifiek voor Geld & Financiën
const MONEY_HACKS_DB = [
    {
        title: "🛡️ De 24-Uurs Wachtkamer Regel",
        text: "Ervaar je de neiging om een impulsieve aankoop te doen? Parkeer het artikel altijd eerst minimaal 24 uur in de wachtkamer hieronder. Vaak ebt de acute koopdrang vanzelf weg."
    },
    {
        title: "💡 Zero-Based Budgeting Principe",
        text: "Geef elke euro vooraf een bestemming (sparen, vaste lasten, aflossen of plezier). Wat niet geoormerkt is, lekt vaak ongemerkt weg aan kleine uitgaven."
    },
    {
        title: "🔄 Automatiseer je Aflossingen",
        text: "Zet de overboeking voor je spaargeld of lening-aflossing direct op de dag dat je loon binnenkomt. Wat je niet op je betaalrekening ziet staan, geef je ook niet uit."
    },
    {
        title: "☕ De Kracht van Kleine Betalingen",
        text: "Die dagelijkse 'kleine' uitgave van € 3,50 lijkt niets, maar tikt op jaarbasis aan tot ruim € 1.200. Bewustwording via labels helpt je de controle te behouden."
    },
    {
        title: "🎯 Focus op de Sneeuwbal-methode",
        text: "Los bij schulden of leningen eerst de kleinste post af voor snelle succesbelevingen, of juist de duurste (hoogste rente) om financieel slim te optimaliseren."
    },
    {
        title: "📊 Vaste Lasten APK'tje",
        text: "Loop elk kwartaal je abonnementen en automatische incasso's na. Vaak betaal je voor diensten die je nauwelijks tot niet meer gebruikt."
    },
    {
        title: "💶 De 50/30/20 Richtlijn voor Rust",
        text: "Probeer globaal 50% van je inkomen te besteden aan vaste lasten/noodzakelijk, 30% aan wensen/vrije tijd, en 20% aan sparen of versneld aflossen."
    },
    {
        title: "🧭 Vrijheids-Horizon Focus",
        text: "Elke euro die je extra aflost of bespaart, vergroot direct je financiële bewegingsruimte en brengt je een stap dichter bij totale rust in je hoofd."
    }
];

export function initMoneyModule(appData) {
    // Ondersteunt zowel id="geld" als id="money" uit de index.html
    const container = document.getElementById('geld') || document.getElementById('money');
    if (!container) return;

    if (!appData.money) appData.money = {};
    if (!appData.money.transactions) appData.money.transactions = [];
    if (!appData.money.expectedExpenses) appData.money.expectedExpenses = [];
    if (!appData.money.financialProjects) appData.money.financialProjects = [];
    if (!appData.money.studyDebt) {
        appData.money.studyDebt = { total: 41939, paid: 477.35, monthly: 477.35 };
    }

    container.innerHTML = `
        <!-- Bovenste Grid: Saldo (met dynamische pastel gloed) & compacte Paydayradar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div id="balance-card" class="bg-white p-5 rounded-2xl shadow-sm border-2 flex flex-col justify-between transition-all duration-300">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-xs text-gray-500 uppercase font-semibold">Actueel Banksaldo</p>
                        <button id="edit-balance-btn" class="text-xs text-indigo-600 hover:underline">Aanpassen</button>
                    </div>
                    <p id="current-balance" class="text-2xl font-bold text-indigo-900">€ 0.00</p>
                </div>
                <p class="text-[11px] text-gray-400 mt-3">Transacties passen dit automatisch aan.</p>
            </div>
            
            <!-- Aangepast: Zachtere kleur en compacter formaat voor Paydayradar -->
            <div class="bg-indigo-50/80 border border-indigo-100 p-4 rounded-2xl shadow-sm flex flex-col justify-between text-indigo-950">
                <div>
                    <p class="text-[11px] text-indigo-500 uppercase font-bold mb-0.5">Paydayradar</p>
                    <p id="payday-countdown" class="text-base font-bold text-indigo-900">Aftellen naar loon...</p>
                </div>
                <p class="text-[10px] text-gray-400 mt-2">Automatische telling naar de 23e om 08:00 uur (vrijdag ervoor indien weekend).</p>
            </div>
        </div>

        <!-- 1. Transacties & Overzicht -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">💶 Transacties & Overzicht</h2>
                <button id="open-tx-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Transactie</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Houd rust en overzicht in al je uitgaven en inkomsten. Klik op een transactie om te bewerken.</p>
            
            <div class="flex flex-col gap-2 mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                <input type="text" id="tx-search" placeholder="Zoek transactie..." class="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl">
                <div class="grid grid-cols-2 gap-2">
                    <select id="tx-filter-date" class="px-3 py-2 bg-white border border-gray-200 rounded-xl">
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
                    <select id="tx-filter-cat" class="px-3 py-2 bg-white border border-gray-200 rounded-xl">
                        <option value="Alle">Alle categorieën</option>
                        ${MONEY_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                </div>
                <div id="tx-custom-filter-box" class="hidden pt-1">
                    <input type="date" id="tx-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    <input type="month" id="tx-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    <input type="number" id="tx-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    <input type="week" id="tx-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                </div>
            </div>
            <ul id="transaction-list" class="space-y-1.5 mb-2"></ul>
            <div id="tx-expand-toggle-container" class="text-center"></div>
        </div>

        <!-- 2. Verwachte Uitgaven -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <div>
                    <h2 class="text-base font-bold text-indigo-900">📅 Verwachte Uitgaven & Vaste Lasten</h2>
                    <p id="expected-total-label" class="text-xs font-semibold text-indigo-700 mt-0.5">Totaal verwacht: € 0.00</p>
                </div>
                <button id="open-expected-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Verwachte Uitgave</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Overzicht van geplande uitgaven. Klik om te bewerken of vink af.</p>
            <ul id="expected-expense-list" class="space-y-2"></ul>
        </div>

        <!-- ✨ SUBTIELE KENNIS & HACKS WIDGET -->
        <div class="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-indigo-50/60 p-4 rounded-2xl shadow-sm border border-emerald-200/60 mb-4">
            <div class="flex justify-between items-start mb-1.5">
                <div class="flex items-center gap-1.5">
                    <span class="text-sm">🧠</span>
                    <h3 id="money-hack-title" class="text-xs font-bold text-indigo-900 uppercase tracking-wide"></h3>
                </div>
                <button id="refresh-money-hack-btn" title="Toon andere financiële tip" class="text-[11px] bg-white/80 hover:bg-white text-indigo-700 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-sm transition font-medium flex items-center gap-1">
                    <span>🔄</span> <span>Ververs Tip</span>
                </button>
            </div>
            <p id="money-hack-text" class="text-xs text-gray-600 leading-relaxed"></p>
        </div>

        <!-- 3. Het Ruimte-Kompas -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🧭 Het Ruimte-Kompas (Vrijheids-Horizon)</h2>
                <button id="open-project-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Financieel Doel</button>
            </div>
            <p class="text-xs text-gray-500 mb-2">Herstel en breng financiële afspraken & leningen rustig in balans.</p>
            
            <div class="bg-indigo-50/70 p-3.5 rounded-xl mb-3 text-xs text-indigo-950 border border-indigo-100 flex flex-col gap-1">
                <div class="flex justify-between items-center font-bold text-sm">
                    <span id="space-total-freed">€ 0.00 Vrijgemaakt</span>
                    <span id="space-total-target" class="text-indigo-700">Doel: € 0.00</span>
                </div>
                <div class="w-full bg-indigo-200 rounded-full h-2.5 overflow-hidden my-1">
                    <div id="space-progress-bar" class="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                </div>
                <p class="text-[11px] text-gray-600">Vrijheids-Horizon: groeit naarmate je leningen aflost en doelen bereikt.</p>
            </div>
            <div id="financial-projects-list" class="space-y-3"></div>
        </div>

        <!-- 4. Studieschuld-Kompas & Impuls-Wachtkamer Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-base font-bold text-indigo-900">🎓 Studieschuld Kompas</h2>
                    <button id="edit-study-debt-btn" class="text-xs text-indigo-600 hover:underline">Instellen</button>
                </div>
                <p class="text-xs text-gray-500 mb-3">Houd in jouw eigen tempo overzicht.</p>
                <div id="study-debt-summary" class="space-y-2 text-xs text-gray-700"></div>
            </div>
            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
                <h2 class="text-base font-bold text-indigo-900 mb-1">🛡️ Impuls-Wachtkamer</h2>
                <p class="text-xs text-gray-500 mb-3">Zet aankoopwensen 24 uur in de wacht.</p>
                <form id="impulse-form" class="flex flex-col gap-2 mb-3">
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" id="impulse-item" placeholder="Wat wil je kopen?" class="w-full px-3 py-2 border rounded-xl text-xs" required>
                        <input type="number" step="0.01" id="impulse-price" placeholder="Prijs (€)" class="w-full px-3 py-2 border rounded-xl text-xs" required>
                    </div>
                    <button type="submit" class="w-full py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition">Parkeren in Wachtkamer</button>
                </form>
                <ul id="impulse-list" class="space-y-1.5 text-xs text-gray-600"></ul>
            </div>
        </div>
    `;

    initMoneyModals(appData);
    initMoneyLogic(appData);
}

function initMoneyModals(appData) {
    if (document.getElementById('tx-modal')) return;

    const txModalHTML = `
        <div id="tx-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 id="tx-modal-title" class="text-sm font-bold text-indigo-950">💶 Transactie Invoeren / Bewerken</h3>
                    <button id="close-tx-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="tx-modal-form" class="space-y-3">
                    <input type="hidden" id="modal-tx-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving</label>
                        <input type="text" id="modal-tx-desc" placeholder="Bijv. Albert Heijn of Salaris" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Bedrag (€)</label>
                            <input type="number" step="0.01" id="modal-tx-amount" placeholder="Negatief (-15.50) of positief (100)" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                            <select id="modal-tx-cat" class="w-full px-3 py-2 border rounded-xl bg-white">
                                ${MONEY_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Bewustwordingslabel</label>
                            <select id="modal-tx-label" class="w-full px-3 py-2 border rounded-xl bg-white">
                                ${MONEY_LABELS.map(l => `<option value="${l}">${l}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Periodiek herhalen</label>
                            <select id="modal-tx-period" class="w-full px-3 py-2 border rounded-xl bg-white">
                                ${PERIODIC_OPTIONS.map(p => `<option value="${p}">${p}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Datum & Tijd</label>
                        <input type="datetime-local" id="modal-tx-date" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-tx-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    const expectedModalHTML = `
        <div id="expected-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 id="expected-modal-title" class="text-sm font-bold text-indigo-950">📅 Verwachte Uitgave Beheren</h3>
                    <button id="close-expected-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="expected-modal-form" class="space-y-3">
                    <input type="hidden" id="modal-exp-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving</label>
                        <input type="text" id="modal-exp-desc" placeholder="Bijv. Verzekering of abonnement" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Bedrag (€)</label>
                            <input type="number" step="0.01" id="modal-exp-amount" placeholder="Bedrag (bijv. 85.00)" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Betaalwijze</label>
                            <select id="modal-exp-method" class="w-full px-3 py-2 border rounded-xl bg-white">
                                <option value="Automatische Incasso">Automatische Incasso</option>
                                <option value="Handmatige overboeking">Handmatige overboeking</option>
                                <option value="Pin/Contant">Pin / Contant</option>
                            </select>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                            <select id="modal-exp-cat" class="w-full px-3 py-2 border rounded-xl bg-white">
                                ${MONEY_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Verwachte Datum</label>
                            <input type="date" id="modal-exp-date" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-expected-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    const projectModalHTML = `
        <div id="project-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 id="project-modal-title" class="text-sm font-bold text-indigo-950">🧭 Financieel Doel / Lening Beheren</h3>
                    <button id="close-project-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="project-modal-form" class="space-y-3">
                    <input type="hidden" id="modal-proj-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Naam Lening / Doel</label>
                        <input type="text" id="modal-proj-title" placeholder="Bijv. Achterstand betalen" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Totaal Doelbedrag (€)</label>
                            <input type="number" step="0.01" id="modal-proj-target" placeholder="Bijv. 1000" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Reeds Vrijgemaakt (€)</label>
                            <input type="number" step="0.01" id="modal-proj-freed" placeholder="Bijv. 200" class="w-full px-3 py-2 border rounded-xl">
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-project-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', txModalHTML + expectedModalHTML + projectModalHTML);
    setupModalHandlers('tx', appData);
    setupModalHandlers('expected', appData);
    setupModalHandlers('project', appData);
}

function setupModalHandlers(type, appData) {
    const modal = document.getElementById(`${type}-modal`);
    const openBtn = document.getElementById(`open-${type}-modal-btn`);
    const closeBtn = document.getElementById(`close-${type}-modal`);
    const cancelBtn = document.getElementById(`cancel-${type}-modal`);
    const form = document.getElementById(`${type}-modal-form`);
    if (!modal) return;

    if (openBtn) openBtn.onclick = () => {
        if (type === 'tx') {
            document.getElementById('modal-tx-id').value = '';
            document.getElementById('tx-modal-form').reset();
            document.getElementById('tx-modal-title').textContent = '💶 Nieuwe Transactie Invoeren';
        } else if (type === 'expected') {
            document.getElementById('modal-exp-id').value = '';
            document.getElementById('expected-modal-form').reset();
            document.getElementById('expected-modal-title').textContent = '📅 Nieuwe Verwachte Uitgave';
        } else if (type === 'project') {
            document.getElementById('modal-proj-id').value = '';
            document.getElementById('project-modal-form').reset();
            document.getElementById('project-modal-title').textContent = '🧭 Nieuw Financieel Doel';
        }
        modal.classList.remove('hidden');
    };
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    if (cancelBtn) cancelBtn.onclick = () => modal.classList.add('hidden');
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            if (type === 'tx') {
                const id = document.getElementById('modal-tx-id').value;
                const description = document.getElementById('modal-tx-desc').value.trim();
                const amount = parseFloat(document.getElementById('modal-tx-amount').value);
                const category = document.getElementById('modal-tx-cat').value;
                const label = document.getElementById('modal-tx-label').value;
                const period = document.getElementById('modal-tx-period').value;
                const dateVal = document.getElementById('modal-tx-date').value;
                if (description && !isNaN(amount)) {
                    if (!appData.money.transactions) appData.money.transactions = [];
                    if (id) {
                        const tx = appData.money.transactions.find(x => x.id == id);
                        if (tx) {
                            appData.money.balance -= tx.amount; 
                            tx.description = description;
                            tx.amount = amount;
                            tx.category = category;
                            tx.label = label;
                            tx.period = period;
                            if (dateVal) tx.date = new Date(dateVal).toISOString();
                            appData.money.balance += amount; 
                        }
                    } else {
                        appData.money.transactions.push({
                            id: Date.now(), description, amount, category, label, period,
                            date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString()
                        });
                        appData.money.balance = (appData.money.balance || 0) + amount;
                    }
                    saveAppData(appData);
                    modal.classList.add('hidden');
                    form.reset();
                    renderMoneyViews(appData);
                    showToast("Transactie opgeslagen! 💶");
                }
            } else if (type === 'expected') {
                const id = document.getElementById('modal-exp-id').value;
                const description = document.getElementById('modal-exp-desc').value.trim();
                const amount = parseFloat(document.getElementById('modal-exp-amount').value);
                const method = document.getElementById('modal-exp-method').value;
                const category = document.getElementById('modal-exp-cat').value;
                const date = document.getElementById('modal-exp-date').value;
                if (description && !isNaN(amount) && date) {
                    if (!appData.money.expectedExpenses) appData.money.expectedExpenses = [];
                    if (id) {
                        const exp = appData.money.expectedExpenses.find(x => x.id == id);
                        if (exp) {
                            exp.description = description;
                            exp.amount = amount;
                            exp.method = method;
                            exp.category = category;
                            exp.date = date;
                        }
                    } else {
                        appData.money.expectedExpenses.push({ id: Date.now(), description, amount, method, category, date, completed: false });
                    }
                    saveAppData(appData);
                    modal.classList.add('hidden');
                    form.reset();
                    renderMoneyViews(appData);
                    showToast("Verwachte uitgave bijgewerkt! 📅");
                }
            } else if (type === 'project') {
                const id = document.getElementById('modal-proj-id').value;
                const title = document.getElementById('modal-proj-title').value.trim();
                const target = parseFloat(document.getElementById('modal-proj-target').value);
                const freed = parseFloat(document.getElementById('modal-proj-freed').value) || 0;
                if (title && !isNaN(target)) {
                    if (!appData.money.financialProjects) appData.money.financialProjects = [];
                    if (id) {
                        const proj = appData.money.financialProjects.find(x => x.id == id);
                        if (proj) {
                            proj.title = title;
                            proj.target = target;
                            proj.freed = freed;
                        }
                    } else {
                        appData.money.financialProjects.push({ id: Date.now(), title, target, freed, history: [] });
                    }
                    saveAppData(appData);
                    modal.classList.add('hidden');
                    form.reset();
                    renderMoneyViews(appData);
                    showToast("Financieel doel opgeslagen! 🧭");
                }
            }
        };
    }
}

function initMoneyLogic(appData) {
    // Initialiseer Kennis & Hacks widget
    let currentMoneyHackIndex = Math.floor(Math.random() * MONEY_HACKS_DB.length);
    const renderCurrentMoneyHack = () => {
        const hack = MONEY_HACKS_DB[currentMoneyHackIndex];
        const titleEl = document.getElementById('money-hack-title');
        const textEl = document.getElementById('money-hack-text');
        if (titleEl && textEl) {
            titleEl.textContent = hack.title;
            textEl.textContent = hack.text;
        }
    };
    renderCurrentMoneyHack();

    const refreshMoneyHackBtn = document.getElementById('refresh-money-hack-btn');
    if (refreshMoneyHackBtn) {
        refreshMoneyHackBtn.onclick = () => {
            currentMoneyHackIndex = (currentMoneyHackIndex + 1) % MONEY_HACKS_DB.length;
            renderCurrentMoneyHack();
            showToast("Nieuwe financiële tip geladen! 💡");
        };
    }

    document.getElementById('edit-balance-btn').onclick = () => {
        const val = prompt("Voer je actuele banksaldo in:", appData.money.balance || 0);
        if (val !== null && !isNaN(parseFloat(val))) {
            appData.money.balance = parseFloat(val);
            saveAppData(appData);
            renderMoneyViews(appData);
        }
    };
    document.getElementById('tx-search').oninput = () => renderMoneyViews(appData);
    document.getElementById('tx-filter-cat').onchange = () => renderMoneyViews(appData);
    
    const dateFilterSelect = document.getElementById('tx-filter-date');
    const customBox = document.getElementById('tx-custom-filter-box');
    const dateInput = document.getElementById('tx-custom-date');
    const monthInput = document.getElementById('tx-custom-month');
    const yearInput = document.getElementById('tx-custom-year');
    const weekInput = document.getElementById('tx-custom-week');

    dateFilterSelect.onchange = () => {
        customBox.classList.add('hidden');
        if(dateInput) dateInput.classList.add('hidden');
        if(monthInput) monthInput.classList.add('hidden');
        if(yearInput) yearInput.classList.add('hidden');
        if(weekInput) weekInput.classList.add('hidden');

        const val = dateFilterSelect.value;
        if (val.startsWith('specific-')) {
            customBox.classList.remove('hidden');
            if (val === 'specific-day' && dateInput) dateInput.classList.remove('hidden');
            if (val === 'specific-month' && monthInput) monthInput.classList.remove('hidden');
            if (val === 'specific-year' && yearInput) yearInput.classList.remove('hidden');
            if (val === 'specific-week' && weekInput) weekInput.classList.remove('hidden');
        }
        renderMoneyViews(appData);
    };

    [dateInput, monthInput, yearInput, weekInput].forEach(inp => {
        if(inp) {
            inp.onchange = () => renderMoneyViews(appData);
            inp.oninput = () => renderMoneyViews(appData);
        }
    });

    document.getElementById('impulse-form').onsubmit = (e) => {
        e.preventDefault();
        const item = document.getElementById('impulse-item').value.trim();
        const price = parseFloat(document.getElementById('impulse-price').value);
        if (item && !isNaN(price)) {
            if (!appData.money.impulseWants) appData.money.impulseWants = [];
            appData.money.impulseWants.push({ id: Date.now(), item, price, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderMoneyViews(appData);
            showToast("Geparkeerd in de Impuls-Wachtkamer! 🛡️");
        }
    };

    document.getElementById('edit-study-debt-btn').onclick = () => {
        const total = prompt("Totale studieschuld (€):", appData.money.studyDebt?.total || 0);
        const paid = prompt("Reeds afgelost (€):", appData.money.studyDebt?.paid || 0);
        const monthly = prompt("Maandelijkse aflossing (€):", appData.money.studyDebt?.monthly || 50);
        if (total !== null && paid !== null && monthly !== null) {
            appData.money.studyDebt = { total: parseFloat(total) || 0, paid: parseFloat(paid) || 0, monthly: parseFloat(monthly) || 50 };
            saveAppData(appData);
            renderMoneyViews(appData);
            showToast("Studieschuld bijgewerkt! 🎓");
        }
    };

    renderMoneyViews(appData);
    initPaydayRadar();
}

let showAllTxs = false;

function renderMoneyViews(appData) {
    const balanceEl = document.getElementById('current-balance');
    const balanceCard = document.getElementById('balance-card');
    const balance = appData.money?.balance || 0;
    
    balanceEl.textContent = `€ ${balance.toFixed(2)}`;
    balanceEl.className = balance < 0 ? "text-2xl font-bold text-red-600" : "text-2xl font-bold text-indigo-900";

    // Dynamische pastelgroene gloed of pastelroder bij lager dan € -350
    if (balanceCard) {
        if (balance < -350) {
            // Zachte pastelrode kleur & gloed
            balanceCard.style.borderColor = 'rgba(254, 202, 202, 0.9)';
            balanceCard.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.15)';
            balanceCard.style.backgroundColor = 'rgba(254, 242, 242, 0.4)';
        } else {
            // Mooie zachte pastelgroene gloed voor veilige/gezonde zone
            balanceCard.style.borderColor = 'rgba(167, 243, 208, 0.9)';
            balanceCard.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.15)';
            balanceCard.style.backgroundColor = 'rgba(236, 253, 245, 0.4)';
        }
    }

    const txList = document.getElementById('transaction-list');
    const toggleContainer = document.getElementById('tx-expand-toggle-container');
    const searchTerm = document.getElementById('tx-search').value.toLowerCase();
    const dateFilter = document.getElementById('tx-filter-date').value;
    const catFilter = document.getElementById('tx-filter-cat').value;

    let customVal = null;
    if (dateFilter === 'specific-day') customVal = document.getElementById('tx-custom-date').value;
    else if (dateFilter === 'specific-month') customVal = document.getElementById('tx-custom-month').value;
    else if (dateFilter === 'specific-year') customVal = document.getElementById('tx-custom-year').value;
    else if (dateFilter === 'specific-week') customVal = document.getElementById('tx-custom-week').value;

    const txs = (appData.money?.transactions || []).filter(t => {
        const matchSearch = t.description.toLowerCase().includes(searchTerm) || t.category.toLowerCase().includes(searchTerm);
        const matchCat = catFilter === 'Alle' || t.category === catFilter;
        const matchDate = checkDateFilter(t.date, dateFilter, customVal);
        return matchSearch && matchCat && matchDate;
    });

    const displayTxs = showAllTxs ? txs.slice().reverse() : txs.slice(-5).reverse();
    txList.innerHTML = displayTxs.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen transacties gevonden.</p>' : displayTxs.map(t => `
        <li onclick="window.openEditTxModal(${t.id})" class="flex justify-between items-center p-3 rounded-xl text-xs border cursor-pointer hover:bg-gray-50/80 transition ${t.amount >= 0 ? 'bg-green-50/40 border-green-100 text-green-950' : 'bg-red-50/40 border-red-100 text-red-950'}">
            <div>
                <span class="font-bold">[${t.category}]</span> <span class="text-sm font-medium">${t.description}</span>
                <span class="text-[10px] text-gray-500 block mt-0.5">${t.label || ''} • ${new Date(t.date).toLocaleDateString('nl-NL')}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-bold text-sm">${t.amount >= 0 ? '+' : ''}€ ${t.amount.toFixed(2)}</span>
                <button onclick="event.stopPropagation(); window.deleteTransaction(${t.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </li>
    `).join('');

    if (txs.length > 5) {
        toggleContainer.innerHTML = `<button onclick="window.toggleShowAllTxs()" class="text-xs text-indigo-600 font-semibold underline mt-1">${showAllTxs ? 'Minder weergeven (max 5)' : `Alles weergeven (${txs.length} transacties)`}</button>`;
    } else {
        toggleContainer.innerHTML = '';
    }

    window.toggleShowAllTxs = () => {
        showAllTxs = !showAllTxs;
        renderMoneyViews(appData);
    };

    window.openEditTxModal = (id) => {
        const t = appData.money.transactions.find(x => x.id === id);
        if (t) {
            document.getElementById('modal-tx-id').value = t.id;
            document.getElementById('modal-tx-desc').value = t.description;
            document.getElementById('modal-tx-amount').value = t.amount;
            document.getElementById('modal-tx-cat').value = t.category;
            document.getElementById('modal-tx-label').value = t.label || MONEY_LABELS[0];
            document.getElementById('modal-tx-period').value = t.period || PERIODIC_OPTIONS[0];
            if (t.date) {
                document.getElementById('modal-tx-date').value = new Date(t.date).toISOString().slice(0, 16);
            }
            document.getElementById('tx-modal-title').textContent = '💶 Transactie Bewerken';
            document.getElementById('tx-modal').classList.remove('hidden');
        }
    };

    window.deleteTransaction = (id) => {
        const tx = appData.money.transactions.find(x => x.id === id);
        if (tx) {
            appData.money.balance -= tx.amount;
            appData.money.transactions = appData.money.transactions.filter(x => x.id !== id);
            saveAppData(appData);
            renderMoneyViews(appData);
            showToast("Transactie verwijderd.");
        }
    };

    const expList = document.getElementById('expected-expense-list');
    const expenses = appData.money?.expectedExpenses || [];
    let totalExpectedAmount = 0;
    expenses.forEach(e => { if (!e.completed) totalExpectedAmount += e.amount; });
    document.getElementById('expected-total-label').textContent = `Totaal nog te verwachten: € ${totalExpectedAmount.toFixed(2)}`;
    
    expList.innerHTML = expenses.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen verwachte uitgaven ingesteld.</p>' : expenses.map(e => `
        <div class="flex justify-between items-center p-3 bg-gray-50 border rounded-xl text-xs ${e.completed ? 'opacity-50 line-through' : ''}">
            <div onclick="window.openEditExpectedModal(${e.id})" class="cursor-pointer flex-1">
                <span class="font-bold text-indigo-950 text-xs">[${e.category}]</span> <span class="font-medium text-gray-900 text-sm">${e.description}</span> - <span class="font-bold text-sm">€ ${e.amount.toFixed(2)}</span>
                <span class="text-[11px] text-gray-500 block mt-0.5">Betaalwijze: ${e.method} • Datum: ${e.date}</span>
            </div>
            <div class="flex gap-2 items-center">
                <button onclick="window.toggleExpectedExpense(${e.id})" class="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100">${e.completed ? 'Terugzetten' : 'Afvinken ✨'}</button>
                <button onclick="window.deleteExpected(${e.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </div>
    `).join('');

    window.openEditExpectedModal = (id) => {
        const e = appData.money.expectedExpenses.find(x => x.id === id);
        if (e) {
            document.getElementById('modal-exp-id').value = e.id;
            document.getElementById('modal-exp-desc').value = e.description;
            document.getElementById('modal-exp-amount').value = e.amount;
            document.getElementById('modal-exp-method').value = e.method;
            document.getElementById('modal-exp-cat').value = e.category;
            document.getElementById('modal-exp-date').value = e.date;
            document.getElementById('expected-modal-title').textContent = '📅 Verwachte Uitgave Bewerken';
            document.getElementById('expected-modal').classList.remove('hidden');
        }
    };

    window.toggleExpectedExpense = (id) => {
        const exp = appData.money.expectedExpenses.find(x => x.id === id);
        if (exp) {
            exp.completed = !exp.completed;
            if (exp.completed) {
                if (!appData.money.transactions) appData.money.transactions = [];
                appData.money.transactions.push({ id: Date.now(), description: `Verwacht: ${exp.description}`, amount: -exp.amount, category: exp.category, label: 'Noodzakelijk/Vaste last', date: new Date().toISOString() });
                appData.money.balance -= exp.amount;
            }
            saveAppData(appData);
            renderMoneyViews(appData);
        }
    };

    window.deleteExpected = (id) => {
        appData.money.expectedExpenses = appData.money.expectedExpenses.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoneyViews(appData);
    };

    const projList = document.getElementById('financial-projects-list');
    const projects = appData.money?.financialProjects || [];
    let totalFreedGlobal = 0;
    let totalTargetGlobal = 0;
    
    projList.innerHTML = projects.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen financiële projecten of leningen ingevoerd.</p>' : projects.map(p => {
        totalFreedGlobal += p.freed;
        totalTargetGlobal += p.target;
        const pct = p.target > 0 ? Math.min(100, Math.round((p.freed / p.target) * 100)) : 0;
        return `
            <div class="p-3.5 bg-gray-50 border rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                    <span onclick="window.openEditProjectModal(${p.id})" class="font-bold text-indigo-950 text-sm cursor-pointer hover:underline">🎯 ${p.title} (Doel: € ${p.target.toFixed(2)})</span>
                    <div class="flex gap-2 items-center">
                        <button onclick="window.openEditProjectModal(${p.id})" class="text-indigo-600 font-semibold">Bewerken</button>
                        <button onclick="window.deleteFinancialProject(${p.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
                    </div>
                </div>
                <div class="flex justify-between text-gray-600">
                    <span>Vrijgemaakt: € ${p.freed.toFixed(2)}</span>
                    <span class="font-bold text-indigo-700">${pct}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div>
                </div>
                <div class="flex gap-2 pt-1">
                    <input type="number" step="0.01" id="repay-input-${p.id}" placeholder="Bedrag aflossen..." class="px-2 py-1.5 border rounded-lg text-xs w-32 bg-white">
                    <button onclick="window.repayProject(${p.id})" class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold">Aflossen 💶</button>
                </div>
            </div>
        `;
    }).join('');

    const globalPct = totalTargetGlobal > 0 ? Math.min(100, Math.round((totalFreedGlobal / totalTargetGlobal) * 100)) : 0;
    document.getElementById('space-total-freed').textContent = `€ ${totalFreedGlobal.toFixed(2)} Vrijgemaakt`;
    document.getElementById('space-total-target').textContent = `Doel: € ${totalTargetGlobal.toFixed(2)}`;
    document.getElementById('space-progress-bar').style.width = `${globalPct}%`;

    window.openEditProjectModal = (id) => {
        const p = appData.money.financialProjects.find(x => x.id === id);
        if (p) {
            document.getElementById('modal-proj-id').value = p.id;
            document.getElementById('modal-proj-title').value = p.title;
            document.getElementById('modal-proj-target').value = p.target;
            document.getElementById('modal-proj-freed').value = p.freed;
            document.getElementById('project-modal-title').textContent = '🧭 Financieel Doel Bewerken';
            document.getElementById('project-modal').classList.remove('hidden');
        }
    };

    window.repayProject = (id) => {
        const input = document.getElementById(`repay-input-${id}`);
        const val = parseFloat(input.value);
        const proj = appData.money.financialProjects.find(x => x.id === id);
        if (proj && !isNaN(val) && val > 0) {
            proj.freed += val;
            saveAppData(appData);
            renderMoneyViews(appData);
            showToast("Aflossing geregistreerd in Ruimte-Kompas! 💶");
        }
    };

    window.deleteFinancialProject = (id) => {
        appData.money.financialProjects = appData.money.financialProjects.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoneyViews(appData);
    };

    const studySummary = document.getElementById('study-debt-summary');
    const study = appData.money?.studyDebt || { total: 41939, paid: 477.35, monthly: 477.35 };
    const rest = Math.max(0, study.total - study.paid);
    const monthsLeft = study.monthly > 0 ? Math.ceil(rest / study.monthly) : 0;
    const yearsLeft = (monthsLeft / 12).toFixed(1);
    
    studySummary.innerHTML = `
        <div class="flex justify-between"><span>Totale schuld:</span><span class="font-bold">€ ${study.total.toFixed(2)}</span></div>
        <div class="flex justify-between"><span>Reeds afgelost:</span><span class="font-bold text-green-700">€ ${study.paid.toFixed(2)}</span></div>
        <div class="flex justify-between"><span>Resterend bedrag:</span><span class="font-bold text-indigo-900">€ ${rest.toFixed(2)}</span></div>
        <div class="flex justify-between pt-1 border-t"><span>Geschatte looptijd:</span><span class="font-bold">${monthsLeft} maanden (${yearsLeft} jaar)</span></div>
    `;

    const impulseList = document.getElementById('impulse-list');
    const impulses = appData.money?.impulseWants || [];
    impulseList.innerHTML = impulses.length === 0 ? '<p class="italic text-gray-400">Geen aankopen in de wachtkamer.</p>' : impulses.map(i => `
        <div class="flex justify-between items-center py-1.5 border-b">
            <span>⏳ ${i.item} (€ ${i.price.toFixed(2)})</span>
            <button onclick="window.deleteImpulse(${i.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
        </div>
    `).join('');

    window.deleteImpulse = (id) => {
        appData.money.impulseWants = appData.money.impulseWants.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoneyViews(appData);
    };
}

function initPaydayRadar() {
    const radarEl = document.getElementById('payday-countdown');
    if (!radarEl) return;
    function updateRadar() {
        const now = new Date();
        let payday = new Date(now.getFullYear(), now.getMonth(), 23, 8, 0, 0);
        if (now > payday) payday = new Date(now.getFullYear(), now.getMonth() + 1, 23, 8, 0, 0);
        const dayOfWeek = payday.getDay();
        if (dayOfWeek === 6) payday.setDate(payday.getDate() - 1);
        if (dayOfWeek === 0) payday.setDate(payday.getDate() - 2);
        const diff = payday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        radarEl.textContent = `Nog ${days}d en ${hours}u loon! 💶`;
    }
    updateRadar();
    setInterval(updateRadar, 60000);
}
