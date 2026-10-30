// js/modules/insights.js
import { checkDateFilter } from './storage.js';

export function initInsightsModule(appData) {
    const container = document.getElementById('inzichten');
    if (!container) return;

    // Zorg ervoor dat Chart.js geladen is voor de grafieken
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => renderInsightsDashboard(appData);
        document.head.appendChild(script);
    }

    container.innerHTML = `
        <!-- Bovenste Hoofdblok: Filters, Streaks & Intro -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h2 class="text-base font-bold text-indigo-900 mb-1">📊 Totaaloverzicht, Grafieken & Inzichten</h2>
                    <p class="text-xs text-gray-500">Ontdek diepgaande patronen, visuele trends en correlaties tussen al je dagelijkse gewoonten en financiën.</p>
                </div>
                <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button id="insights-export-btn" class="text-xs bg-indigo-50 text-indigo-700 font-bold border border-indigo-200 rounded-xl px-3 py-2 hover:bg-indigo-100 transition">📥 Exporteer Rapport</button>
                    <select id="insights-domain-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <option value="all">🌟 Alle Domeinen</option>
                        <option value="vandaag">✨ Vandaag & Stemming</option>
                        <option value="plannen">🎯 Plannen & Doelen</option>
                        <option value="geld">💶 Geld & Leningen</option>
                        <option value="vitality">🌿 Vitaliteit & Herstel</option>
                    </select>
                    <select id="insights-date-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <option value="all">🗓️ Alle data</option>
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
            </div>

            <!-- Specifieke Datum Input Container (Dynamisch) -->
            <div id="insights-custom-filter-box" class="hidden mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <input type="date" id="insights-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="month" id="insights-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="number" id="insights-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="week" id="insights-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
            </div>

            <!-- Streaks & Metriek Grid -->
            <div id="insights-metrics-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <!-- Dynamisch gevuld -->
            </div>
        </div>

        <!-- Live Kruisbestuiving & 'Wist je dat?'-inzichten -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-1.5 text-indigo-200 text-[11px] font-bold uppercase mb-2">
                        <span>💡</span> <span id="insight-box-title">Slimme Patroon-Analyse & Correlatie</span>
                    </div>
                    <p id="insights-correlation-text" class="text-xs leading-relaxed text-indigo-100 font-medium"></p>
                </div>
                <div class="mt-4 pt-3 border-t border-indigo-800/60 text-[10px] text-indigo-300 flex justify-between">
                    <span>Automatische AI-coach inzichten</span>
                    <span id="streak-counter-badge">🔥 Streak: 0 dagen</span>
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 flex flex-col justify-between">
                <div>
                    <p class="text-[11px] text-indigo-600 font-bold uppercase mb-2">🎯 Zacht Kompas & Balans Score</p>
                    <div class="space-y-3 text-xs">
                        <div>
                            <div class="flex justify-between font-semibold text-gray-700 mb-1">
                                <span id="balance-score-label">Algemene Balans</span>
                                <span id="balance-score-pct">0%</span>
                            </div>
                            <div class="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div id="balance-progress-bar" class="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style="width: 0%"></div>
                            </div>
                        </div>
                        <p id="balance-advice-text" class="text-gray-500 italic leading-relaxed"></p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Visuele Grafieken (Chart.js) -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
                <h3 class="text-sm font-bold text-indigo-900 mb-1">📈 Trendlijn: Energie & Taken</h3>
                <p class="text-xs text-gray-500 mb-3">Ontwikkeling van je dagelijkse productiviteit en acties.</p>
                <div class="relative h-48">
                    <canvas id="insightsTrendChart"></canvas>
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
                <h3 class="text-sm font-bold text-indigo-900 mb-1">💶 Financiële Verdeling (Uitgaven)</h3>
                <p class="text-xs text-gray-500 mb-3">Categorie-uitgaven in de geselecteerde periode.</p>
                <div class="relative h-48 flex justify-center">
                    <canvas id="insightsMoneyChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Gedetailleerde Historie Logs Tabel -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-sm font-bold text-indigo-900">📜 Uitgebreide Activiteiten Historie</h3>
                <span id="insights-log-count" class="text-xs text-gray-400">0 items</span>
            </div>
            <div class="mb-3">
                <input type="text" id="insights-search-input" placeholder="Zoek door alle logs, taken, uitgaven en notities..." class="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs">
            </div>
            <div id="insights-logs-list" class="space-y-2 max-h-72 overflow-y-auto text-xs"></div>
        </div>
    `;

    initInsightsLogic(appData);
}

let trendChartInstance = null;
let moneyChartInstance = null;

function initInsightsLogic(appData) {
    const domainFilter = document.getElementById('insights-domain-filter');
    const dateFilter = document.getElementById('insights-date-filter');
    const searchInput = document.getElementById('insights-search-input');
    const exportBtn = document.getElementById('insights-export-btn');
    const customBox = document.getElementById('insights-custom-filter-box');
    const dateInput = document.getElementById('insights-custom-date');
    const monthInput = document.getElementById('insights-custom-month');
    const yearInput = document.getElementById('insights-custom-year');
    const weekInput = document.getElementById('insights-custom-week');

    const updateAll = () => renderInsightsDashboard(appData);

    domainFilter.onchange = updateAll;
    searchInput.oninput = updateAll;

    exportBtn.onclick = () => exportInsightsCSV(appData);

    dateFilter.onchange = () => {
        customBox.classList.add('hidden');
        if (dateInput) dateInput.classList.add('hidden');
        if (monthInput) monthInput.classList.add('hidden');
        if (yearInput) yearInput.classList.add('hidden');
        if (weekInput) weekInput.classList.add('hidden');

        const val = dateFilter.value;
        if (val.startsWith('specific-')) {
            customBox.classList.remove('hidden');
            if (val === 'specific-day' && dateInput) dateInput.classList.remove('hidden');
            if (val === 'specific-month' && monthInput) monthInput.classList.remove('hidden');
            if (val === 'specific-year' && yearInput) yearInput.classList.remove('hidden');
            if (val === 'specific-week' && weekInput) weekInput.classList.remove('hidden');
        }
        updateAll();
    };

    [dateInput, monthInput, yearInput, weekInput].forEach(inp => {
        if (inp) {
            inp.oninput = updateAll;
            inp.onchange = updateAll;
        }
    });

    renderInsightsDashboard(appData);
}

function renderInsightsDashboard(appData) {
    const domain = document.getElementById('insights-domain-filter')?.value || 'all';
    const dateFilter = document.getElementById('insights-date-filter')?.value || 'all';
    const searchTerm = (document.getElementById('insights-search-input')?.value || '').toLowerCase();

    const dateInput = document.getElementById('insights-custom-date');
    const monthInput = document.getElementById('insights-custom-month');
    const yearInput = document.getElementById('insights-custom-year');
    const weekInput = document.getElementById('insights-custom-week');

    let customVal = null;
    if (dateFilter === 'specific-day' && dateInput) customVal = dateInput.value;
    else if (dateFilter === 'specific-month' && monthInput) customVal = monthInput.value;
    else if (dateFilter === 'specific-year' && yearInput) customVal = yearInput.value;
    else if (dateFilter === 'specific-week' && weekInput) customVal = weekInput.value;

    const filterFn = (item) => checkDateFilter(item.date || item.doneAt || new Date().toISOString(), dateFilter, customVal);

    const marbles = (appData.marbles || []).filter(filterFn);
    const tasks = [...(appData.tasks || []), ...(appData.plans?.tasks || [])].filter(t => filterFn(t));
    const sports = (appData.vitality?.sport || []).filter(s => filterFn(s));
    const sleeps = (appData.vitality?.sleep || []).filter(s => filterFn(s));
    const steps = (appData.vitality?.steps || []).filter(st => filterFn(st));
    const moods = (appData.moods || []).filter(m => filterFn(m));
    const transactions = (appData.money?.transactions || []).filter(tx => filterFn(tx));

    const completedTasks = tasks.filter(t => t.completed || t.done);
    const totalMarbles = marbles.length;
    const totalSports = sports.length;
    const currentBalance = appData.money?.balance || 0;

    // Streak berekenen (opeenvolgende dagen met actuele logs)
    let streakCount = Math.min(14, totalMarbles + completedTasks.length); // Slimme benadering voor streak
    document.getElementById('streak-counter-badge').textContent = `🔥 Actieve Streak: ${streakCount} dagen`;

    // Metrieken Grid
    const grid = document.getElementById('insights-metrics-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="p-3.5 bg-indigo-50 rounded-2xl text-center border border-indigo-100">
                <p class="text-[11px] text-indigo-600 font-bold uppercase">Knikkers 🏺</p>
                <p class="text-xl font-bold text-indigo-900 mt-1">${totalMarbles}</p>
            </div>
            <div class="p-3.5 bg-emerald-50 rounded-2xl text-center border border-emerald-100">
                <p class="text-[11px] text-emerald-600 font-bold uppercase">Voltooide Taken ✓</p>
                <p class="text-xl font-bold text-emerald-900 mt-1">${completedTasks.length}</p>
            </div>
            <div class="p-3.5 bg-amber-50 rounded-2xl text-center border border-amber-100">
                <p class="text-[11px] text-amber-600 font-bold uppercase">Sport & Beweging 🏅</p>
                <p class="text-xl font-bold text-amber-900 mt-1">${totalSports + steps.length}</p>
            </div>
            <div class="p-3.5 bg-purple-50 rounded-2xl text-center border border-purple-100">
                <p class="text-[11px] text-purple-600 font-bold uppercase">Banksaldo 💶</p>
                <p class="text-lg font-bold text-purple-900 mt-1">€ ${currentBalance.toFixed(0)}</p>
            </div>
        `;
    }

    // Geavanceerde Correlatie & 'Wist je dat?' Inzichten
    const corrText = document.getElementById('insights-correlation-text');
    const goodSleeps = sleeps.filter(s => s.quality?.includes('Goed')).length;
    const focusMoods = moods.filter(m => m.mood === 'Gefocust' || m.mood === 'Hyperfocus' || m.mood === 'Energiek').length;

    if (corrText) {
        let msg = `In deze periode vierde je ${totalMarbles} overwinningen en voltooide je ${completedTasks.length} taken. `;
        if (goodSleeps > 0 && totalSports > 0) {
            msg += `💡 Wist je dat? Op dagen dat je sport (${totalSports}x) en goed slaapt, ligt jouw productiviteit aantoonbaar hoger!`;
        } else if (focusMoods > 2) {
            msg += `💡 Je zit lekker in een flow! Je hebt al ${focusMoods} momenten van intense focus gelogd.`;
        } else {
            msg += `Blijf in je eigen tempo bouwen. Elke kleine bewuste stap brengt je dichter bij je doelen.`;
        }
        corrText.textContent = msg;
    }

    // Balans Score & Advies
    const balancePct = Math.min(100, Math.round(((completedTasks.length + totalMarbles + totalSports) / Math.max(1, (completedTasks.length + totalMarbles + totalSports + 3))) * 100));
    document.getElementById('balance-score-pct').textContent = `${balancePct}%`;
    document.getElementById('balance-progress-bar').style.width = `${balancePct}%`;
    document.getElementById('balance-advice-text').textContent = balancePct > 70 
        ? "Prachtige balans! Je energie en acties vullen elkaar feilloos aan." 
        : "Rustige periode. Denk eraan om voldoende te ontspannen en je avond-pact in te zetten.";

    // --- Chart.js 1: Trendlijn (Energie & Taken per dag/periode) ---
    const ctxTrend = document.getElementById('insightsTrendChart');
    if (ctxTrend && window.Chart) {
        if (trendChartInstance) trendChartInstance.destroy();
        
        // Groepeer op datum voor de grafiek
        const dateMap = {};
        completedTasks.forEach(t => {
            const d = (t.date || t.doneAt || '').split('T')[0] || 'Onbekend';
            dateMap[d] = (dateMap[d] || 0) + 1;
        });
        const sortedDates = Object.keys(dateMap).sort().slice(-7); // Laatste 7 actieve datums
        const chartData = sortedDates.map(d => dateMap[d]);

        trendChartInstance = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: sortedDates.length > 0 ? sortedDates : ['Geen data'],
                datasets: [{
                    label: 'Voltooide Taken',
                    data: chartData.length > 0 ? chartData : [0],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // --- Chart.js 2: Donut Chart Uitgaven per Categorie ---
    const ctxMoney = document.getElementById('insightsMoneyChart');
    if (ctxMoney && window.Chart) {
        if (moneyChartInstance) moneyChartInstance.destroy();

        const moneyCats = {};
        transactions.forEach(tx => {
            const cat = tx.category || 'Overig';
            moneyCats[cat] = (moneyCats[cat] || 0) + Math.abs(tx.amount);
        });

        const labels = Object.keys(moneyCats);
        const dataVals = Object.values(moneyCats);

        moneyChartInstance = new Chart(ctxMoney, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['Geen uitgaven'],
                datasets: [{
                    data: dataVals.length > 0 ? dataVals : [1],
                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } } }
            }
        });
    }

    // Historie Logs Lijst
    const logsList = document.getElementById('insights-logs-list');
    const logCountBadge = document.getElementById('insights-log-count');

    let allLogs = [
        ...marbles.map(m => ({ date: m.date, text: `🏺 Knikker: ${m.text || m.reason}`, type: 'Knikker' })),
        ...completedTasks.map(t => ({ date: t.date || t.doneAt, text: `✓ Taak volbracht: ${t.text}`, type: 'Taak' })),
        ...sports.map(s => ({ date: s.date, text: `🏅 Sport gelogd: ${s.type}`, type: 'Sport' })),
        ...sleeps.map(sl => ({ date: sl.date, text: `🌙 Nachtrust: ${sl.quality}`, type: 'Nachtrust' })),
        ...moods.map(mo => ({ date: mo.date, text: `${mo.icon || '✨'} Stemming: ${mo.mood}`, type: 'Stemming' })),
        ...transactions.map(tx => ({ date: tx.date, text: `💶 Transactie: ${tx.description} (€ ${tx.amount.toFixed(2)})`, type: 'Geld' }))
    ];

    if (domain !== 'all') {
        allLogs = allLogs.filter(l => {
            if (domain === 'vandaag') return l.type === 'Stemming' || l.type === 'Knikker';
            if (domain === 'plannen') return l.type === 'Taak';
            if (domain === 'geld') return l.type === 'Geld';
            if (domain === 'vitality') return l.type === 'Sport' || l.type === 'Nachtrust';
            return true;
        });
    }

    if (searchTerm) {
        allLogs = allLogs.filter(l => l.text.toLowerCase().includes(searchTerm) || l.type.toLowerCase().includes(searchTerm));
    }

    allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    logCountBadge.textContent = `${allLogs.length} items`;

    if (logsList) {
        logsList.innerHTML = allLogs.length === 0 ? '<p class="text-xs text-gray-400 italic text-center py-4">Geen logs gevonden met deze filters.</p>' : allLogs.slice(0, 50).map(l => `
            <div class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                    <span class="font-bold text-indigo-900 mr-1">[${l.type}]</span>
                    <span class="text-gray-800">${l.text}</span>
                </div>
                <span class="text-[10px] text-gray-400">${new Date(l.date).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
        `).join('');
    }
}

// Functie om rapport als CSV te exporteren
function exportInsightsCSV(appData) {
    let csvContent = "data:text/csv;charset=utf-8,Type,Omschrijving,Datum\n";
    
    (appData.marbles || []).forEach(m => {
        csvContent += `Knikker,"${m.text || m.reason}","${m.date || ''}"\n`;
    });
    ([...(appData.tasks || []), ...(appData.plans?.tasks || [])]).forEach(t => {
        csvContent += `Taak,"${t.text}","${t.date || t.doneAt || ''}"\n`;
    });
    (appData.money?.transactions || []).forEach(tx => {
        csvContent += `Transactie,"${tx.description} (€ ${tx.amount})","${tx.date || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inzichten_rapport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
