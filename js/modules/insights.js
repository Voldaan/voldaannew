// js/modules/insights.js
import { checkDateFilter } from './storage.js';

export function initInsightsModule(appData) {
    const container = document.getElementById('inzichten');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                <div>
                    <h2 class="text-base font-bold text-indigo-900 mb-1">📊 Jouw Reis in Cijfers & Inzichten</h2>
                    <p class="text-xs text-gray-500">Gepersonaliseerde inzichten en verbanden op basis van data uit jouw eigen app.</p>
                </div>
                <select id="insights-date-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2">
                    <option value="all">Alles</option>
                    <option value="today">Vandaag</option>
                    <option value="week">Deze week</option>
                    <option value="month">Deze maand</option>
                    <option value="year">Dit jaar</option>
                </select>
            </div>
            
            <!-- Cijfers Grid -->
            <div id="insights-metrics-grid" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                <!-- Wordt dynamisch gevuld -->
            </div>

            <!-- Visuele Trend & Verbanden -->
            <div class="space-y-3">
                <div class="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
                    <p class="text-[11px] text-indigo-600 font-bold uppercase mb-1">📈 Live Verbanden & Trend-Analyse</p>
                    <p id="insights-trend-text" class="text-xs text-indigo-950 font-medium leading-relaxed"></p>
                </div>

                <div class="p-4 bg-indigo-900 text-white rounded-2xl shadow-sm">
                    <p class="text-[11px] text-indigo-200 uppercase font-semibold mb-1">Zacht Inzicht</p>
                    <p class="text-xs italic leading-relaxed">"Je hoeft niet hard te gaan om ergens te komen. Elke stap op jouw eigen tempo, in cijfers of daarbuiten, is er één van groei."</p>
                </div>
            </div>
        </div>
    `;

    initInsightsLogic(appData);
}

function initInsightsLogic(appData) {
    const filterSelect = document.getElementById('insights-date-filter');
    filterSelect.onchange = () => renderInsightsData(appData);
    renderInsightsData(appData);
}

function renderInsightsData(appData) {
    const filter = document.getElementById('insights-date-filter').value;
    const grid = document.getElementById('insights-metrics-grid');
    const trendText = document.getElementById('insights-trend-text');

    // Filter datasets op basis van geselecteerde datumfilter
    const marbles = (appData.marbles || []).filter(m => checkDateFilter(m.date, filter));
    const tasks = [...(appData.tasks || []), ...(appData.plans?.tasks || [])].filter(t => (t.completed || t.done) && checkDateFilter(t.date || t.doneAt, filter));
    const pacts = (appData.eveningPacts || []).filter(p => !p.archived && checkDateFilter(p.date, filter));
    const sports = (appData.vitality?.sport || []).filter(s => checkDateFilter(s.date, filter));
    const moods = (appData.moods || []).filter(m => checkDateFilter(m.date, filter));
    const balance = appData.money?.balance || 0;

    grid.innerHTML = `
        <div class="p-3.5 bg-indigo-50 rounded-2xl text-center">
            <p class="text-[11px] text-indigo-600 font-bold uppercase">Knikkers</p>
            <p class="text-xl font-bold text-indigo-900 mt-1">${marbles.length}</p>
        </div>
        <div class="p-3.5 bg-green-50 rounded-2xl text-center">
            <p class="text-[11px] text-green-600 font-bold uppercase">Taken Gelukt</p>
            <p class="text-xl font-bold text-green-900 mt-1">${tasks.length}</p>
        </div>
        <div class="p-3.5 bg-amber-50 rounded-2xl text-center">
            <p class="text-[11px] text-amber-600 font-bold uppercase">Avond-Pacten</p>
            <p class="text-xl font-bold text-amber-900 mt-1">${pacts.length}</p>
        </div>
        <div class="p-3.5 bg-blue-50 rounded-2xl text-center">
            <p class="text-[11px] text-blue-600 font-bold uppercase">Sport-Logs</p>
            <p class="text-xl font-bold text-blue-900 mt-1">${sports.length}</p>
        </div>
        <div class="p-3.5 bg-purple-50 rounded-2xl text-center">
            <p class="text-[11px] text-purple-600 font-bold uppercase">Mood Check-ins</p>
            <p class="text-xl font-bold text-purple-900 mt-1">${moods.length}</p>
        </div>
        <div class="p-3.5 bg-gray-50 rounded-2xl text-center">
            <p class="text-[11px] text-gray-600 font-bold uppercase">Banksaldo</p>
            <p class="text-lg font-bold text-gray-900 mt-1">€ ${balance.toFixed(0)}</p>
        </div>
    `;

    // Dynamische trend en verbanden tekst genereren
    const focusMoods = moods.filter(m => m.mood === 'Gefocust').length;
    const tiredMoods = moods.filter(m => m.mood === 'Wazig / Moe').length;

    let verbandMsg = "";
    if (focusMoods > tiredMoods) {
        verbandMsg = `In deze periode zie je een mooie lijn van focus (${focusMoods}x ingecheckt). Dit correleert direct met je ${tasks.length} voltooide taken; wanneer je helder van start gaat, vloeien de acties vanzelf mee.`;
    } else if (tiredMoods > 0) {
        verbandMsg = `Er zijn ${tiredMoods} momenten van "Wazig / Moe" geregistreerd. De app laat zien dat rust nemen en je avond-pacten je helpen om de balans te bewaken zonder jezelf te overvragen.`;
    } else {
        verbandMsg = `Je hebt ${marbles.length} trotse knikkers verzameld en ${tasks.length} taken voltooid in deze selectie. Blijf in je eigen tempo bouwen aan je zachte kompas!`;
    }

    trendText.textContent = verbandMsg;
}
