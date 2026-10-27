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
            saveAppData
