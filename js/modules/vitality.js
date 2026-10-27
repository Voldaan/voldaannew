// js/modules/vitality.js
import { saveAppData, checkDateFilter } from './storage.js';

const SPORT_TYPES = ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'];

export function initVitalityModule(appData) {
    const container = document.getElementById('vitality');
    if (!container) return;

    container.innerHTML = `
        <!-- 1. Nachtrust en Herstel -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🌙 Nachtrust & Herstel</h2>
            <p class="text-xs text-gray-500 mb-3">Een goede dag begint bij een zachte nacht.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button data-sleep="Goed / Voldoende" class="sleep-btn p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition">✨ Goed / Voldoende geslapen</button>
                <button data-sleep="Onrustig / Korter" class="sleep-btn p-2.5 bg-amber-50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100 transition">⚡ Onrustig / Korter geslapen</button>
            </div>
            <div id="sleep-history" class="text-xs text-gray-500"></div>
        </div>

        <!-- 2. Beweging & Stappen-Anker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🚶 Beweging & Stappen-Anker</h2>
            <p class="text-xs text-gray-500 mb-3">8000 stappen is richtlijn. Beweging is altijd winst!</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button data-steps="8000+" class="steps-btn p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition">🚀 Yes! 8000+ gehaald</button>
                <button data-steps="Minder" class="steps-btn p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition">🛋️ Wat minder stappen</button>
            </div>
            <div id="steps-history" class="text-xs text-gray-500"></div>
        </div>

        <!-- 3. Fitheid & Sport Log (Gefixeerd onder elkaar) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🏅 Fitheid & Sport Log</h2>
            <p class="text-xs text-gray-500 mb-3">Log je beweging op jouw eigen tempo.</p>
            <form id="sport-form" class="space-y-2 mb-3">
                <select id="sport-type" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white">
                    ${SPORT_TYPES.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Sport Log</button>
            </form>
            <ul id="sport-list" class="space-y-1.5 text-xs text-gray-600"></ul>
        </div>

        <!-- 4. Snaai-wachtkamer (Gefixeerd onder elkaar binnen de kaart) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🍿 Snaai-wachtkamer (15 min.)</h2>
            <p class="text-xs text-gray-500 mb-3">Zet de timer en kijk of de trek wegzakt.</p>
            
            <div class="space-y-2 mb-3">
                <input type="text" id="snack-craving-input" placeholder="Waar heb je trek in? (optioneel)" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs">
                <button type="button" id="start-snack-timer" class="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition shadow-sm">Start 15-min Pauze</button>
            </div>
            
            <div id="snack-timer-display" class="text-center font-bold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 mb-2 text-xs">Klaar voor de pauze?</div>
            <ul id="snack-parked-list" class="space-y-1 text-xs text-gray-500"></ul>
        </div>
    `;

    initVitalityLogic(appData);
}

function initVitalityLogic(appData) {
    if (!appData.vitality) {
        appData.vitality = { sleep: [], steps: [], sport: [], snackWaits: [] };
    }

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

    const sportForm = document.getElementById('sport-form');
    sportForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('sport-type').value;
        if (!appData.vitality.sport) appData.vitality.sport = [];
        appData.vitality.sport.push({ id: Date.now(), type, date: new Date().toISOString() });
        saveAppData(appData);
        renderSportList(appData);
    });

    const snackBtn = document.getElementById('start-snack-timer');
    const cravingInput = document.getElementById('snack-craving-input');
    const timerDisplay = document.getElementById('snack-timer-display');

    snackBtn.addEventListener('click', () => {
        const craving = cravingInput.value.trim() || 'Lekkere trek';
        if (!appData.vitality.snackWaits) appData.vitality.snackWaits = [];
        appData.vitality.snackWaits.push({ id: Date.now(), craving, date: new Date().toISOString() });
        saveAppData(appData);

        let timeLeft = 15 * 60;
        snackBtn.disabled = true;
        snackBtn.classList.add('opacity-50');

        const interval = setInterval(() => {
            const mins = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerDisplay.textContent = `Pauze actief: ${mins}:${secs < 10 ? '0' : ''}${secs} rest (${craving})`;
            timeLeft--;

            if (timeLeft < 0) {
                clearInterval(interval);
                timerDisplay.textContent = "✨ 15 minuten voorbij! Voel je de trek nog steeds?";
                snackBtn.disabled = false;
                snackBtn.classList.remove('opacity-50');
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
    box.innerHTML = items.length === 0 ? 'Nog geen nachten geregistreerd.' : `Laatste herstel: <span class="font-semibold text-indigo-900">${items[items.length - 1].quality}</span>`;
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
            <span class="text-gray-400 text-[10px]">${new Date(s.date).toLocaleDateString('nl-NL')}</span>
        </li>
    `).join('');
}

function renderSnackList(appData) {
    const list = document.getElementById('snack-parked-list');
    if (!list) return;
    const items = appData.vitality?.snackWaits || [];
    list.innerHTML = items.length === 0 ? '' : `<p class="font-bold text-gray-700 mt-2">Geparkeerde momenten: ${items.length}</p>`;
}
