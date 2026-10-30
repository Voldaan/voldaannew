// js/modules/vitality.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

const DEFAULT_SPORTS = ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'];

// Uitgebreide databank met Kennis & Hacks specifiek voor Vitaliteit
const VITALITY_HACKS_DB = [
    {
        title: "🌙 De 10-3-2-1-0 Slaapregel",
        text: "Geen cafeïne 10u voor slaap, geen eten 3u voor slaap, geen werk 2u voor slaap, geen schermen 1u voor slaap, en 0 snoozes 's ochtends!"
    },
    {
        title: "💧 De Ochtend-Hydratie Start",
        text: "Drink direct na het opstaan een groot glas lauwwarm water voordat je koffie drinkt. Je lichaam is na de nacht immers flink uitgedroogd."
    },
    {
        title: "🚶‍♀️ Micro-wandelingen na de maaltijd",
        text: "Een korte wandeling van slechts 10 minuten na het eten helpt je bloedsuikerspiegel stabiel te houden en stimuleert de spijsvertering."
    },
    {
        title: "🧘 De 4-7-8 Ademhalingshack",
        text: "Ervaar je onrust of stress? Adem 4 seconden in, houd 7 seconden vast en adem langzaam uit in 8 seconden. Dit kalmeert je zenuwstelsel direct."
    },
    {
        title: "👀 De 20-20-20 Oogregel",
        text: "Kijk tijdens langdurig schermwerk elke 20 minuten gedurende 20 seconden naar een object dat op minstens 20 voet (6 meter) afstand staat om oogvermoeidheid te voorkomen."
    },
    {
        title: "🥑 Eet met volle aandacht (Mindful)",
        text: "Leg je telefoon weg tijdens het eten. Door te proeven en rustig te kauwen, merkt jebrein sneller op dat je verzadigd bent."
    },
    {
        title: "☀️ Daglicht binnen 1 uur",
        text: "Probeer binnen een uur nadat je wakker bent even naar buiten te gaan in het daglicht. Dit zet je biologische klok op scherp en verbetert je nachtrust."
    },
    {
        title: "🧠 De 15-minuten Snaai-Pauze",
        text: "Trek in suiker of een ondoordachte snack? Zet de timer op 15 minuten (gebruik de wachtkamer hieronder!) en drink een glas thee. Vaak ebt de acute trek vanzelf weg."
    }
];

export function initVitalityModule(appData) {
    const container = document.getElementById('vitality');
    if (!container) return;

    if (!appData.vitality) {
        appData.vitality = { sleep: [], steps: [], sport: [], sportTypes: [...DEFAULT_SPORTS], nutrition: [], snackWaits: [], dailyLogs: {}, cigaretteGoal: 5 };
    }
    if (!appData.vitality.sportTypes) appData.vitality.sportTypes = [...DEFAULT_SPORTS];
    if (appData.vitality.cigaretteGoal === undefined) appData.vitality.cigaretteGoal = 5;

    container.innerHTML = `
        <!-- 1. Nachtrust & Herstel (met gouden gloed) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 mb-4 relative overflow-hidden" style="box-shadow: 0 0 15px rgba(234, 179, 8, 0.15); border-color: rgba(253, 230, 138, 0.9);">
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
            <div id="sleep-history-box" class="hidden space-y-3 pt-3 border-t border-gray-100 text-xs"></div>
        </div>

        <!-- 2. Beweging & Stappen-Anker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
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
            <div id="steps-history-box" class="hidden space-y-3 pt-3 border-t border-gray-100 text-xs"></div>
        </div>

        <!-- ✨ SUBTIELE KENNIS & HACKS WIDGET (NIEUW) -->
        <div class="bg-gradient-to-r from-emerald-50 via-teal-50/50 to-indigo-50/60 p-4 rounded-2xl shadow-sm border border-emerald-200/60 mb-4">
            <div class="flex justify-between items-start mb-1.5">
                <div class="flex items-center gap-1.5">
                    <span class="text-sm">🧠</span>
                    <h3 id="vitality-hack-title" class="text-xs font-bold text-indigo-900 uppercase tracking-wide"></h3>
                </div>
                <button id="refresh-vitality-hack-btn" title="Toon andere vitaliteits-tip" class="text-[11px] bg-white/80 hover:bg-white text-indigo-700 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-sm transition font-medium flex items-center gap-1">
                    <span>🔄</span> <span>Ververs Tip</span>
                </button>
            </div>
            <p id="vitality-hack-text" class="text-xs text-gray-600 leading-relaxed"></p>
        </div>

        <!-- 3. Fitheid & Sport Log -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🏅 Fitheid & Sport Log</h2>
                <button id="toggle-sport-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                    Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Log je beweging of workout op jouw eigen tempo.</p>
            
            <form id="sport-form" class="space-y-2 mb-3">
                <select id="sport-type" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs bg-white"></select>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Sport Log Toevoegen</button>
            </form>
            <ul id="sport-list" class="space-y-1.5 text-xs text-gray-600 mb-2"></ul>
            
            <!-- Historie & Trends Container voor Sport -->
            <div id="sport-history-box" class="hidden space-y-3 pt-3 border-t border-gray-100 text-xs"></div>
        </div>

        <!-- 4. Voeding & Balans -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🥗 Voeding & Balans</h2>
                <button id="toggle-nutrition-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                    Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Geen strenge regels. Alleen zachte stempels voor bewustwording.</p>
            
            <div class="grid grid-cols-2 gap-2 mb-3">
                <button id="toggle-alcohol-btn" class="p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm">🍷 Alcoholvrije Dag</button>
                <button id="toggle-food-btn" class="p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm">🥑 Bewust Gezond Gegeten</button>
            </div>
            <div class="p-3.5 bg-gray-50 border rounded-xl space-y-2 text-xs">
                <div class="flex justify-between items-center">
                    <span class="font-semibold text-gray-700">Tabak / Sigaretten vandaag (Doel: <span id="current-cig-goal-label">5</span>):</span>
                    <span id="cigarette-count" class="font-bold text-indigo-900">0 stuks</span>
                </div>
                <div class="flex gap-2">
                    <button id="minus-cig-btn" class="px-3 py-1.5 bg-white border rounded-lg font-bold shadow-sm">-</button>
                    <button id="plus-cig-btn" class="flex-1 py-1.5 bg-amber-600 text-white rounded-lg font-semibold shadow-sm">+ 1 Sigaret Loggen</button>
                    <button id="set-cig-goal-btn" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-semibold shadow-sm">Doel ⚙️</button>
                </div>
            </div>

            <!-- Historie & Trends Container voor Voeding & Balans -->
            <div id="nutrition-history-box" class="hidden space-y-3 pt-3 border-t border-gray-100 text-xs mt-3"></div>
        </div>

        <!-- 5. Snaai-wachtkamer -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🍿 Snaai-wachtkamer (15 min. Pauze)</h2>
                <button id="toggle-snack-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                    Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Trek in een ondoordachte snack? Zet de timer.</p>
            
            <div class="space-y-2 mb-3">
                <input type="text" id="snack-craving-input" placeholder="Waar heb je trek in? (optioneel)" class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs">
                <button type="button" id="start-snack-timer" class="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition shadow-sm">Start 15-min Pauze</button>
            </div>
            
            <div id="snack-timer-display" class="text-center font-bold text-amber-800 bg-amber-50 p-3 rounded-xl border border-amber-100 text-xs mb-2">Klaar voor de pauze?</div>

            <!-- Historie & Trends Container voor Snaai-wachtkamer -->
            <div id="snack-history-box" class="hidden space-y-3 pt-3 border-t border-gray-100 text-xs"></div>
        </div>

        <!-- 6. Vitaliteits-Horizon -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
            <h2 class="text-base font-bold text-indigo-900 mb-1">📊 Vitaliteits-Horizon</h2>
            <p class="text-xs text-gray-500 mb-3">Overzicht van jouw opgebouwde gezondheids-zeges.</p>
            <div id="vitality-horizon-stats" class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs"></div>
        </div>
    `;

    initVitalityLogic(appData);
}

function initVitalityLogic(appData) {
    // Initialiseer Kennis & Hacks widget
    let currentHackIndex = Math.floor(Math.random() * VITALITY_HACKS_DB.length);
    const renderCurrentHack = () => {
        const hack = VITALITY_HACKS_DB[currentHackIndex];
        const titleEl = document.getElementById('vitality-hack-title');
        const textEl = document.getElementById('vitality-hack-text');
        if (titleEl && textEl) {
            titleEl.textContent = hack.title;
            textEl.textContent = hack.text;
        }
    };
    renderCurrentHack();

    const refreshHackBtn = document.getElementById('refresh-vitality-hack-btn');
    if (refreshHackBtn) {
        refreshHackBtn.onclick = () => {
            currentHackIndex = (currentHackIndex + 1) % VITALITY_HACKS_DB.length;
            renderCurrentHack();
            showToast("Nieuwe vitaliteits-tip geladen! 💡");
        };
    }

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

    // Toggle Historie & Trends knoppen
    const sleepHistoryBox = document.getElementById('sleep-history-box');
    document.getElementById('toggle-sleep-history').onclick = () => {
        sleepHistoryBox.classList.toggle('hidden');
        if (!sleepHistoryBox.classList.contains('hidden')) renderSleepHistory(appData);
    };

    const stepsHistoryBox = document.getElementById('steps-history-box');
    document.getElementById('toggle-steps-history').onclick = () => {
        stepsHistoryBox.classList.toggle('hidden');
        if (!stepsHistoryBox.classList.contains('hidden')) renderStepsHistory(appData);
    };

    const sportHistoryBox = document.getElementById('sport-history-box');
    document.getElementById('toggle-sport-history').onclick = () => {
        sportHistoryBox.classList.toggle('hidden');
        if (!sportHistoryBox.classList.contains('hidden')) renderSportHistory(appData);
    };

    const nutritionHistoryBox = document.getElementById('nutrition-history-box');
    document.getElementById('toggle-nutrition-history').onclick = () => {
        nutritionHistoryBox.classList.toggle('hidden');
        if (!nutritionHistoryBox.classList.contains('hidden')) renderNutritionHistory(appData);
    };

    const snackHistoryBox = document.getElementById('snack-history-box');
    document.getElementById('toggle-snack-history').onclick = () => {
        snackHistoryBox.classList.toggle('hidden');
        if (!snackHistoryBox.classList.contains('hidden')) renderSnackHistory(appData);
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

    const todayStr = new Date().toDateString();
    if (!appData.vitality.dailyLogs) appData.vitality.dailyLogs = {};
    if (!appData.vitality.dailyLogs[todayStr]) {
        appData.vitality.dailyLogs[todayStr] = { alcoholFree: false, healthyFood: false, cigarettes: 0 };
    }
    const currentDayLog = appData.vitality.dailyLogs[todayStr];
    const alcBtn = document.getElementById('toggle-alcohol-btn');
    const foodBtn = document.getElementById('toggle-food-btn');

    updateNutritionUI(appData);

    alcBtn.onclick = () => {
        currentDayLog.alcoholFree = !currentDayLog.alcoholFree;
        if (currentDayLog.alcoholFree) voegTrotsKnikkerToe(appData, 'Alcoholvrije Dag 🍷❌', 'Gezondheid');
        saveAppData(appData);
        updateNutritionUI(appData);
    };

    foodBtn.onclick = () => {
        currentDayLog.healthyFood = !currentDayLog.healthyFood;
        if (currentDayLog.healthyFood) voegTrotsKnikkerToe(appData, 'Gezonde Voeding / Fruit 🥗', 'Gezondheid');
        saveAppData(appData);
        updateNutritionUI(appData);
    };

    document.getElementById('plus-cig-btn').onclick = () => {
        currentDayLog.cigarettes++;
        saveAppData(appData);
        updateNutritionUI(appData);
    };
    document.getElementById('minus-cig-btn').onclick = () => {
        if (currentDayLog.cigarettes > 0) currentDayLog.cigarettes--;
        saveAppData(appData);
        updateNutritionUI(appData);
    };

    document.getElementById('set-cig-goal-btn').onclick = () => {
        const newGoal = prompt("Wat is je maximale dagdoel voor sigaretten?", appData.vitality.cigaretteGoal || 5);
        if (newGoal !== null && !isNaN(newGoal)) {
            appData.vitality.cigaretteGoal = parseInt(newGoal, 10);
            saveAppData(appData);
            updateNutritionUI(appData);
            showToast("Sigaretten dagdoel bijgewerkt! 🎯");
        }
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

function updateNutritionUI(appData) {
    const todayStr = new Date().toDateString();
    const currentDayLog = appData.vitality.dailyLogs[todayStr] || { alcoholFree: false, healthyFood: false, cigarettes: 0 };
    const goal = appData.vitality.cigaretteGoal || 5;

    const alcBtn = document.getElementById('toggle-alcohol-btn');
    const foodBtn = document.getElementById('toggle-food-btn');
    const cigCountEl = document.getElementById('cigarette-count');
    const cigGoalLabel = document.getElementById('current-cig-goal-label');

    if (alcBtn) alcBtn.className = currentDayLog.alcoholFree ? "p-3 bg-emerald-600 text-white border rounded-xl text-xs font-semibold transition text-center shadow-sm" : "p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm";
    if (foodBtn) foodBtn.className = currentDayLog.healthyFood ? "p-3 bg-emerald-600 text-white border rounded-xl text-xs font-semibold transition text-center shadow-sm" : "p-3 bg-white border rounded-xl text-xs font-semibold transition text-center shadow-sm";
    
    if (cigGoalLabel) cigGoalLabel.textContent = goal;
    if (cigCountEl) {
        const diffColor = currentDayLog.cigarettes <= goal ? 'text-emerald-700 font-bold' : 'text-red-600 font-bold';
        cigCountEl.className = diffColor;
        cigCountEl.textContent = `${currentDayLog.cigarettes} / ${goal} stuks`;
    }
}

function renderVitalityViews(appData) {
    updateNutritionUI(appData);
    
    // Update Horizon Stats
    const sleeps = appData.vitality?.sleep || [];
    const steps = appData.vitality?.steps || [];
    const sports = appData.vitality?.sport || [];
    const snacks = appData.vitality?.snackWaits || [];

    const statsBox = document.getElementById('vitality-horizon-stats');
    if (statsBox) {
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
                <p class="text-lg font-bold text-purple-900">${snacks.length}</p>
            </div>
        `;
    }

    if (document.getElementById('sleep-history-box') && !document.getElementById('sleep-history-box').classList.contains('hidden')) renderSleepHistory(appData);
    if (document.getElementById('steps-history-box') && !document.getElementById('steps-history-box').classList.contains('hidden')) renderStepsHistory(appData);
    if (document.getElementById('sport-history-box') && !document.getElementById('sport-history-box').classList.contains('hidden')) renderSportHistory(appData);
    if (document.getElementById('nutrition-history-box') && !document.getElementById('nutrition-history-box').classList.contains('hidden')) renderNutritionHistory(appData);
    if (document.getElementById('snack-history-box') && !document.getElementById('snack-history-box').classList.contains('hidden')) renderSnackHistory(appData);

    const sportList = document.getElementById('sport-list');
    if (sportList) {
        sportList.innerHTML = sports.length === 0 ? '<p class="italic text-gray-400 text-xs">Nog geen sport-logs ingevoerd voor vandaag.</p>' : sports.slice(-4).reverse().map(s => `
            <li class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span>🏅 ${s.type} <span class="text-gray-400 text-[10px]">(${new Date(s.date).toLocaleDateString('nl-NL')})</span></span>
                <button onclick="window.deleteSport(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </li>
        `).join('');
    }

    window.deleteSport = (id) => {
        appData.vitality.sport = appData.vitality.sport.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };
}

// ==========================================
// UNIFORME HISTORIE & TRENDS RENDERING
// ==========================================

function renderDateFilterControls(prefix) {
    return `
        <div class="space-y-2 bg-gray-50 p-3 rounded-xl border border-gray-100 mb-3">
            <div class="grid grid-cols-1 gap-2">
                <select id="${prefix}-filter-date" class="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs">
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
            </div>
            <div id="${prefix}-custom-filter-box" class="hidden pt-1">
                <input type="date" id="${prefix}-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="month" id="${prefix}-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="number" id="${prefix}-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="week" id="${prefix}-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
            </div>
        </div>
    `;
}

function setupDateFilterListeners(prefix, renderCallback) {
    const dateFilter = document.getElementById(`${prefix}-filter-date`);
    const customBox = document.getElementById(`${prefix}-custom-filter-box`);
    const dateInput = document.getElementById(`${prefix}-custom-date`);
    const monthInput = document.getElementById(`${prefix}-custom-month`);
    const yearInput = document.getElementById(`${prefix}-custom-year`);
    const weekInput = document.getElementById(`${prefix}-custom-week`);

    if (!dateFilter) return;

    dateFilter.onchange = () => {
        if (customBox) customBox.classList.add('hidden');
        if (dateInput) { dateInput.classList.add('hidden'); dateInput.value = ''; }
        if (monthInput) { monthInput.classList.add('hidden'); monthInput.value = ''; }
        if (yearInput) { yearInput.classList.add('hidden'); yearInput.value = ''; }
        if (weekInput) { weekInput.classList.add('hidden'); weekInput.value = ''; }

        const val = dateFilter.value;
        if (val.startsWith('specific-')) {
            if (customBox) customBox.classList.remove('hidden');
            if (val === 'specific-day' && dateInput) dateInput.classList.remove('hidden');
            if (val === 'specific-month' && monthInput) monthInput.classList.remove('hidden');
            if (val === 'specific-year' && yearInput) yearInput.classList.remove('hidden');
            if (val === 'specific-week' && weekInput) weekInput.classList.remove('hidden');
        }
        renderCallback();
    };

    ['custom-date', 'custom-month', 'custom-year', 'custom-week'].forEach(type => {
        const el = document.getElementById(`${prefix}-${type}`);
        if (el) {
            el.oninput = () => renderCallback();
            el.onchange = () => renderCallback();
        }
    });
}

function getFilteredData(items, prefix) {
    const dateFilter = document.getElementById(`${prefix}-filter-date`)?.value || 'all';
    const dateInput = document.getElementById(`${prefix}-custom-date`);
    const monthInput = document.getElementById(`${prefix}-custom-month`);
    const yearInput = document.getElementById(`${prefix}-custom-year`);
    const weekInput = document.getElementById(`${prefix}-custom-week`);

    let customVal = null;
    if (dateFilter === 'specific-day' && dateInput) customVal = dateInput.value;
    else if (dateFilter === 'specific-month' && monthInput) customVal = monthInput.value;
    else if (dateFilter === 'specific-year' && yearInput) customVal = yearInput.value;
    else if (dateFilter === 'specific-week' && weekInput) customVal = weekInput.value;

    return items.filter(item => checkDateFilter(item.date || new Date().toISOString(), dateFilter, customVal));
}

// 1. Nachtrust Historie
function renderSleepHistory(appData) {
    const box = document.getElementById('sleep-history-box');
    if (!box) return;
    const prefix = 'sleep-hist';

    box.innerHTML = `
        <p class="font-bold text-indigo-900">Nachtrust Verloop & Trends</p>
        ${renderDateFilterControls(prefix)}
        <div id="${prefix}-content"></div>
    `;

    setupDateFilterListeners(prefix, () => updateSleepContent(appData));
    updateSleepContent(appData);
}

function updateSleepContent(appData) {
    const prefix = 'sleep-hist';
    const contentBox = document.getElementById(`${prefix}-content`);
    if (!contentBox) return;

    const filtered = getFilteredData(appData.vitality?.sleep || [], prefix);
    const total = filtered.length;
    const counts = {};
    filtered.forEach(s => counts[s.quality] = (counts[s.quality] || 0) + 1);

    contentBox.innerHTML = `
        <div class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl mb-2">
            <p class="text-[11px] font-semibold text-indigo-900 mb-1">Geselecteerde periode (${total} nachten)</p>
            ${total === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen nachtrust data in deze selectie.</p>' : Object.entries(counts).map(([q, count]) => {
                const pct = Math.round((count / total) * 100);
                return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${q}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
            }).join('')}
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto">
            ${filtered.slice().reverse().map(s => `<div class="flex justify-between items-center py-1 border-b"><span>🌙 ${s.quality} (${new Date(s.date).toLocaleDateString('nl-NL')})</span><button onclick="window.deleteSleep(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button></div>`).join('')}
        </div>
    `;

    window.deleteSleep = (id) => {
        appData.vitality.sleep = appData.vitality.sleep.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };
}

// 2. Stappen Historie
function renderStepsHistory(appData) {
    const box = document.getElementById('steps-history-box');
    if (!box) return;
    const prefix = 'steps-hist';

    box.innerHTML = `
        <p class="font-bold text-indigo-900">Stappen-Anker Verloop & Trends</p>
        ${renderDateFilterControls(prefix)}
        <div id="${prefix}-content"></div>
    `;

    setupDateFilterListeners(prefix, () => updateStepsContent(appData));
    updateStepsContent(appData);
}

function updateStepsContent(appData) {
    const prefix = 'steps-hist';
    const contentBox = document.getElementById(`${prefix}-content`);
    if (!contentBox) return;

    const filtered = getFilteredData(appData.vitality?.steps || [], prefix);
    const total = filtered.length;
    const counts = {};
    filtered.forEach(s => counts[s.count] = (counts[s.count] || 0) + 1);

    contentBox.innerHTML = `
        <div class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl mb-2">
            <p class="text-[11px] font-semibold text-indigo-900 mb-1">Geselecteerde periode (${total} ankers)</p>
            ${total === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen stappen data in deze selectie.</p>' : Object.entries(counts).map(([c, count]) => {
                const pct = Math.round((count / total) * 100);
                return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${c}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
            }).join('')}
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto">
            ${filtered.slice().reverse().map(s => `<div class="flex justify-between items-center py-1 border-b"><span>🚶 ${s.count} (${new Date(s.date).toLocaleDateString('nl-NL')})</span><button onclick="window.deleteStep(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button></div>`).join('')}
        </div>
    `;

    window.deleteStep = (id) => {
        appData.vitality.steps = appData.vitality.steps.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };
}

// 3. Sport Historie
function renderSportHistory(appData) {
    const box = document.getElementById('sport-history-box');
    if (!box) return;
    const prefix = 'sport-hist';

    box.innerHTML = `
        <div class="flex justify-between items-center mb-1">
            <p class="font-bold text-indigo-900">Sport Verloop & Trends</p>
            <button onclick="window.manageSportsModal()" class="text-[11px] text-indigo-600 hover:underline font-medium">Sporten Beheren ⚙️</button>
        </div>
        ${renderDateFilterControls(prefix)}
        <div id="${prefix}-content"></div>
    `;

    setupDateFilterListeners(prefix, () => updateSportContent(appData));
    updateSportContent(appData);

    window.manageSportsModal = () => {
        const sportTypes = appData.vitality?.sportTypes || DEFAULT_SPORTS;
        const action = prompt("Wil je een sportcategorie Toevoegen of Verwijderen? Typ 'toevoegen' of 'verwijderen':");
        if (action && action.toLowerCase() === 'toevoegen') {
            const newSport = prompt("Naam van nieuwe sportcategorie:");
            if (newSport && !appData.vitality.sportTypes.includes(newSport)) {
                appData.vitality.sportTypes.push(newSport);
                saveAppData(appData);
                updateSportDropdown(appData);
                renderSportHistory(appData);
                showToast("Sportcategorie toegevoegd!");
            }
        } else if (action && action.toLowerCase() === 'verwijderen') {
            const remSport = prompt(`Welke sport verwijderen? (${sportTypes.join(', ')})`);
            if (remSport && appData.vitality.sportTypes.includes(remSport)) {
                appData.vitality.sportTypes = appData.vitality.sportTypes.filter(s => s !== remSport);
                saveAppData(appData);
                updateSportDropdown(appData);
                renderSportHistory(appData);
                showToast("Sportcategorie verwijderd.");
            }
        }
    };
}

function updateSportContent(appData) {
    const prefix = 'sport-hist';
    const contentBox = document.getElementById(`${prefix}-content`);
    if (!contentBox) return;

    const filtered = getFilteredData(appData.vitality?.sport || [], prefix);
    const total = filtered.length;
    const counts = {};
    filtered.forEach(s => counts[s.type] = (counts[s.type] || 0) + 1);

    contentBox.innerHTML = `
        <div class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl mb-2">
            <p class="text-[11px] font-semibold text-indigo-900 mb-1">Geselecteerde periode (${total} logs)</p>
            ${total === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen sport data in deze selectie.</p>' : Object.entries(counts).map(([type, count]) => {
                const pct = Math.round((count / total) * 100);
                return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${type}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
            }).join('')}
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto">
            ${filtered.slice().reverse().map(s => `<div class="flex justify-between items-center py-1 border-b"><span>🏅 ${s.type} (${new Date(s.date).toLocaleDateString('nl-NL')})</span><button onclick="window.deleteSport(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button></div>`).join('')}
        </div>
    `;
}

// 4. Voeding & Balans Historie
function renderNutritionHistory(appData) {
    const box = document.getElementById('nutrition-history-box');
    if (!box) return;
    const prefix = 'nutri-hist';

    box.innerHTML = `
        <p class="font-bold text-indigo-900">Voeding & Balans Verloop & Trends</p>
        ${renderDateFilterControls(prefix)}
        <div id="${prefix}-content"></div>
    `;

    setupDateFilterListeners(prefix, () => updateNutritionContent(appData));
    updateNutritionContent(appData);
}

function updateNutritionContent(appData) {
    const prefix = 'nutri-hist';
    const contentBox = document.getElementById(`${prefix}-content`);
    if (!contentBox) return;

    const dailyLogs = appData.vitality?.dailyLogs || {};
    const logsArray = Object.entries(dailyLogs).map(([dateStr, log]) => ({
        date: new Date(dateStr).toISOString(),
        ...log
    }));

    const filtered = getFilteredData(logsArray, prefix);
    const totalDays = filtered.length;
    let alcFreeDays = 0;
    let foodDays = 0;
    let totalCigs = 0;

    filtered.forEach(l => {
        if (l.alcoholFree) alcFreeDays++;
        if (l.healthyFood) foodDays++;
        totalCigs += (l.cigarettes || 0);
    });

    contentBox.innerHTML = `
        <div class="space-y-2 bg-indigo-50/50 p-3 rounded-xl mb-2 text-xs">
            <p class="text-[11px] font-semibold text-indigo-900">Geselecteerde periode (${totalDays} dagen geregistreerd)</p>
            <div class="grid grid-cols-3 gap-2 text-center">
                <div class="bg-white p-2 rounded-lg border">
                    <p class="text-[10px] text-gray-500">Alcoholvrij</p>
                    <p class="font-bold text-indigo-900">${alcFreeDays}x</p>
                </div>
                <div class="bg-white p-2 rounded-lg border">
                    <p class="text-[10px] text-gray-500">Gezond</p>
                    <p class="font-bold text-indigo-900">${foodDays}x</p>
                </div>
                <div class="bg-white p-2 rounded-lg border">
                    <p class="text-[10px] text-gray-500">Sigaretten</p>
                    <p class="font-bold text-indigo-900">${totalCigs} stuks</p>
                </div>
            </div>
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto">
            ${filtered.slice().reverse().map(l => `
                <div class="flex justify-between items-center py-1.5 border-b text-xs">
                    <span>📅 ${new Date(l.date).toLocaleDateString('nl-NL')}</span>
                    <span class="text-gray-600">${l.alcoholFree ? '🍷 Alcoholvrij' : ''} ${l.healthyFood ? '🥑 Gezond' : ''} | Sigaretten: <b>${l.cigarettes || 0}</b></span>
                </div>
            `).join('')}
        </div>
    `;
}

// 5. Snaai-wachtkamer Historie
function renderSnackHistory(appData) {
    const box = document.getElementById('snack-history-box');
    if (!box) return;
    const prefix = 'snack-hist';

    box.innerHTML = `
        <p class="font-bold text-indigo-900">Snaai-wachtkamer Verloop & Trends</p>
        ${renderDateFilterControls(prefix)}
        <div id="${prefix}-content"></div>
    `;

    setupDateFilterListeners(prefix, () => updateSnackContent(appData));
    updateSnackContent(appData);
}

function updateSnackContent(appData) {
    const prefix = 'snack-hist';
    const contentBox = document.getElementById(`${prefix}-content`);
    if (!contentBox) return;

    const filtered = getFilteredData(appData.vitality?.snackWaits || [], prefix);
    const total = filtered.length;

    contentBox.innerHTML = `
        <div class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl mb-2">
            <p class="text-[11px] font-semibold text-indigo-900 mb-1">Totaal voltooid in deze periode: <span class="font-bold">${total} pauzes</span></p>
        </div>
        <div class="space-y-1 max-h-32 overflow-y-auto">
            ${filtered.slice().reverse().map(s => `<div class="flex justify-between items-center py-1 border-b"><span>🍿 ${s.craving} (${new Date(s.date).toLocaleDateString('nl-NL')})</span><button onclick="window.deleteSnack(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button></div>`).join('')}
        </div>
    `;

    window.deleteSnack = (id) => {
        appData.vitality.snackWaits = appData.vitality.snackWaits.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };
}
