// js/modules/vitality.js
import { saveAppData, checkDateFilter } from './storage.js';

const SPORT_TYPES = ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'];

export function initVitalityModule(appData) {
    const container = document.getElementById('vitality');
    if (!container) return;

    container.innerHTML = `
        <!-- 1. Nachtrust en Herstel -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 class="text-lg font-bold text-indigo-900 mb-1">🌙 Nachtrust & Herstel</h2>
            <p class="text-sm text-gray-500 mb-4">Een goede dag begint bij een zachte nacht. Hoe voelt je herstel vanmorgen?</p>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <button data-sleep="Goed / Voldoende" class="sleep-btn p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition">✨ Goed / Voldoende geslapen</button>
                <button data-sleep="Onrustig / Korter" class="sleep-btn p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100 transition">⚡ Onrustig / Korter geslapen</button>
            </div>
            <div id="sleep-history" class="text-xs text-gray-500"></div>
        </div>

        <!-- 2. Beweging & Stappen-Anker -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 class="text-lg font-bold text-indigo-900 mb-1">🚶 Beweging & Stappen-Anker</h2>
            <p class="text-sm text-gray-500 mb-4">8000 stappen is jouw richtlijn. Wel of niet gehaald? Beweging is altijd winst!</p>
            <div class="grid grid-cols-2 gap-3 mb-4">
                <button data-steps="8000+" class="steps-btn p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition">🚀 Yes! 8000+ gehaald</button>
                <button data-steps="Minder" class="steps-btn p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition">🛋️ Vandaag wat minder stappen</button>
            </div>
            <div id="steps-history" class="text-xs text-gray-500"></div>
        </div>

        <!-- 3. Fitheid & Sport Log -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 class="text-lg font-bold text-indigo-900 mb-1">🏅 Fitheid & Sport Log</h2>
            <p class="text-sm text-gray-500 mb-4">Log je beweging of workout op jouw eigen tempo.</p>
            <form id="sport-form" class="flex gap-2 mb-4">
                <select id="sport-type" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white">
                    ${SPORT_TYPES.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">+ Sport Log</button>
            </form>
            <ul id="sport-list" class="space-y-2 text-xs text-gray-600"></ul>
        </div>

        <!-- 4. Snaai-wachtkamer -->
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 class="text-lg font-bold text-indigo-900 mb-1">🍿 Snaai-wachtkamer (15 min. Pauze)</h2>
            <p class="text-sm text-gray-500 mb-4">Trek in een ondoordachte snack? Zet de 15-minuten timer en kijk of de trek wegzakt.</p>
            
            <div class="flex gap-2 mb-4">
                <input type="text" id="snack-craving-input" placeholder="Waar heb je trek in? (optioneel)" class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm">
                <button id="start-snack-timer" class="px-4 py-2 bg-amber-600 text-white rounded-xl text-sm font-medium hover:bg-amber-700">Start 15-min Pauze</button>
            </div>
            <div id="snack-timer-display" class="text-center font-bold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 mb-2">Klaar voor de pauze?</div>
            <ul id="snack-parked-list" class="space-y-1 text-xs text-gray-500"></ul>
        </div>
    `;

    initVitalityLogic(appData);
}

function initVitalityLogic(appData) {
    // Nachtrust
    document.querySelectorAll('.sleep-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const quality = btn.getAttribute('data-sleep');
            if (!appData.vitality.sleep) appData.vitality.sleep = [];
            appData.vitality.sleep.push({ id: Date.now(), quality, date: new Date().toISOString() });
            saveAppData(appData);
            alert(`Nachtrust geregistreerd: ${quality} 🌙`);
            renderSleepHistory(appData);
        });
    });

    // Stappen
    document.querySelectorAll('.steps-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const count = btn.getAttribute('data-steps');
            if (!appData.vitality.steps) appData.vitality.steps = [];
            appData.vitality.steps.push({ id: Date.now(), count, date: new Date().toISOString() });
            saveAppData(appData);
            alert(`Stappen-anker opgeslagen: ${count} 🚶`);
            renderStepsHistory(appData);
        });
    });

    // Sport Log
    const sportForm = document.getElementById('sport-form');
    sportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('sport-type').value;
        if (!appData.vitality.sport) appData.vitality.sport = [];
        appData.vitality.sport.push({ id: Date.now(), type, date: new Date().toISOString() });
        saveAppData(appData);
        renderSportList(appData);
    });

    // Snaai Timer
    const snackBtn = document.getElementById('start-snack-timer');
    const cravingInput = document.getElementById('snack-craving-input');
    const timerDisplay = document.getElementById('snack-timer-display');

    snackBtn.addEventListener('click', () => {
        const craving = cravingInput.value.trim() || 'Onbekende lekkrek';
        if (!appData.vitality.snackWaits) appData.vitality.snackWaits = [];
        appData.vitality.snackWaits.push({ id: Date.now(), craving, date: new Date().toISOString() });
        saveAppData(appData);

        let timeLeft = 15 * 60; // 15 minuten (of pas aan naar seconden voor test)
        snackBtn.disabled = true;

        const interval = setInterval(() => {
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerDisplay.textContent = `Pauze actief: ${mins}:${secs < 10 ? '0' : ''}${secs} rest (Trek in: ${craving})`;
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(interval);
                timerDisplay.textContent = "✨ 15 minuten voorbij! Voel je de trek nog steeds?";
                snackBtn.disabled = false;
                cravingInput.value = '';
                renderSnackList(appData);
            }
        }, 1000);
    });

    renderSleepHistory(appData);
    renderStepsHistory(appData);
    renderSportList(appData);
    renderSnackList(appData);
}

function renderSleepHistory(appData) {
    const box = document.getElementById('sleep-history');
    if (!box) return;
    const items = appData.vitality?.sleep || [];
    box.innerHTML = items.length === 0 ? 'Nog geen nachten geregistreerd.' : `Laatste herstel: <span class="font-semibold text-indigo-900">${items[items.length - 1].quality}</span> (${new Date(items[items.length - 1].date).toLocaleDateString('nl-NL')})`;
}

function renderStepsHistory(appData) {
    const box = document.getElementById('steps-history');
    if (!box) return;
    const items = appData.vitality?.steps || [];
    box.innerHTML = items.length === 0 ? 'Nog geen stappen-ankers geregistreerd.' : `Laatste anker: <span class="font-semibold text-indigo-900">${items[items.length - 1].count}</span>`;
}

function renderSportList(appData) {
    const list = document.getElementById('sport-list');
    if (!list) return;
    const items = appData.vitality?.sport || [];
    list.innerHTML = items.length === 0 ? '<p class="italic text-gray-400">Nog geen sport-logs.</p>' : items.slice(-5).reverse().map(s => `
        <li class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span>🏅 ${s.type}</span>
            <span class="text-gray-400">${new Date(s.date).toLocaleDateString('nl-NL')}</span>
        </li>
    `).join('');
}

function renderSnackList(appData) {
    const list = document.getElementById('snack-parked-list');
    if (!list) return;
    const items = appData.vitality?.snackWaits || [];
    list.innerHTML = items.length === 0 ? '' : `<p class="font-bold text-gray-700 mt-2">Geparkeerde momenten: ${items.length}</p>`;
}
