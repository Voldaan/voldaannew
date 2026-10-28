// js/modules/money.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

export function initMoneyModule(appData) {
    const container = document.getElementById('geld');
    if (!container) return;

    if (!appData.money) {
        appData.money = {
            balance: 37.70,
            transactions: [],
            expectedExpenses: [],
            savingsPots: [],
            financialProjects: [],
            studyDebt: { total: 41939, paid: 477.35, monthly: 477.35 }
        };
    }

    container.innerHTML = `
        <!-- 1. Banksaldo & Overzicht -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-sm font-bold text-indigo-900">💶 Huidig Banksaldo</h2>
                <button id="open-balance-edit" class="text-[11px] text-indigo-600 hover:underline font-medium">Bewerken ✏️</button>
            </div>
            <p class="text-2xl font-bold text-indigo-950 mb-3" id="display-balance-text">€ ${(appData.money.balance || 0).toFixed(2)}</p>
            
            <form id="add-transaction-form" class="space-y-2 border-t pt-3">
                <p class="text-xs font-bold text-indigo-900">Transactie Toevoegen</p>
                <div class="grid grid-cols-2 gap-2">
                    <input type="text" id="trans-desc" placeholder="Omschrijving..." class="px-3 py-1.5 border border-gray-200 rounded-xl text-xs" required>
                    <input type="number" step="0.01" id="trans-amount" placeholder="Bedrag (+/-)" class="px-3 py-1.5 border border-gray-200 rounded-xl text-xs" required>
                </div>
                <button type="submit" class="w-full py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Transactie Toevoegen</button>
            </form>
        </div>

        <!-- 2. Verwachte Uitgaven & Beheer -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1">
                <div>
                    <h2 class="text-sm font-bold text-indigo-900">📉 Verwachte Uitgaven</h2>
                    <p class="text-[11px] text-indigo-700 font-semibold mt-0.5">Totaal verwacht: <span id="total-expected-sum">€ 0.00</span></p>
                </div>
                <button id="open-expenses-beheer" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 transition">Beheer ⚙️</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Houd grip op komende vaste lasten of rekeningen.</p>

            <form id="expected-expense-form" class="space-y-2 mb-3">
                <input type="text" id="exp-title" placeholder="Naam uitgave (bijv. Huur, Zorgverzekering)..." class="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs" required>
                <div class="grid grid-cols-2 gap-2">
                    <input type="number" step="0.01" id="exp-amount" placeholder="Bedrag in €" class="px-3 py-1.5 border border-gray-200 rounded-xl text-xs" required>
                    <input type="date" id="exp-date" class="px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-white" required>
                </div>
                <button type="submit" class="w-full py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Verwachte Uitgave Toevoegen</button>
            </form>

            <div class="mb-2 bg-gray-50 p-2 rounded-xl border border-gray-200 text-xs">
                <select id="expense-filter-date" class="w-full px-2 py-1 bg-white border border-gray-200 rounded-lg">
                    <option value="all">Alle datums (Uitgaven)</option>
                    <option value="today">Vandaag</option>
                    <option value="week">Deze week</option>
                    <option value="specific-week">Specifieke week</option>
                    <option value="month">Deze maand</option>
                    <option value="specific-month">Specifieke maand</option>
                    <option value="year">Dit jaar</option>
                    <option value="specific-year">Specifiek jaar</option>
                    <option value="specific-day">Specifieke dag</option>
                </select>
                <input type="date" id="expense-specific-date" class="hidden mt-1.5 w-full px-2 py-1 bg-white border border-gray-200 rounded-lg">
            </div>

            <ul id="expected-expenses-list" class="space-y-2 mb-2"></ul>
            <div id="expenses-more-container" class="text-center"></div>
        </div>

        <!-- 3. Transactie Historie & Overzicht -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <h2 class="text-sm font-bold text-indigo-900 mb-1">📜 Transacties & Overzicht</h2>
            <p class="text-[11px] text-gray-500 mb-2.5">Klik op een transactie om deze volledig te bewerken.</p>
            <ul id="transactions-list" class="space-y-1.5"></ul>
            <div id="transactions-more-container" class="text-center mt-2"></div>
        </div>

        <!-- 4. Ruimte Kompas (Financiële Doelen / Projecten) -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-sm font-bold text-indigo-900">🧭 Ruimte Kompas & Doelen</h2>
                <button id="open-project-form" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 transition">+ Doel Toevoegen</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Werken naar jouw financiële doelen met helder zicht op het totaal.</p>
            <div id="financial-projects-list" class="space-y-2.5"></div>
        </div>
    `;

    initMoneyModals(appData);
    initMoneyLogic(appData);
}

function initMoneyModals(appData) {
    const modalsHTML = `
        <!-- Saldo Bewerken Modal -->
        <div id="balance-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 border border-gray-200 text-xs">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">💶 Saldo Aanpassen</h3>
                    <button id="close-balance-modal" class="text-gray-400 font-bold text-base">✕</button>
                </div>
                <input type="number" step="0.01" id="new-balance-input" class="w-full px-3 py-2 border rounded-xl" placeholder="Nieuw saldo...">
                <button id="save-balance-btn" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Saldo Opslaan ✨</button>
            </div>
        </div>

        <!-- Uitgave Bewerken Modal -->
        <div id="edit-expense-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 border border-gray-200 text-xs">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">✏️ Verwachte Uitgave Bewerken</h3>
                    <button id="close-edit-expense" class="text-gray-400 font-bold text-base">✕</button>
                </div>
                <form id="edit-expense-form" class="space-y-2.5">
                    <input type="hidden" id="edit-exp-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Titel</label>
                        <input type="text" id="edit-exp-title" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Bedrag (€)</label>
                            <input type="number" step="0.01" id="edit-exp-amount" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Datum</label>
                            <input type="date" id="edit-exp-date" class="w-full px-3 py-2 border rounded-xl bg-white" required>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-edit-exp" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Transactie Bewerken Modal -->
        <div id="edit-trans-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 border border-gray-200 text-xs">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">✏️ Transactie Bewerken</h3>
                    <button id="close-edit-trans" class="text-gray-400 font-bold text-base">✕</button>
                </div>
                <form id="edit-trans-form" class="space-y-2.5">
                    <input type="hidden" id="edit-trans-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving</label>
                        <input type="text" id="edit-trans-desc" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Bedrag (€)</label>
                        <input type="number" step="0.01" id="edit-trans-amount" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-edit-trans" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Financieel Doel / Project Toevoegen/Bewerken Modal -->
        <div id="project-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 border border-gray-200 text-xs">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950" id="project-modal-title">🧭 Financieel Doel Toevoegen</h3>
                    <button id="close-project-modal" class="text-gray-400 font-bold text-base">✕</button>
                </div>
                <form id="project-form-modal" class="space-y-2.5">
                    <input type="hidden" id="proj-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Naam van het doel</label>
                        <input type="text" id="proj-name" class="w-full px-3 py-2 border rounded-xl" placeholder="Bijv. Buffer / Spaardoel" required>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Reeds gespaard (€)</label>
                            <input type="number" step="0.01" id="proj-current" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                        <div>
                            <label class="block font-semibold text-gray-600 mb-1">Totaal doel (€)</label>
                            <input type="number" step="0.01" id="proj-target" class="w-full px-3 py-2 border rounded-xl" required>
                        </div>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-project-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Doel Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    if (!document.getElementById('balance-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
    }

    // Saldo modal
    const balModal = document.getElementById('balance-modal');
    document.getElementById('open-balance-edit').onclick = () => {
        document.getElementById('new-balance-input').value = appData.money.balance || 0;
        balModal.classList.remove('hidden');
    };
    document.getElementById('close-balance-modal').onclick = () => balModal.classList.add('hidden');
    document.getElementById('save-balance-btn').onclick = () => {
        const val = parseFloat(document.getElementById('new-balance-input').value);
        if (!isNaN(val)) {
            appData.money.balance = val;
            saveAppData(appData);
            balModal.classList.add('hidden');
            initMoneyModule(appData);
            showToast("Banksaldo bijgewerkt! 💶");
        }
    };

    // Uitgave bewerken modal
    const expEditModal = document.getElementById('edit-expense-modal');
    document.getElementById('close-edit-expense').onclick = () => expEditModal.classList.add('hidden');
    document.getElementById('cancel-edit-exp').onclick = () => expEditModal.classList.add('hidden');
    document.getElementById('edit-expense-form').onsubmit = (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-exp-id').value);
        const title = document.getElementById('edit-exp-title').value.trim();
        const amount = parseFloat(document.getElementById('edit-exp-amount').value);
        const date = document.getElementById('edit-exp-date').value;

        const exp = (appData.money.expectedExpenses || []).find(x => x.id === id);
        if (exp && title && !isNaN(amount)) {
            exp.title = title;
            exp.amount = amount;
            exp.date = date;
            saveAppData(appData);
            expEditModal.classList.add('hidden');
            initMoneyModule(appData);
            showToast("Verwachte uitgave bijgewerkt!");
        }
    };

    // Transactie bewerken modal
    const transEditModal = document.getElementById('edit-trans-modal');
    document.getElementById('close-edit-trans').onclick = () => transEditModal.classList.add('hidden');
    document.getElementById('cancel-edit-trans').onclick = () => transEditModal.classList.add('hidden');
    document.getElementById('edit-trans-form').onsubmit = (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-trans-id').value);
        const desc = document.getElementById('edit-trans-desc').value.trim();
        const amount = parseFloat(document.getElementById('edit-trans-amount').value);

        const trans = (appData.money.transactions || []).find(x => x.id === id);
        if (trans && desc && !isNaN(amount)) {
            trans.desc = desc;
            trans.amount = amount;
            saveAppData(appData);
            transEditModal.classList.add('hidden');
            initMoneyModule(appData);
            showToast("Transactie bijgewerkt!");
        }
    };

    // Doel modal
    const projModal = document.getElementById('project-modal');
    document.getElementById('open-project-form').onclick = () => {
        document.getElementById('proj-id').value = '';
        document.getElementById('proj-name').value = '';
        document.getElementById('proj-current').value = '';
        document.getElementById('proj-target').value = '';
        document.getElementById('project-modal-title').textContent = '🧭 Financieel Doel Toevoegen';
        projModal.classList.remove('hidden');
    };
    document.getElementById('close-project-modal').onclick = () => projModal.classList.add('hidden');
    document.getElementById('cancel-project-modal').onclick = () => projModal.classList.add('hidden');

    document.getElementById('project-form-modal').onsubmit = (e) => {
        e.preventDefault();
        const id = document.getElementById('proj-id').value;
        const name = document.getElementById('proj-name').value.trim();
        const current = parseFloat(document.getElementById('proj-current').value);
        const target = parseFloat(document.getElementById('proj-target').value);

        if (!appData.money.financialProjects) appData.money.financialProjects = [];

        if (id) {
            const proj = appData.money.financialProjects.find(x => x.id == id);
            if (proj) {
                proj.name = name;
                proj.current = current;
                proj.target = target;
            }
        } else {
            appData.money.financialProjects.push({ id: Date.now(), name, current, target });
        }

        saveAppData(appData);
        projModal.classList.add('hidden');
        initMoneyModule(appData);
        showToast("Financieel doel opgeslagen! 🧭");
    };
}

function initMoneyLogic(appData) {
    const money = appData.money;

    // Transactie toevoegen
    document.getElementById('add-transaction-form').onsubmit = (e) => {
        e.preventDefault();
        const desc = document.getElementById('trans-desc').value.trim();
        const amount = parseFloat(document.getElementById('trans-amount').value);
        if (desc && !isNaN(amount)) {
            if (!money.transactions) money.transactions = [];
            money.transactions.push({ id: Date.now(), desc, amount, date: new Date().toISOString() });
            money.balance = (money.balance || 0) + amount;
            saveAppData(appData);
            e.target.reset();
            initMoneyModule(appData);
            showToast("Transactie toegevoegd & saldo bijgewerkt! 💶");
        }
    };

    // Verwachte uitgave toevoegen
    document.getElementById('expected-expense-form').onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('exp-title').value.trim();
        const amount = parseFloat(document.getElementById('exp-amount').value);
        const date = document.getElementById('exp-date').value;
        if (title && !isNaN(amount) && date) {
            if (!money.expectedExpenses) money.expectedExpenses = [];
            money.expectedExpenses.push({ id: Date.now(), title, amount, date, paid: false });
            saveAppData(appData);
            e.target.reset();
            renderMoneyViews(appData);
            showToast("Verwachte uitgave toegevoegd!");
        }
    };

    document.getElementById('expense-filter-date').onchange = (e) => {
        const val = e.target.value;
        document.getElementById('expense-specific-date').classList.toggle('hidden', !['specific-day', 'specific-week', 'specific-month', 'specific-year'].includes(val));
        renderMoneyViews(appData);
    };
    document.getElementById('expense-specific-date').onchange = () => renderMoneyViews(appData);

    renderMoneyViews(appData);
}

function renderMoneyViews(appData) {
    const money = appData.money;

    // 1. Verwachte uitgaven renderen (max 5 + uitvouwen + totaalberekening)
    const expList = document.getElementById('expenses-more-container');
    const expensesContainer = document.getElementById('expected-expenses-list');
    const dateFilter = document.getElementById('expense-filter-date').value;
    const specificDate = document.getElementById('expense-specific-date').value;

    const expenses = money.expectedExpenses || [];
    const filteredExp = expenses.filter(ex => checkDateFilter(ex.date, dateFilter, specificDate));

    // Bereken totaal van gefilterde onbetaalde uitgaven
    const totalExpSum = filteredExp.filter(ex => !ex.paid).reduce((sum, ex) => sum + ex.amount, 0);
    document.getElementById('total-expected-sum').textContent = `€ ${totalExpSum.toFixed(2)}`;

    let showAllExpenses = window._showAllExpenses || false;
    const displayedExp = showAllExpenses ? filteredExp : filteredExp.slice(-5).reverse();

    expensesContainer.innerHTML = displayedExp.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen verwachte uitgaven gevonden.</p>' : displayedExp.map(ex => `
        <li class="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1 flex flex-col">
            <div class="flex justify-between items-center">
                <span class="font-bold text-gray-900 text-sm ${ex.paid ? 'line-through text-gray-400' : ''}">${ex.title}</span>
                <span class="font-bold text-rose-600 text-sm">€ ${ex.amount.toFixed(2)}</span>
            </div>
            <div class="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t">
                <span>📅 ${new Date(ex.date).toLocaleDateString('nl-NL')}</span>
                <div class="flex gap-2">
                    <button onclick="window.toggleExpensePaid(${ex.id})" class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold">${ex.paid ? 'Betaald ✓' : 'Afvinken ✨'}</button>
                    <button onclick="window.openEditExpense(${ex.id})" class="text-indigo-600 font-semibold hover:underline">Bewerken ✏️</button>
                </div>
            </div>
        </li>
    `).join('');

    if (filteredExp.length > 5) {
        expList.innerHTML = `<button id="toggle-more-exp" class="text-[11px] text-indigo-600 font-semibold hover:underline">${showAllExpenses ? 'Minder weergeven' : `+ ${filteredExp.length - 5} meer weergeven...`}</button>`;
        document.getElementById('toggle-more-exp').onclick = () => {
            window._showAllExpenses = !showAllExpenses;
            renderMoneyViews(appData);
        };
    } else {
        expList.innerHTML = '';
    }

    window.toggleExpensePaid = (id) => {
        const ex = expenses.find(x => x.id === id);
        if (ex) {
            ex.paid = !ex.paid;
            if (ex.paid) {
                money.balance = (money.balance || 0) - ex.amount;
                voegTrotsKnikkerToe(appData, `Uitgave voldaan: ${ex.title} (€${ex.amount})`, 'Financieel');
            } else {
                money.balance = (money.balance || 0) + ex.amount;
            }
            saveAppData(appData);
            initMoneyModule(appData);
        }
    };

    window.openEditExpense = (id) => {
        const ex = expenses.find(x => x.id === id);
        if (ex) {
            document.getElementById('edit-exp-id').value = ex.id;
            document.getElementById('edit-exp-title').value = ex.title;
            document.getElementById('edit-exp-amount').value = ex.amount;
            document.getElementById('edit-exp-date').value = ex.date;
            document.getElementById('edit-expense-modal').classList.remove('hidden');
        }
    };

    // 2. Transacties renderen (max 5 + aanklikbaar om te bewerken)
    const transList = document.getElementById('transactions-list');
    const transactions = money.transactions || [];
    let showAllTrans = window._showAllTrans || false;
    const displayedTrans = showAllTrans ? transactions : transactions.slice(-5).reverse();

    transList.innerHTML = displayedTrans.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen transacties geregistreerd.</p>' : displayedTrans.map(t => `
        <li onclick="window.openEditTrans(${t.id})" class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs cursor-pointer hover:bg-gray-100 transition">
            <div>
                <span class="font-bold text-indigo-950">${t.desc}</span>
                <span class="text-[10px] text-gray-400 block">${new Date(t.date).toLocaleString('nl-NL')}</span>
            </div>
            <span class="font-bold text-sm ${t.amount >= 0 ? 'text-emerald-600' : 'text-rose-600'}">${t.amount >= 0 ? '+' : ''}€ ${t.amount.toFixed(2)}</span>
        </li>
    `).join('');

    if (transactions.length > 5) {
        document.getElementById('transactions-more-container').innerHTML = `<button id="toggle-more-trans" class="text-[11px] text-indigo-600 font-semibold hover:underline">${showAllTrans ? 'Minder weergeven' : `+ ${transactions.length - 5} meer weergeven...`}</button>`;
        document.getElementById('toggle-more-trans').onclick = () => {
            window._showAllTrans = !showAllTrans;
            renderMoneyViews(appData);
        };
    }

    window.openEditTrans = (id) => {
        const t = transactions.find(x => x.id === id);
        if (t) {
            document.getElementById('edit-trans-id').value = t.id;
            document.getElementById('edit-trans-desc').value = t.desc;
            document.getElementById('edit-trans-amount').value = t.amount;
            document.getElementById('edit-trans-modal').classList.remove('hidden');
        }
    };

    // 3. Ruimte Kompas (Financiële doelen) renderen
    const projContainer = document.getElementById('financial-projects-list');
    const projects = money.financialProjects || [];
    projContainer.innerHTML = projects.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen financiële doelen ingesteld.</p>' : projects.map(p => {
        const perc = p.target > 0 ? Math.min(100, Math.round((p.current / p.target) * 100)) : 0;
        return `
            <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
                <div class="flex justify-between items-center">
                    <span class="font-bold text-indigo-950">${p.name}</span>
                    <div class="flex gap-2">
                        <button onclick="window.openEditProject(${p.id})" class="text-indigo-600 font-semibold hover:underline">Bewerken ✏️</button>
                        <button onclick="window.deleteProject(${p.id})" class="text-red-400 font-bold hover:text-red-600">✕</button>
                    </div>
                </div>
                <div class="flex justify-between text-[11px] text-gray-600">
                    <span>Gespaard: € ${p.current.toFixed(2)}</span>
                    <span class="font-bold text-indigo-900">Totaal doel: € ${p.target.toFixed(2)} (${perc}%)</span>
                </div>
                <div class="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div class="bg-indigo-600 h-full rounded-full" style="width: ${perc}%"></div>
                </div>
            </div>
        `;
    }).join('');

    window.openEditProject = (id) => {
        const p = projects.find(x => x.id === id);
        if (p) {
            document.getElementById('proj-id').value = p.id;
            document.getElementById('proj-name').value = p.name;
            document.getElementById('proj-current').value = p.current;
            document.getElementById('proj-target').value = p.target;
            document.getElementById('project-modal-title').textContent = '🧭 Financieel Doel Bewerken';
            document.getElementById('project-modal').classList.remove('hidden');
        }
    };

    window.deleteProject = (id) => {
        money.financialProjects = money.financialProjects.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoneyViews(appData);
        showToast("Doel verwijderd.");
    };
}
