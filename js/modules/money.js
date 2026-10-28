// js/modules/money.js
import { saveAppData, checkDateFilter } from './storage.js';

const MONEY_CATEGORIES = ['boodschappen', 'tanken', 'horeca', 'tabak', 'onverwachte uitgaven', 'uitje', 'cadeau', 'aanschaf', 'aflossen', 'loon', 'lening', 'verwachte uitgave'];
const MONEY_LABELS = ['Geen bewustwordingslabel', 'Besparing/Onnodig', 'Impulsaankoop', 'Noodzakelijk/Vaste last', 'Investeer in mezelf'];
const PERIODIC_OPTIONS = ['Eenmalig', 'Wekelijks', 'Maandelijks', 'Jaarlijks'];

export function initMoneyModule(appData) {
    const container = document.getElementById('geld');
    if (!container) return;

    // Directe fallback en inlezen van zowel geneste appData als oude backup sleutels uit localStorage
    if (!appData.money) appData.money = {};

    let rawBalance = localStorage.getItem('voldaan_bank_balance');
    let rawTransactions = localStorage.getItem('voldaan_transactions');
    let rawBills = localStorage.getItem('voldaan_fixed_bills');
    let rawProjects = localStorage.getItem('voldaan_ruimte_projects');
    let rawStudy = localStorage.getItem('voldaan_study_debt');

    if (rawBalance && (!appData.money.balance || appData.money.balance === 0)) {
        appData.money.balance = parseFloat(rawBalance) || 37.70;
    }

    if ((!appData.money.transactions || appData.money.transactions.length === 0) && rawTransactions) {
        try {
            const parsedTx = JSON.parse(rawTransactions);
            appData.money.transactions = parsedTx.map(tx => ({
                id: tx.id || Date.now(),
                description: tx.title || tx.description || 'Transactie',
                amount: tx.type === 'EXPENSE' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
                category: tx.category || 'Algemeen',
                label: tx.label || 'Geen bewustwordingslabel',
                date: tx.datetime || tx.created || new Date().toISOString()
            }));
        } catch (e) { console.error("Fout bij inlezen oude transacties:", e); }
    }

    if ((!appData.money.expectedExpenses || appData.money.expectedExpenses.length === 0) && rawBills) {
        try {
            const parsedBills = JSON.parse(rawBills);
            appData.money.expectedExpenses = parsedBills.map(ex => ({
                id: ex.id || Date.now(),
                description: ex.name || 'Verwachte uitgave',
                amount: ex.amount || ex.rawAmount || 0,
                method: ex.type || 'Automatische Incasso',
                category: 'Geld & Aflossingen',
                date: ex.date || new Date().toISOString().slice(0,10),
                completed: ex.paid || false
            }));
        } catch (e) { console.error("Fout bij inlezen oude vaste lasten:", e); }
    }

    if ((!appData.money.financialProjects || appData.money.financialProjects.length === 0) && rawProjects) {
        try {
            const parsedProj = JSON.parse(rawProjects);
            appData.money.financialProjects = parsedProj.map(p => ({
                id: p.id || Date.now(),
                title: p.title,
                target: p.totalAmount || 0,
                freed: p.repaidAmount || 0,
                history: p.history || []
            }));
        } catch (e) { console.error("Fout bij inlezen oude ruimte projecten:", e); }
    }

    if (!appData.money.studyDebt && rawStudy) {
        try {
            appData.money.studyDebt = JSON.parse(rawStudy);
        } catch (e) { console.error("Fout bij inlezen studieschuld:", e); }
    }

    if (!appData.money.studyDebt) {
        appData.money.studyDebt = { total: 41939, paid: 477.35, monthly: 477.35 };
    }

    container.innerHTML = `
        <!-- Bovenste Grid: Saldo & Paydayradar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-xs text-gray-500 uppercase font-semibold">Actueel Banksaldo</p>
                        <button id="edit-balance-btn" class="text-xs text-indigo-600 hover:underline">Aanpassen</button>
                    </div>
                    <p id="current-balance" class="text-2xl font-bold text-indigo-900">€ 0.00</p>
                </div>
                <p class="text-[11px] text-gray-400 mt-3">Transacties passen dit automatisch aan.</p>
            </div>

            <div class="bg-indigo-900 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <p class="text-xs text-indigo-200 uppercase font-semibold mb-1">Paydayradar</p>
                    <p id="payday-countdown" class="text-xl font-bold">Aftellen naar loon...</p>
                </div>
                <p class="text-[11px] text-indigo-300 mt-3">Automatische telling naar de 23e om 08:00 uur (vrijdag ervoor indien weekend).</p>
            </div>
        </div>

        <!-- 1. Transacties (Inkomsten & Uitgaven) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">💶 Transacties & Overzicht</h2>
                <button id="open-tx-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Transactie</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Houd rust en overzicht in al je uitgaven en inkomsten.</p>

            <div class="flex flex-col sm:flex-row gap-2 mb-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <input type="text" id="tx-search" placeholder="Zoek transactie..." class="w-full px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                <select id="tx-filter-date" class="w-full sm:w-auto px-2 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                    <option value="all">Alles</option>
                    <option value="today">Vandaag</option>
                    <option value="week">Deze week</option>
                    <option value="month">Deze maand</option>
                    <option value="year">Dit jaar</option>
                </select>
            </div>
            <ul id="transaction-list" class="space-y-1.5"></ul>
        </div>

        <!-- 2. Verwachte Uitgaven -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">📅 Verwachte Uitgaven & Vaste Lasten</h2>
                <button id="open-expected-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Verwachte Uitgave</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Overzicht van geplande uitgaven. Vink af om ze door te zetten naar transacties & saldo.</p>
            <ul id="expected-expense-list" class="space-y-2"></ul>
        </div>

        <!-- 3. Het Ruimte-Kompas (Financiële Projecten) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🧭 Het Ruimte-Kompas</h2>
                <button id="open-project-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Financieel Project</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Herstel en breng financiële afspraken & leningen rustig in balans.</p>
            
            <div class="bg-indigo-50/60 p-3.5 rounded-xl mb-3 text-xs text-indigo-950 flex justify-between items-center">
                <div>
                    <p class="font-bold text-sm" id="space-total-freed">€ 0.00 <span class="text-[11px] font-normal text-gray-600">Vrijgemaakt</span></p>
                    <p class="text-[11px] text-gray-500 mt-0.5">Vrijheids-Horizon: groeit naarmate je aflost.</p>
                </div>
            </div>
            <div id="financial-projects-list" class="space-y-3"></div>
        </div>

        <!-- 4. Studieschuld-Kompas & Impuls-Wachtkamer Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Studieschuld -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-base font-bold text-indigo-900">🎓 Studieschuld Kompas</h2>
                    <button id="edit-study-debt-btn" class="text-xs text-indigo-600 hover:underline">Instellen</button>
                </div>
                <p class="text-xs text-gray-500 mb-3">Houd in jouw eigen tempo overzicht.</p>
                <div id="study-debt-summary" class="space-y-2 text-xs text-gray-700"></div>
            </div>

            <!-- Impuls-Wachtkamer -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <h2 class="text-base font-bold text-indigo-900 mb-1">🛡️ Impuls-Wachtkamer</h2>
                <p class="text-xs text-gray-500 mb-3">Zet aankoopwensen 24 uur in de wacht.</p>
                <form id="impulse-form" class="flex flex-col gap-2 mb-3">
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" id="impulse-item" placeholder="Wat wil je kopen?" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                        <input type="number" step="0.01" id="impulse-price" placeholder="Prijs (€)" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
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
    const txModalHTML = `
        <div id="tx-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">💶 Nieuwe Transactie Invoeren</h3>
                    <button id="close-tx-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form id="tx-modal-form" class="space-y-3 text-xs">
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
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan & Bereken Saldo ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const expectedModalHTML = `
        <div id="expected-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">📅 Nieuwe Verwachte Uitgave</h3>
                    <button id="close-expected-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form id="expected-modal-form" class="space-y-3 text-xs">
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
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const projectModalHTML = `
        <div id="project-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">🧭 Financieel Project Beheer</h3>
                    <button id="close-project-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form id="project-modal-form" class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Naam Project / Lening</label>
                        <input type="text" id="modal-proj-title" placeholder="Bijv. Achterstand betalen" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Totaal Doelbedrag (€)</label>
                        <input type="number" step="0.01" id="modal-proj-target" placeholder="Bijv. 1000" class="w-full px-3 py-2 border rounded-xl" required>
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

    if (openBtn) openBtn.onclick = () => modal.classList.remove('hidden');
    if (closeBtn) closeBtn.onclick = () => modal.classList.add('hidden');
    if (cancelBtn) cancelBtn.onclick = () => modal.classList.add('hidden');

    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            if (type === 'tx') {
                const description = document.getElementById('modal-tx-desc').value.trim();
                const amount = parseFloat(document.getElementById('modal-tx-amount').value);
                const category = document.getElementById('modal-tx-cat').value;
                const label = document.getElementById('modal-tx-label').value;
                const period = document.getElementById('modal-tx-period').value;
                const dateVal = document.getElementById('modal-tx-date').value;

                if (description && !isNaN(amount)) {
                    if (!appData.money.transactions) appData.money.transactions = [];
                    appData.money.transactions.push({
                        id: Date.now(), description, amount, category, label, period,
                        date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString()
                    });
                    appData.money.balance = (appData.money.balance || 0) + amount;
                    saveAppData(appData);
                    modal.classList.add('hidden');
                    form.reset();
                    renderMoneyViews(appData);
                }
            } else if (type === 'expected') {
                const description = document.getElementById('modal-exp-desc').value.trim();
                const amount = parseFloat(document.getElementById('modal-exp-amount').value);
                const method = document.getElementById('modal-exp-method').value;
                const category = document.getElementById('modal-exp-cat').value;
                const date = document.getElementById('modal-exp-date').value;

                if (description && !isNaN(amount) && date) {
                    if (!appData.money.expectedExpenses) appData.money.expectedExpenses = [];
                    appData.money.expectedExpenses.push({ id: Date.now(), description, amount, method, category, date, completed: false });
                    saveAppData(appData);
                    modal.classList.add('hidden');
                    form.reset();
                    renderMoneyViews(appData);
                }
            } else if (type === 'project') {
                const title = document.getElementById('modal-proj-title').value.trim();
                const target = parseFloat(document.getElementById('modal-proj-target').value);

                if (title && !isNaN(target)) {
                    if (!appData.money.financialProjects) appData.money.financialProjects = [];
                    appData.money.financialProjects.push({ id: Date.now(), title, target, freed: 0, history: [] });
                    saveAppData(appData);
                    modal.classList.add('hidden');
                    form.reset();
                    renderMoneyViews(appData);
                }
            }
        };
    }
}

function initMoneyLogic(appData) {
    document.getElementById('edit-balance-btn').onclick = () => {
        const val = prompt("Voer je actuele banksaldo in:", appData.money.balance || 0);
        if (val !== null && !isNaN(parseFloat(val))) {
            appData.money.balance = parseFloat(val);
            saveAppData(appData);
            renderMoneyViews(appData);
        }
    };

    document.getElementById('tx-search').oninput = () => renderMoneyViews(appData);
    document.getElementById('tx-filter-date').onchange = () => renderMoneyViews(appData);

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
        }
    };

    renderMoneyViews(appData);
    initPaydayRadar();
}

function renderMoneyViews(appData) {
    const balanceEl = document.getElementById('current-balance');
    const balance = appData.money?.balance || 37.70;
    balanceEl.textContent = `€ ${balance.toFixed(2)}`;
    balanceEl.className = balance < 0 ? "text-2xl font-bold text-red-600" : "text-2xl font-bold text-indigo-900";

    const txList = document.getElementById('transaction-list');
    const searchTerm = document.getElementById('tx-search').value.toLowerCase();
    const dateFilter = document.getElementById('tx-filter-date').value;
    
    const txs = (appData.money?.transactions || []).filter(t => {
        const matchSearch = t.description.toLowerCase().includes(searchTerm) || t.category.toLowerCase().includes(searchTerm);
        const matchDate = checkDateFilter(t.date, dateFilter);
        return matchSearch && matchDate;
    });

    txList.innerHTML = txs.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen transacties gevonden.</p>' : txs.slice(-10).reverse().map(t => `
        <li class="flex justify-between items-center p-2.5 rounded-xl text-xs border ${t.amount >= 0 ? 'bg-green-50/50 border-green-100 text-green-900' : 'bg-red-50/50 border-red-100 text-red-900'}">
            <div>
                <span class="font-bold">[${t.category}]</span> ${t.description} 
                <span class="text-[10px] text-gray-400 block">${t.label || ''} • ${new Date(t.date).toLocaleDateString('nl-NL')}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="font-bold">${t.amount >= 0 ? '+' : ''}€ ${t.amount.toFixed(2)}</span>
                <button onclick="window.deleteTransaction(${t.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </li>
    `).join('');

    window.deleteTransaction = (id) => {
        const tx = appData.money.transactions.find(x => x.id === id);
        if (tx) {
            appData.money.balance -= tx.amount;
            appData.money.transactions = appData.money.transactions.filter(x => x.id !== id);
            saveAppData(appData);
            renderMoneyViews(appData);
        }
    };

    const expList = document.getElementById('expected-expense-list');
    const expenses = appData.money?.expectedExpenses || [];

    expList.innerHTML = expenses.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen verwachte uitgaven ingesteld.</p>' : expenses.map(e => `
        <div class="flex justify-between items-center p-2.5 bg-gray-50 border rounded-xl text-xs ${e.completed ? 'opacity-50 line-through' : ''}">
            <div>
                <span class="font-bold text-indigo-900">[${e.category}]</span> ${e.description} - € ${e.amount.toFixed(2)}
                <span class="text-[10px] text-gray-500 block">Betaalwijze: ${e.method} • Datum: ${e.date}</span>
            </div>
            <div class="flex gap-2 items-center">
                <button onclick="window.toggleExpectedExpense(${e.id})" class="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded-lg font-semibold">${e.completed ? 'Terugzetten' : 'Afvinken ✨'}</button>
                <button onclick="window.deleteExpected(${e.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </div>
    `).join('');

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

    projList.innerHTML = projects.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen financiële projecten of leningen ingevoerd.</p>' : projects.map(p => {
        totalFreedGlobal += p.freed;
        const pct = p.target > 0 ? Math.min(100, Math.round((p.freed / p.target) * 100)) : 0;
        return `
            <div class="p-3.5 bg-gray-50 border rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-indigo-950">🎯 ${p.title}</span>
                    <button onclick="window.deleteFinancialProject(${p.id})" class="text-gray-400 hover:text-red-500 font-bold px-1">Verwijderen</button>
                </div>
                <div class="flex justify-between text-gray-600">
                    <span>Vrijgemaakt: € ${p.freed.toFixed(2)} / € ${p.target.toFixed(2)}</span>
                    <span class="font-bold text-indigo-700">${pct}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div>
                </div>
                <div class="flex gap-2 pt-1">
                    <input type="number" step="0.01" id="repay-input-${p.id}" placeholder="Bedrag aflossen..." class="px-2 py-1 border rounded-lg text-xs w-32">
                    <button onclick="window.repayProject(${p.id})" class="px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold">Aflossen 💶</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('space-total-freed').innerHTML = `€ ${totalFreedGlobal.toFixed(2)} <span class="text-[11px] font-normal text-gray-600">Totaal Vrijgemaakt</span>`;

    window.repayProject = (id) => {
        const input = document.getElementById(`repay-input-${id}`);
        const val = parseFloat(input.value);
        const proj = appData.money.financialProjects.find(x => x.id === id);
        if (proj && !isNaN(val) && val > 0) {
            proj.freed += val;
            saveAppData(appData);
            renderMoneyViews(appData);
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
            <button onclick="window.deleteImpulse(${i.id})" class="text-gray-400 hover:text-red-500 font-bold px-1">✕</button>
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
