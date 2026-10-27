// js/modules/vitality.js
import { saveAppData, checkDateFilter } from './storage.js';

const DEFAULT_SPORTS = ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'];

export function initVitalityModule(appData) {
    const container = document.getElementById('vitality');
    if (!container) return;

    if (!appData.vitality) {
        appData.vitality = { sleep: [], steps: [], sport: [], sportTypes: [...DEFAULT_SPORTS], nutrition: [], snackWaits: [] };
    }
    if (!appData.vitality.sportTypes) appData.vitality.sportTypes = [...DEFAULT_SPORTS];

    container.innerHTML = `
        <!-- 1. Nachtrust & Herstel -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🌙 Nachtrust & Herstel</h2>
            <p class="text-xs text-gray-500 mb-3">Een goede dag begint bij een zachte nacht. Hoe voelt je herstel vanmorgen?</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button data-sleep="Goed / Voldoende" class="sleep-btn p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition text-center">✨ Goed / Voldoende geslapen</button>
                <button data-sleep="Onrustig / Korter" class="sleep-btn p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100 transition text-center">⚡ Onrustig / Korter geslapen</button>
            </div>
            <div id="sleep-history" class="text-xs text-gray-600 space-y-1"></div>
        </div>

        <!-- 2. Beweging & Stappen-Anker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🚶 Beweging & Stappen-Anker</h2>
            <p class="text-xs text-gray-500 mb-3">8000 stappen is jouw richtlijn. Beweging is altijd winst!</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button data-steps="8000+" class="steps-btn p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition text-center">🚀 Yes! 8000+ gehaald</button>
                <button data-steps="Minder" class="steps-btn p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition text-center">🛋️ Vandaag wat minder stappen</button>
            </div>
            <div id="steps-history" class="text-xs text-gray-600 space-y-1"></div>
        </div>

        <!-- 3. Fitheid & Sport Log -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🏅 Fitheid & Sport Log</h2>
                <button id="manage-sports-btn" class="text-xs text-indigo-600 hover:underline">Sporten Beheren</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Log je beweging of workout op jouw eigen tempo.</p>
            
            <form id="sport-form" class="space-y-2 mb-3">
                <select id="sport-type" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white"></select>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Sport Log Toevoegen</button>
            </form>
            <ul id="sport-list" class="space-y-1.5 text-xs text-gray-600"></ul>
        </div>

        <!-- 4. Voeding & Balans -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🥗 Voeding & Balans</h2>
            <p class="text-xs text-gray-500 mb-3">Geen strenge regels. Alleen zachte stempels voor bewustwording.</p>
            
            <div class="grid grid-cols-2 gap-2 mb-3">
                <button id="toggle-alcohol-btn" class="p-3 bg-white border rounded-xl text-xs font-semibold transition text-center">🍷 Alcoholvrije Dag</button>
                <button id="toggle-food-btn" class="p-3 bg-white border rounded-xl text-xs font-semibold transition text-center">🥑 Bewust Gezond Gegeten</button>
            </div>

            <div class="p-3 bg-gray-50 border rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700">Tabak / Sigaretten vandaag:</span>
                    <span id="cigarette-count" class="font-bold text-indigo-900">0 stuks</span>
                </div>
                <div class="flex gap-2">
                    <button id="minus-cig-btn" class="px-3 py-1 bg-white border rounded-lg font-bold">-</button>
                    <button id="plus-cig-btn" class="flex-1 py-1 bg-amber-600 text-white rounded-lg font-semibold">+ 1 Sigaret Loggen</button>
                </div>
            </div>
        </div>

        <!-- 5. Snaai-wachtkamer (15 min.) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🍿 Snaai-wachtkamer (15 min. Pauze)</h2>
            <p class="text-xs text-gray-500 mb-3">Trek in een ondoordachte snack? Zet de 15-minuten timer en kijk of de trek wegzakt.</p>
            
            <div class="space-y-2 mb-3">
                <input type="text" id="snack-craving-input" placeholder="Waar heb je trek in? (optioneel)" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs">
                <button type="button" id="start-snack-timer" class="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition shadow-sm">Start 15-min Pauze</button>
            </div>
            
            <div id="snack-timer-display" class="text-center font-bold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 mb-2 text-xs">Klaar voor de pauze?</div>
            <ul id="snack-parked-list" class="space-y-1 text-xs text-gray-500"></ul>
        </div>

        <!-- 6. Vitaliteits-Horizon -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-base font-bold text-indigo-900 mb-1">📊 Vitaliteits-Horizon</h2>
            <p class="text-xs text-gray-500 mb-3">Overzicht van jouw opgebouwde gezondheids-zeges over langere tijd.</p>
            <div id="vitality-horizon-stats" class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs"></div>
        </div>
    `;

    initVitalityLogic(appData);
}

// ---------------------------------------------------------
// Vitaliteit Logica
// ---------------------------------------------------------

function initVitalityLogic(appData) {
    // 1. Nachtrust
    document.querySelectorAll('.sleep-btn').forEach(btn => {
        btn.onclick = () => {
            const quality = btn.getAttribute('data-sleep');
            if (!appData.vitality.sleep) appData.vitality.sleep = [];
            appData.vitality.sleep.push({ id: Date.now(), quality, date: new Date().toISOString() });
            saveAppData(appData);
            renderVitalityViews(appData);
            showToast(`Nachtrust opgeslagen: ${quality} 🌙`);
        };
    });

    // 2. Stappen
    document.querySelectorAll('.steps-btn').forEach(btn => {
        btn.onclick = () => {
            const count = btn.getAttribute('data-steps');
            if (!appData.vitality.steps) appData.vitality.steps = [];
            appData.vitality.steps.push({ id: Date.now(), count, date: new Date().toISOString() });
            saveAppData(appData);
            renderVitalityViews(appData);
            showToast(`Stappen-anker opgeslagen: ${count} 🚶`);
        };
    });

    // 3. Sport Log & Categorie Beheer
    updateSportDropdown(appData);
    document.getElementById('sport-form').onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('sport-type').value;
        if (!appData.vitality.sport) appData.vitality.sport = [];
        appData.vitality.sport.push({ id: Date.now(), type, date: new Date().toISOString() });
        saveAppData(appData);
        renderVitalityViews(appData);
        showToast(`Sport gelogd: ${type} 🏅`);
    };

    document.getElementById('manage-sports-btn').onclick = () => {
        const action = prompt("Wil je een sportcategorie Toevoegen of Verwijderen? Typ 'toevoegen' of 'verwijderen':");
        if (action && action.toLowerCase() === 'toevoegen') {
            const newSport = prompt("Naam van nieuwe sportcategorie:");
            if (newSport && !appData.vitality.sportTypes.includes(newSport)) {
                appData.vitality.sportTypes.push(newSport);
                saveAppData(appData);
                updateSportDropdown(appData);
                showToast("Sportcategorie toegevoegd!");
            }
        } else if (action && action.toLowerCase() === 'verwijderen') {
            const remSport = prompt(`Welke sport verwijderen? (${appData.vitality.sportTypes.join(', ')})`);
            if (remSport && appData.vitality.sportTypes.includes(remSport)) {
                appData.vitality.sportTypes = appData.vitality.sportTypes.filter(s => s !== remSport);
                saveAppData(appData);
                updateSportDropdown(appData);
                showToast("Sportcategorie verwijderd.");
            }
        }
    };

    // 4. Voeding & Balans (Alcoholvrij, Gezond gegeten, Sigaretten)
    const todayStr = new Date().toDateString();
    if (!appData.vitality.dailyLogs) appData.vitality.dailyLogs = {};
    if (!appData.vitality.dailyLogs[todayStr]) {
        appData.vitality.dailyLogs[todayStr] = { alcoholFree: false, healthyFood: false, cigarettes: 0 };
    }

    const currentDayLog = appData.vitality.dailyLogs[todayStr];
    const alcBtn = document.getElementById('toggle-alcohol-btn');
    const foodBtn = document.getElementById('toggle-food-btn');

    updateNutritionButtons();

    alcBtn.onclick = () => {
        currentDayLog.alcoholFree = !currentDayLog.alcoholFree;
        saveAppData(appData);
        updateNutritionButtons();
    };
    foodBtn.onclick = () => {
        currentDayLog.healthyFood = !currentDayLog.healthyFood;
        saveAppData(appData);
        updateNutritionButtons();
    };

    function updateNutritionButtons() {
        alcBtn.className = currentDayLog.alcoholFree ? "p-3 bg-emerald-600 text-white border rounded-xl text-xs font-semibold transition text-center shadow-sm" : "p-3 bg-white border rounded-xl text-xs font-semibold transition text-center";
        foodBtn.className = currentDayLog.healthyFood ? "p-3 bg-emerald-600 text-white border rounded-xl text-xs font-semibold transition text-center shadow-sm" : "p-3 bg-white border rounded-xl text-xs font-semibold transition text-center";
        document.getElementById('cigarette-count').textContent = `${currentDayLog.cigarettes} stuks`;
    }

    document.getElementById('plus-cig-btn').onclick = () => {
        currentDayLog.cigarettes++;
        saveAppData(appData);
        updateNutritionButtons();
    };
    document.getElementById('minus-cig-btn').onclick = () => {
        if (currentDayLog.cigarettes > 0) currentDayLog.cigarettes--;
        saveAppData(appData);
        updateNutritionButtons();
    };

    // 5. Snaai-wachtkamer timer
    const snackBtn = document.getElementById('start-snack-timer');
    const cravingInput = document.getElementById('snack-craving-input');
    const timerDisplay = document.getElementById('snack-timer-display');

    snackBtn.onclick = () => {
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
                renderVitalityViews(appData);
            }
        }, 1000);
    };

    renderVitalityViews(appData);
}

function updateSportDropdown(appData) {
    const select = document.getElementById('sport-type');
    if (!select) return;
    const types = appData.vitality?.sportTypes || DEFAULT_SPORTS;
    select.innerHTML = types.map(s => `<option value="${s}">${s}</option>`).join('');
}

function renderVitalityViews(appData) {
    // Nachtrust historie
    const sleepBox = document.getElementById('sleep-history');
    const sleeps = appData.vitality?.sleep || [];
    sleepBox.innerHTML = sleeps.length === 0 ? '<p class="text-gray-400 italic">Nog geen nachtrust geregistreerd.</p>' : `Laatste registratie: <span class="font-bold text-indigo-900">${sleeps[sleeps.length - 1].quality}</span> (${new Date(sleeps[sleeps.length - 1].date).toLocaleDateString('nl-NL')})`;

    // Stappen historie
    const stepsBox = document.getElementById('steps-history');
    const steps = appData.vitality?.steps || [];
    stepsBox.innerHTML = steps.length === 0 ? '<p class="text-gray-400 italic">Nog geen stappen-anker geregistreerd.</p>' : `Laatste anker: <span class="font-bold text-indigo-900">${steps[steps.length - 1].count}</span> (${new Date(steps[steps.length - 1].date).toLocaleDateString('nl-NL')})`;

    // Sport list
    const sportList = document.getElementById('sport-list');
    const sports = appData.vitality?.sport || [];
    sportList.innerHTML = sports.length === 0 ? '<p class="italic text-gray-400">Nog geen sport-logs.</p>' : sports.slice(-5).reverse().map(s => `
        <li class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span>🏅 ${s.type}</span>
            <span class="text-gray-400 text-[10px]">${new Date(s.date).toLocaleDateString('nl-NL')}</span>
        </li>
    `).join('');

    // Snaai lijst
    const snackList = document.getElementById('snack-parked-list');
    const snacks = appData.vitality?.snackWaits || [];
    snackList.innerHTML = snacks.length === 0 ? '' : `<p class="font-bold text-gray-700 mt-2">Totaal geparkeerde momenten: ${snacks.length}</p>`;

    // Vitaliteits-Horizon Stats
    const statsBox = document.getElementById('vitality-horizon-stats');
    statsBox.innerHTML = `
        <div class="p-3 bg-indigo-50 rounded-xl">
            <p class="text-[10px] font-bold text-indigo-600 uppercase">Nachten</p>
            <p class="text-lg font-bold text-indigo-900">${sleeps.length}</p>
        </div>
        <div class="p-3 bg-emerald-50 rounded-xl">
            <p class="text-[10px] font-bold text-emerald-600 uppercase">Stappen-Ankers</p>
            <p class="text-lg font-bold text-emerald-900">${steps.length}</p>
        </div>
        <div class="p-3 bg-amber-50 rounded-xl">
            <p class="text-[10px] font-bold text-amber-600 uppercase">Sport-Logs</p>
            <p class="text-lg font-bold text-amber-900">${sports.length}</p>
        </div>
        <div class="p-3 bg-purple-50 rounded-xl">
            <p class="text-[10px] font-bold text-purple-600 uppercase">Snaai-pauzes</p>
            <p class="text-lg font-bold text-purple-900">${statsBox && snacks.length}</p>
        </div>
    `;
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-950 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg z-50 transition transform duration-300';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
