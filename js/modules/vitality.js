// js/modules/vitality.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

const DEFAULT_SPORTS = ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'];

export function initVitalityModule(appData) {
    const container = document.getElementById('vitality');
    if (!container) return;

    if (!appData.vitality) {
        appData.vitality = { sleep: [], steps: [], sport: [], sportTypes: [...DEFAULT_SPORTS], nutrition: [], snackWaits: [], dailyLogs: {} };
    }
    if (!appData.vitality.sportTypes) appData.vitality.sportTypes = [...DEFAULT_SPORTS];

    container.innerHTML = `
        <!-- 1. Nachtrust & Herstel -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🌙 Nachtrust & Herstel</h2>
                <button id="toggle-sleep-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                    Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Een goede dag begint bij een zachte nacht.</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button data-sleep="Goed / Voldoende" class="sleep-btn p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition text-center shadow-sm">✨ Goed / Voldoende geslapen</button>
                <button data-sleep="Onrustig / Korter" class="sleep-btn p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-semibold text-amber-900 hover:bg-amber-100 transition text-center shadow-sm">⚡ Onrustig / Korter geslapen</button>
            </div>
            <!-- Historie & Trends Container voor Nachtrust -->
            <div id="sleep-history-box" class="hidden space-y-2 pt-3 border-t border-gray-100 text-xs"></div>
        </div>

        <!-- 2. Beweging & Stappen-Anker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🚶 Beweging & Stappen-Anker</h2>
                <button id="toggle-steps-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                    Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">8000 stappen is jouw richtlijn. Beweging is altijd winst!</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <button data-steps="8000+" class="steps-btn p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-900 hover:bg-indigo-100 transition text-center shadow-sm">🚀 Yes! 8000+ gehaald</button>
                <button data-steps="Minder" class="steps-btn p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 transition text-center shadow-sm">🛋️ Vandaag wat minder stappen</button>
            </div>
            <!-- Historie & Trends Container voor Stappen -->
            <div id="steps-history-box" class="hidden space-y-2 pt-3 border-t border-gray-100 text-xs"></div>
        </div>

        <!-- 3. Fitheid & Sport Log -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🏅 Fitheid & Sport Log</h2>
                <button id="manage-sports-btn" class="text-xs text-indigo-600 hover:underline">Sporten Beheren</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Log je beweging of workout op jouw eigen tempo.</p>
            
            <form id="sport-form" class="space-y-2 mb-3">
                <select id="sport-type" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white"></select>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Sport Log Toevoegen</button>
            </form>
            <ul id="sport-list" class="space-y-1.5 text-xs text-gray-600"></ul>
        </div>

        <!-- 4. Voeding & Balans -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🥗 Voeding & Balans</h2>
            <p class="text-xs text-gray-500 mb-3">Geen strenge regels. Alleen zachte stempels voor bewustwording.</p>
            
            <div class="grid grid-cols-2 gap-2 mb-3">
                <button id="toggle-alcohol-btn" class="p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm">🍷 Alcoholvrije Dag</button>
                <button id="toggle-food-btn" class="p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm">🥑 Bewust Gezond Gegeten</button>
            </div>
            <div class="p-3.5 bg-gray-50 border rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700">Tabak / Sigaretten vandaag:</span>
                    <span id="cigarette-count" class="font-bold text-indigo-900">0 stuks</span>
                </div>
                <div class="flex gap-2">
                    <button id="minus-cig-btn" class="px-3 py-1.5 bg-white border rounded-lg font-bold shadow-sm">-</button>
                    <button id="plus-cig-btn" class="flex-1 py-1.5 bg-amber-600 text-white rounded-lg font-semibold shadow-sm">+ 1 Sigaret Loggen</button>
                </div>
            </div>
        </div>

        <!-- 5. Snaai-wachtkamer -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🍿 Snaai-wachtkamer (15 min. Pauze)</h2>
            <p class="text-xs text-gray-500 mb-3">Trek in een ondoordachte snack? Zet de timer.</p>
            
            <div class="space-y-2 mb-3">
                <input type="text" id="snack-craving-input" placeholder="Waar heb je trek in? (optioneel)" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs">
                <button type="button" id="start-snack-timer" class="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition shadow-sm">Start 15-min Pauze</button>
            </div>
            
            <div id="snack-timer-display" class="text-center font-bold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs">Klaar voor de pauze?</div>
        </div>

        <!-- 6. Vitaliteits-Horizon -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100">
            <h2 class="text-base font-bold text-indigo-900 mb-1">📊 Vitaliteits-Horizon</h2>
            <p class="text-xs text-gray-500 mb-3">Overzicht van jouw opgebouwde gezondheids-zeges.</p>
            <div id="vitality-horizon-stats" class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs"></div>
        </div>
    `;

    initVitalityLogic(appData);
}

function initVitalityLogic(appData) {
    document.querySelectorAll('.sleep-btn').forEach(btn => {
        btn.onclick = () => {
            const quality = btn.getAttribute('data-sleep');
            if (!appData.vitality.sleep) appData.vitality.sleep = [];
            appData.vitality.sleep.push({ id: Date.now(), quality, date: new Date().toISOString() });
            
            voegTrotsKnikkerToe(appData, `Nachtrust geregistreerd: ${quality}`, 'Gezondheid');
            saveAppData(appData);
            renderVitalityViews(appData);
            showToast(`Nachtrust opgeslagen: ${quality} 🌙`);
        };
    });

    document.querySelectorAll('.steps-btn').forEach(btn => {
        btn.onclick = () => {
            const count = btn.getAttribute('data-steps');
            if (!appData.vitality.steps) appData.vitality.steps = [];
            appData.vitality.steps.push({ id: Date.now(), count, date: new Date().toISOString() });
            
            if (count === '8000+') {
                voegTrotsKnikkerToe(appData, `Stappen-anker gehaald: 8000+`, 'Gezondheid');
            }
            saveAppData(appData);
            renderVitalityViews(appData);
            showToast(`Stappen-anker opgeslagen: ${count} 🚶`);
        };
    });

    const sleepHistoryBox = document.getElementById('sleep-history-box');
    document.getElementById('toggle-sleep-history').onclick = () => {
        sleepHistoryBox.classList.toggle('hidden');
        if (!sleepHistoryBox.classList.contains('hidden')) renderVitalityViews(appData);
    };

    const stepsHistoryBox = document.getElementById('steps-history-box');
    document.getElementById('toggle-steps-history').onclick = () => {
        stepsHistoryBox.classList.toggle('hidden');
        if (!stepsHistoryBox.classList.contains('hidden')) renderVitalityViews(appData);
    };

    updateSportDropdown(appData);
    document.getElementById('sport-form').onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('sport-type').value;
        if (!appData.vitality.sport) appData.vitality.sport = [];
        appData.vitality.sport.push({ id: Date.now(), type, date: new Date().toISOString() });
        
        voegTrotsKnikkerToe(appData, `Sport gelogd: ${type}`, 'Gezondheid');
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
        if (currentDayLog.alcoholFree) voegTrotsKnikkerToe(appData, 'Alcoholvrije Dag 🍷❌', 'Gezondheid');
        saveAppData(appData);
        updateNutritionButtons();
    };

    foodBtn.onclick = () => {
        currentDayLog.healthyFood = !currentDayLog.healthyFood;
        if (currentDayLog.healthyFood) voegTrotsKnikkerToe(appData, 'Gezonde Voeding / Fruit 🥗', 'Gezondheid');
        saveAppData(appData);
        updateNutritionButtons();
    };

    function updateNutritionButtons() {
        alcBtn.className = currentDayLog.alcoholFree ? "p-3 bg-emerald-600 text-white border rounded-xl text-xs font-semibold transition text-center shadow-sm" : "p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm";
        foodBtn.className = currentDayLog.healthyFood ? "p-3 bg-emerald-600 text-white border rounded-xl text-xs font-semibold transition text-center shadow-sm" : "p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm";
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
                voegTrotsKnikkerToe(appData, `Snaai-wachtkamer succesvol doorlopen 🍿`, 'Gezondheid');
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
    const sleepBox = document.getElementById('sleep-history-box');
    const sleeps = appData.vitality?.sleep || [];
    
    const sleepCounts = {};
    sleeps.forEach(s => sleepCounts[s.quality] = (sleepCounts[s.quality] || 0) + 1);
    const sleepTotal = sleeps.length;

    sleepBox.innerHTML = `
        <p class="font-bold text-indigo-900 mb-1">Nachtrust Verloop & Trends (${sleepTotal} nachten)</p>
        <div class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl mb-2">
            ${sleepTotal === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen nachtrust data geregistreerd.</p>' : Object.entries(sleepCounts).map(([q, count]) => {
                const pct = Math.round((count / sleepTotal) * 100);
                return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${q}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
            }).join('')}
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto">
            ${sleeps.slice(-6).reverse().map(s => `<div class="flex justify-between items-center py-1 border-b"><span>🌙 ${s.quality} (${new Date(s.date).toLocaleDateString('nl-NL')})</span><button onclick="window.deleteSleep(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button></div>`).join('')}
        </div>
    `;

    window.deleteSleep = (id) => {
        appData.vitality.sleep = appData.vitality.sleep.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };

    const stepsBox = document.getElementById('steps-history-box');
    const steps = appData.vitality?.steps || [];
    
    const stepsCounts = {};
    steps.forEach(s => stepsCounts[s.count] = (stepsCounts[s.count] || 0) + 1);
    const stepsTotal = steps.length;

    stepsBox.innerHTML = `
        <p class="font-bold text-indigo-900 mb-1">Stappen-Anker Verloop & Trends (${stepsTotal} ankers)</p>
        <div class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl mb-2">
            ${stepsTotal === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen stappen data geregistreerd.</p>' : Object.entries(stepsCounts).map(([c, count]) => {
                const pct = Math.round((count / stepsTotal) * 100);
                return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${c}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
            }).join('')}
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto">
            ${steps.slice(-6).reverse().map(s => `<div class="flex justify-between items-center py-1 border-b"><span>🚶 ${s.count} (${new Date(s.date).toLocaleDateString('nl-NL')})</span><button onclick="window.deleteStep(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button></div>`).join('')}
        </div>
    `;

    window.deleteStep = (id) => {
        appData.vitality.steps = appData.vitality.steps.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };

    const sportList = document.getElementById('sport-list');
    const sports = appData.vitality?.sport || [];
    sportList.innerHTML = sports.length === 0 ? '<p class="italic text-gray-400">Nog geen sport-logs ingevoerd.</p>' : sports.slice(-6).reverse().map(s => `
        <li class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span>🏅 ${s.type} <span class="text-gray-400 text-[10px]">(${new Date(s.date).toLocaleDateString('nl-NL')})</span></span>
            <button onclick="window.deleteSport(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
        </li>
    `).join('');

    window.deleteSport = (id) => {
        appData.vitality.sport = appData.vitality.sport.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };

    const statsBox = document.getElementById('vitality-horizon-stats');
    statsBox.innerHTML = `
        <div class="p-3 bg-indigo-50 rounded-xl">
            <p class="text-[10px] font-bold text-indigo-600 uppercase">Nachten</p>
            <p class="text-lg font-bold text-indigo-900">${sleeps.length}</p>
        </div>
        <div class="p-3 bg-emerald-50 rounded-xl">
            <p class="text-[10px] font-bold text-emerald-600 uppercase">Stappen</p>
            <p class="text-lg font-bold text-emerald-900">${steps.length}</p>
        </div>
        <div class="p-3 bg-amber-50 rounded-xl">
            <p class="text-[10px] font-bold text-amber-600 uppercase">Sport-Logs</p>
            <p class="text-lg font-bold text-amber-900">${sports.length}</p>
        </div>
        <div class="p-3 bg-purple-50 rounded-xl">
            <p class="text-[10px] font-bold text-purple-600 uppercase">Pauzes</p>
            <p class="text-lg font-bold text-purple-900">${(appData.vitality?.snackWaits || []).length}</p>
        </div>
    `;
}
