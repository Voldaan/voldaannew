// js/modules/money.js
import { saveAppData, checkDateFilter, showToast } from './storage.js';

const MONEY_CATEGORIES = ['boodschappen', 'tanken', 'horeca', 'tabak', 'onverwachte uitgaven', 'uitje', 'cadeau', 'aanschaf', 'aflossen', 'loon', 'lening', 'verwachte uitgave'];
const MONEY_LABELS = ['Geen bewustwordingslabel', 'Besparing/Onnodig', 'Impulsaankoop', 'Noodzakelijk/Vaste last', 'Investeer in mezelf'];

export function initMoneyModule(appData) {
    const container = document.getElementById('geld');
    if (!container) return;

    if (!appData.money) appData.money = { balance: 37.70, transactions: [], expectedExpenses: [], impulseWants: [], financialProjects: [], studyDebt: { total: 41939, paid: 477.35, monthly: 477.35 } };

    container.innerHTML = `
        <!-- Saldo & Paydayradar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-[11px] text-gray-500 uppercase font-semibold">Actueel Banksaldo</p>
                        <button id="edit-balance-btn" class="text-xs text-indigo-600 hover:underline">Aanpassen</button>
                    </div>
                    <p id="current-balance" class="text-xl font-bold text-indigo-900">€ 0.00</p>
                </div>
            </div>
            <div class="bg-indigo-900 text-white p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <p class="text-[11px] text-indigo-200 uppercase font-semibold mb-0.5">Paydayradar</p>
                    <p id="payday-countdown" class="text-base font-bold">Aftellen naar loon...</p>
                </div>
            </div>
        </div>

        <!-- 1. Transacties & Overzicht -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">💶 Transacties & Overzicht</h2>
                <button id="open-tx-modal-btn" class="px-2.5 py-1 bg-indigo-600 text-white rounded-xl text-[11px] font-semibold hover:bg-indigo-700 transition">+ Transactie</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Klik op een transactie om deze volledig te bewerken.</p>

            <div class="flex flex-col gap-2 mb-2.5 bg-gray-50 p-2.5 rounded-xl border border-gray-200 text-xs">
                <input type="text" id="tx-search" placeholder="Zoek transactie..." class="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-xl">
                <div class="grid grid-cols-2 gap-2">
                    <select id="tx-filter-date" class="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg">
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
                    <input type="date" id="tx-specific-date-input" class="hidden w-full px-2 py-1 bg-white border border-gray-200 rounded-lg">
                </div>
            </div>
            <ul id="transaction-list" class="space-y-1.5"></ul>
        </div>

        <!-- 2. Verwachte Uitgaven & Vaste Lasten -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">📅 Verwachte Uitgaven & Vaste Lasten</h2>
                <button id="open-expected-modal-btn" class="px-2.5 py-1 bg-indigo-600 text-white rounded-xl text-[11px] font-semibold hover:bg-indigo-700 transition">+ Verwachte Uitgave</button>
            </div>
            <div id="expected-total-banner" class="bg-indigo-50/70 p-2.5 rounded-xl text-xs font-semibold text-indigo-950 mb-2.5 flex justify-between items-center border border-indigo-100">
                <span>Totaal verwachte uitgaven:</span>
                <span id="expected-total-amount" class="text-sm font-bold">€ 0.00</span>
            </div>
            <ul id="expected-expense-list" class="space-y-2"></ul>
        </div>

        <!-- 3. Het Ruimte-Kompas -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">🧭 Het Ruimte-Kompas</h2>
                <button id="open-project-modal-btn" class="px-2.5 py-1 bg-indigo-600 text-white rounded-xl text-[11px] font-semibold hover:bg-indigo-700 transition">+ Financieel Project</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Werk toe naar je totale doelen en leningen.</p>
            <div id="financial-projects-list" class="space-y-2.5"></div>
        </div>
    `;

    initMoneyModals(appData);
    initMoneyLogic(appData);
}

function initMoneyModals(appData) {
    const txModalHTML = `
        <div id="tx-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 id="tx-modal-title" class="text-sm font-bold text-indigo-950">💶 Transactie Beheren</h3>
                    <button id="close-tx-modal" class="text-gray-400 hover:text-gray-600 font-bold text-base">✕</button>
                </div>
                <form id="tx-modal-form" class="space-y-2.5 text-xs">
                    <input type="hidden" id="modal-tx-edit-id">
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
                            <label class="block font-semibold text-gray-600 mb-1">Datum & Tijd</label>
                            <input type="datetime-local" id="modal-tx-date" class="w-full px-3 py-2 border rounded-xl">
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="delete-tx-modal-btn" class="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hidden">Verwijderen</button>
                        <button type="button" id="cancel-tx-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const expectedModalHTML = `
        <div id="expected-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 id="expected-modal-title" class="text-sm font-bold text-indigo-950">📅 Verwachte Uitgave Beheren</h3>
                    <button id="close-expected-modal" class="text-gray-400 hover:text-gray-600 font-bold text-base">✕</button>
                </div>
                <form id="expected-modal-form" class="space-y-2.5 text-xs">
                    <input type="hidden" id="modal-exp-edit-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving</label>
                        <input type="text" id="modal-exp-desc" placeholder="Bijv. Verzekering" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Bedrag (€)</label>
                            <input type="number" step="0.01" id="modal-exp-amount" placeholder="Bedrag" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                            <select id="modal-exp-cat" class="w-full px-3 py-2 border rounded-xl bg-white">
                                ${MONEY_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Verwachte Datum</label>
                        <input type="date" id="modal-exp-date" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="delete-expected-modal-btn" class="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl font-semibold hidden">Verwijderen</button>
                        <button type="button" id="cancel-expected-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', txModalHTML + expectedModalHTML);

    setupTxModal(appData);
    setupExpectedModal(appData);
}

function setupTxModal(appData) {
    const modal = document.getElementById('tx-modal');
    document.getElementById('open-tx-modal-btn').onclick = () => {
        document.getElementById('tx-modal-title').textContent = '💶 Nieuwe Transactie Invoeren';
        document.getElementById('modal-tx-edit-id').value = '';
        document.getElementById('tx-modal-form').reset();
        document.getElementById('delete-tx-modal-btn').classList.add('hidden');
        modal.classList.remove('hidden');
    };
    document.getElementById('close-tx-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('cancel-tx-modal').onclick = () => modal.classList.add('hidden');

    document.getElementById('tx-modal-form').onsubmit = (e) => {
        e.preventDefault();
        const editId = document.getElementById('modal-tx-edit-id').value;
        const description = document.getElementById('modal-tx-desc').value.trim();
        const amount = parseFloat(document.getElementById('modal-tx-amount').value);
        const category = document.getElementById('modal-tx-cat').value;
        const label = document.getElementById('modal-tx-label').value;
        const dateVal = document.getElementById('modal-tx-date').value;

        if (description && !isNaN(amount)) {
            if (!appData.money.transactions) appData.money.transactions = [];
            if (editId) {
                const tx = appData.money.transactions.find(x => x.id == editId);
                if (tx) {
                    appData.money.balance = (appData.money.balance - tx.amount) + amount;
                    tx.description = description;
                    tx.amount = amount;
                    tx.category = category;
                    tx.label = label;
                    if (dateVal) tx.date = new Date(dateVal).toISOString();
                }
            } else {
                appData.money.transactions.push({
                    id: Date.now(), description, amount, category, label,
                    date: dateVal ? new Date(dateVal).toISOString() : new Date().toISOString()
                });
                appData.money.balance = (appData.money.balance || 0) + amount;
            }
            saveAppData(appData);
            modal.classList.add('hidden');
            renderMoneyViews(appData);
            showToast("Transactie opgeslagen! 💶");
        }
    };

    document.getElementById('delete-tx-modal-btn').onclick = () => {
        const editId = document.getElementById('modal-tx-edit-id').value;
        if (editId) {
            const tx = appData.money.transactions.find(x => x.id == editId);
            if (tx) {
                appData.money.balance -= tx.amount;
                appData.money.transactions = appData.money.transactions.filter(x => x.id != editId);
                saveAppData(appData);
                modal.classList.add('hidden');
                renderMoneyViews(appData);
                showToast("Transactie verwijderd.");
            }
        }
    };
}

function setupExpectedModal(appData) {
    const modal = document.getElementById('expected-modal');
    document.getElementById('open-expected-modal-btn').onclick = () => {
        document.getElementById('expected-modal-title').textContent = '📅 Nieuwe Verwachte Uitgave';
        document.getElementById('modal-exp-edit-id').value = '';
        document.getElementById('expected-modal-form').reset();
        document.getElementById('delete-expected-modal-btn').classList.add('hidden');
        modal.classList.remove('hidden');
    };
    document.getElementById('close-expected-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('cancel-expected-modal').onclick = () => modal.classList.add('hidden');

    document.getElementById('expected-modal-form').onsubmit = (e) => {
        e.preventDefault();
        const editId = document.getElementById('modal-exp-edit-id').value;
        const description = document.getElementById('modal-exp-desc').value.trim();
        const amount = parseFloat(document.getElementById('modal-exp-amount').value);
        const category = document.getElementById('modal-exp-cat').value;
        const date = document.getElementById('modal-exp-date').value;

        if (description && !isNaN(amount) && date) {
            if (!appData.money.expectedExpenses) appData.money.expectedExpenses = [];
            if (editId) {
                const exp = appData.money.expectedExpenses.find(x => x.id == editId);
                if (exp) {
                    exp.description = description;
                    exp.amount = amount;
                    exp.category = category;
                    exp.date = date;
                }
            } else {
                appData.money.expectedExpenses.push({ id: Date.now(), description, amount, category, date, completed: false });
            }
            saveAppData(appData);
            modal.classList.add('hidden');
            renderMoneyViews(appData);
            showToast("Verwachte uitgave bijgewerkt! 📅");
        }
    };

    document.getElementById('delete-expected-modal-btn').onclick = () => {
        const editId = document.getElementById('modal-exp-edit-id').value;
        if (editId) {
            appData.money.expectedExpenses = appData.money.expectedExpenses.filter(x => x.id != editId);
            saveAppData(appData);
            modal.classList.add('hidden');
            renderMoneyViews(appData);
            showToast("Verwachte uitgave verwijderd.");
        }
    };
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
    document.getElementById('tx-filter-date').onchange = (e) => {
        const val = e.target.value;
        document.getElementById('tx-specific-date-input').classList.toggle('hidden', !['specific-day', 'specific-week', 'specific-month', 'specific-year'].includes(val));
        renderMoneyViews(appData);
    };
    document.getElementById('tx-specific-date-input').onchange = () => renderMoneyViews(appData);

    renderMoneyViews(appData);
    initPaydayRadar();
}

function renderMoneyViews(appData) {
    const balanceEl = document.getElementById('current-balance');
    const balance = appData.money?.balance || 37.70;
    balanceEl.textContent = `€ ${balance.toFixed(2)}`;
    balanceEl.className = balance < 0 ? "text-xl font-bold text-red-600" : "text-xl font-bold text-indigo-900";

    // Transacties renderen met filter
    const txList = document.getElementById('transaction-list');
    const searchTerm = document.getElementById('tx-search').value.toLowerCase();
    const dateFilter = document.getElementById('tx-filter-date').value;
    const specificDateVal = document.getElementById('tx-specific-date-input')?.value;
    
    const txs = (appData.money?.transactions || []).filter(t => {
        const matchSearch = t.description.toLowerCase().includes(searchTerm) || t.category.toLowerCase().includes(searchTerm);
        const matchDate = checkDateFilter(t.date, dateFilter, specificDateVal);
        return matchSearch && matchDate;
    });

    txList.innerHTML = txs.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen transacties gevonden.</p>' : txs.slice(-10).reverse().map(t => `
        <li onclick="window.editTransactionModal(${t.id})" class="flex justify-between items-center p-2.5 rounded-xl text-xs border cursor-pointer hover:bg-gray-50 transition ${t.amount >= 0 ? 'bg-green-50/40 border-green-200 text-green-950' : 'bg-red-50/40 border-red-200 text-red-950'}">
            <div>
                <span class="font-bold">[${t.category}]</span> ${t.description} 
                <span class="text-[10px] text-gray-500 block">${t.label || ''} • ${new Date(t.date).toLocaleDateString('nl-NL')}</span>
            </div>
            <span class="font-bold text-sm">${t.amount >= 0 ? '+' : ''}€ ${t.amount.toFixed(2)}</span>
        </li>
    `).join('');

    window.editTransactionModal = (id) => {
        const tx = appData.money.transactions.find(x => x.id === id);
        if (tx) {
            document.getElementById('tx-modal-title').textContent = '💶 Transactie Bewerken';
            document.getElementById('modal-tx-edit-id').value = tx.id;
            document.getElementById('modal-tx-desc').value = tx.description;
            document.getElementById('modal-tx-amount').value = tx.amount;
            document.getElementById('modal-tx-cat').value = tx.category;
            document.getElementById('modal-tx-label').value = tx.label || MONEY_LABELS[0];
            document.getElementById('modal-tx-date').value = tx.date ? tx.date.slice(0, 16) : '';
            document.getElementById('delete-tx-modal-btn').classList.remove('hidden');
            document.getElementById('tx-modal').classList.remove('hidden');
        }
    };

    // Verwachte uitgaven renderen + dynamisch totaalbedrag
    const expList = document.getElementById('expected-expense-list');
    const expenses = appData.money?.expectedExpenses || [];
    let totalExpectedSum = 0;

    expList.innerHTML = expenses.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen verwachte uitgaven ingesteld.</p>' : expenses.map(e => {
        if (!e.completed) totalExpectedSum += e.amount;
        return `
            <div class="flex justify-between items-center p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs ${e.completed ? 'opacity-50 line-through' : ''}">
                <div class="flex-1 cursor-pointer pr-2" onclick="window.editExpectedModal(${e.id})">
                    <span class="font-bold text-indigo-900 text-xs">[${e.category}]</span> <span class="font-semibold text-sm text-gray-900">${e.description}</span> - <span class="font-bold text-sm">€ ${e.amount.toFixed(2)}</span>
                    <span class="text-[10px] text-gray-500 block">Datum: ${e.date}</span>
                </div>
                <div class="flex gap-2 items-center">
                    <button onclick="window.toggleExpectedExpense(${e.id})" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-semibold text-[11px] hover:bg-indigo-100 transition">${e.completed ? 'Terugzetten' : 'Afvinken ✨'}</button>
                </div>
            </div>
        `;
    }).join('');

    document.getElementById('expected-total-amount').textContent = `€ ${totalExpectedSum.toFixed(2)}`;

    window.editExpectedModal = (id) => {
        const exp = appData.money.expectedExpenses.find(x => x.id === id);
        if (exp) {
            document.getElementById('expected-modal-title').textContent = '📅 Verwachte Uitgave Bewerken';
            document.getElementById('modal-exp-edit-id').value = exp.id;
            document.getElementById('modal-exp-desc').value = exp.description;
            document.getElementById('modal-exp-amount').value = exp.amount;
            document.getElementById('modal-exp-cat').value = exp.category;
            document.getElementById('modal-exp-date').value = exp.date;
            document.getElementById('delete-expected-modal-btn').classList.remove('hidden');
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

    // Ruimte-Kompas (Projecten met totaal doelbedrag)
    const projList = document.getElementById('financial-projects-list');
    const projects = appData.money?.financialProjects || [];
    
    projList.innerHTML = projects.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen financiële projecten of leningen ingevoerd.</p>' : projects.map(p => {
        const pct = p.target > 0 ? Math.min(100, Math.round((p.freed / p.target) * 100)) : 0;
        return `
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-indigo-950">🎯 ${p.title}</span>
                    <button onclick="window.editProjectModal(${p.id})" class="text-xs text-indigo-600 hover:underline">Bewerken</button>
                </div>
                <div class="flex justify-between text-gray-600 text-[11px]">
                    <span>Vrijgemaakt: € ${p.freed.toFixed(2)} / Totaal doel: <strong class="text-indigo-900">€ ${p.target.toFixed(2)}</strong></span>
                    <span class="font-bold text-indigo-700">${pct}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');
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
