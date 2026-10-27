// js/modules/money.js
import { saveAppData, checkDateFilter } from './storage.js';

const MONEY_CATEGORIES = ['Boodschappen', 'Tanken', 'Horeca', 'Tabak', 'Onverwachte uitgave', 'Uitje', 'Cadeau', 'Aanschaflossen', 'Loon', 'Lening'];
const MONEY_LABELS = ['Geen bewustwordingslabel', 'Besparing / Onnodig', 'Impulsaankoop', 'Noodzakelijk / Vaste last', 'Investeer in mezelf'];

export function initMoneyModule(appData) {
    const container = document.getElementById('geld');
    if (!container) return;

    container.innerHTML = `
        <!-- 1. Live Banksaldo & Paydayradar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-xs text-gray-500 uppercase font-semibold">Actueel Banksaldo</p>
                        <button id="edit-balance-btn" class="text-xs text-indigo-600 hover:underline">Aanpassen</button>
                    </div>
                    <p id="current-balance" class="text-3xl font-bold text-indigo-900">€ 0.00</p>
                </div>
                <p class="text-xs text-gray-400 mt-4">Transacties passen dit saldo automatisch aan.</p>
            </div>

            <div class="bg-indigo-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <p class="text-xs text-indigo-200 uppercase font-semibold mb-1">Paydayradar</p>
                    <p id="payday-countdown" class="text-2xl font-bold">Aftellen naar loon...</p>
                </div>
                <p class="text-xs text-indigo-300 mt-4">Automatische telling naar de 23e om 08:00 uur.</p>
            </div>
        </div>

        <!-- 2. Transacties Invoeren & Overzicht -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 class="text-lg font-bold text-indigo-900 mb-2">💶 Transacties (Inkomsten & Uitgaven)</h2>
            <form id="transaction-form" class="grid grid-cols-1 md:grid-cols-4 gap-2 mb-4">
                <input type="text" id="tx-desc" placeholder="Omschrijving (bijv. Albert Heijn)" class="px-3 py-2 border border-gray-200 rounded-xl text-sm" required>
                <input type="number" step="0.01" id="tx-amount" placeholder="Bedrag (-15.50 of 100)" class="px-3 py-2 border border-gray-200 rounded-xl text-sm" required>
                <select id="tx-cat" class="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                    ${MONEY_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">Toevoegen</button>
            </form>

            <div class="flex justify-between items-center mb-2">
                <h3 class="text-sm font-bold text-gray-700">Recente Transacties</h3>
                <select id="tx-filter-date" class="px-3 py-1 text-xs bg-white border border-gray-200 rounded-xl">
                    <option value="all">Alles</option>
                    <option value="today">Vandaag</option>
                    <option value="week">Deze week</option>
                    <option value="month">Deze maand</option>
                </select>
            </div>
            <ul id="transaction-list" class="space-y-1.5"></ul>
        </div>

        <!-- 3. Impuls-Wachtkamer & Toekomst-Ankers -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold text-indigo-900 mb-1">🛡️ Impuls-Wachtkamer</h2>
                <p class="text-sm text-gray-500 mb-3">Zet aankoopwensen 24 uur in de wachtkamer.</p>
                <form id="impulse-form" class="flex gap-2 mb-3">
                    <input type="text" id="impulse-item" placeholder="Wat wil je kopen?" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                    <button type="submit" class="px-3 py-2 bg-amber-600 text-white rounded-xl text-sm">Parkeren</button>
                </form>
                <ul id="impulse-list" class="space-y-1 text-xs text-gray-600"></ul>
            </div>

            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h2 class="text-lg font-bold text-indigo-900 mb-1">🌱 Toekomst-Ankers (Sparen)</h2>
                <p class="text-sm text-gray-500 mb-3">Spaar met een behapbaar plan en een veiligheidsnet.</p>
                <form id="savings-form" class="flex gap-2 mb-3">
                    <input type="text" id="savings-name" placeholder="Naam potje..." class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                    <button type="submit" class="px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm">+ Potje</button>
                </form>
                <ul id="savings-list" class="space-y-1 text-xs text-gray-600"></ul>
            </div>
        </div>
    `;

    initMoneyLogic(appData);
}

function initMoneyLogic(appData) {
    if (!appData.money) {
        appData.money = { balance: 0, transactions: [], impulseWants: [], savingsPots: [] };
    }

    // Saldo aanpassen
    document.getElementById('edit-balance-btn').addEventListener('click', () => {
        const val = prompt("Voer je actuele banksaldo in:", appData.money.balance || 0);
        if (val !== null && !isNaN(parseFloat(val))) {
            appData.money.balance = parseFloat(val);
            saveAppData(appData);
            renderMoneyView(appData);
        }
    });

    // Transactie formulier
    const txForm = document.getElementById('transaction-form');
    txForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const description = document.getElementById('tx-desc').value.trim();
        const amount = parseFloat(document.getElementById('tx-amount').value);
        const category = document.getElementById('tx-cat').value;

        if (description && !isNaN(amount)) {
            if (!appData.money.transactions) appData.money.transactions = [];
            appData.money.transactions.push({ id: Date.now(), description, amount, category, date: new Date().toISOString() });
            
            appData.money.balance = (appData.money.balance || 0) + amount;
            saveAppData(appData);
            txForm.reset();
            renderMoneyView(appData);
        }
    });

    // Impuls formulier
    const impulseForm = document.getElementById('impulse-form');
    impulseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const item = document.getElementById('impulse-item').value.trim();
        if (item) {
            if (!appData.money.impulseWants) appData.money.impulseWants = [];
            appData.money.impulseWants.push({ id: Date.now(), item, date: new Date().toISOString() });
            saveAppData(appData);
            impulseForm.reset();
            renderMoneyView(appData);
        }
    });

    // Savings formulier
    const savingsForm = document.getElementById('savings-form');
    savingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('savings-name').value.trim();
        if (name) {
            if (!appData.money.savingsPots) appData.money.savingsPots = [];
            appData.money.savingsPots.push({ id: Date.now(), name, saved: 0, date: new Date().toISOString() });
            saveAppData(appData);
            savingsForm.reset();
            renderMoneyView(appData);
        }
    });

    document.getElementById('tx-filter-date').addEventListener('change', () => renderMoneyView(appData));

    renderMoneyView(appData);
    initPaydayRadar();
}

function renderMoneyView(appData) {
    const balanceEl = document.getElementById('current-balance');
    const balance = appData.money?.balance || 0;
    balanceEl.textContent = `€ ${balance.toFixed(2)}`;
    balanceEl.className = balance < 0 ? "text-3xl font-bold text-red-600" : "text-3xl font-bold text-indigo-900";

    // Transacties renderen met filter
    const txList = document.getElementById('transaction-list');
    const dateFilter = document.getElementById('tx-filter-date').value;
    const txs = (appData.money?.transactions || []).filter(t => checkDateFilter(t.date, dateFilter));

    txList.innerHTML = txs.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen transacties gevonden.</p>' : txs.slice(-10).reverse().map(t => `
        <li class="flex justify-between items-center p-2 rounded-xl text-xs border ${t.amount >= 0 ? 'bg-green-50/50 border-green-100 text-green-900' : 'bg-red-50/50 border-red-100 text-red-900'}">
            <div><span class="font-bold">[${t.category}]</span> ${t.description}</div>
            <span class="font-bold">${t.amount >= 0 ? '+' : ''}€ ${t.amount.toFixed(2)}</span>
        </li>
    `).join('');

    // Impuls wachtkamer
    const impulseList = document.getElementById('impulse-list');
    const impulses = appData.money?.impulseWants || [];
    impulseList.innerHTML = impulses.length === 0 ? '<p class="italic text-gray-400">Geen aankopen in de wacht.</p>' : impulses.map(i => `
        <div class="flex justify-between py-1 border-b">
            <span>⏳ ${i.item}</span>
            <span class="text-gray-400">${new Date(i.date).toLocaleDateString('nl-NL')}</span>
        </div>
    `).join('');

    // Spaarpotjes
    const savingsList = document.getElementById('savings-list');
    const pots = appData.money?.savingsPots || [];
    savingsList.innerHTML = pots.length === 0 ? '<p class="italic text-gray-400">Nog geen spaarpotjes.</p>' : pots.map(p => `
        <div class="flex justify-between py-1 border-b">
            <span>🌱 ${p.name}</span>
            <span class="font-semibold text-indigo-900">€ ${p.saved.toFixed(2)}</span>
        </div>
    `).join('');
}

// Paydayradar logica (telt af naar 23e om 08:00, of vrijdag ervoor als weekend)
function initPaydayRadar() {
    const radarEl = document.getElementById('payday-countdown');
    if (!radarEl) return;

    function updateRadar() {
        const now = new Date();
        let targetMonth = now.getMonth();
        let targetYear = now.getFullYear();

        // Bepaal de 23e van deze maand om 08:00
        let payday = new Date(targetYear, targetMonth, 23, 8, 0, 0);

        // Als vandaag al voorbij de 23e is, pak de 23e van volgende maand
        if (now > payday) {
            payday = new Date(targetYear, targetMonth + 1, 23, 8, 0, 0);
        }

        // Weekend check (zaterdag = 6, zondag = 0) -> vrijdag ervoor
        const dayOfWeek = payday.getDay();
        if (dayOfWeek === 6) payday.setDate(payday.getDate() - 1);
        if (dayOfWeek === 0) payday.setDate(payday.getDate() - 2);

        const diff = payday - now;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

        radarEl.textContent = `Nog ${days} dagen en ${hours} uur tot loon! 💶`;
    }

    updateRadar();
    setInterval(updateRadar, 60000); // update elk minuut
}
