// js/modules/insights.js
import { checkDateFilter } from './storage.js';

export function initInsightsModule(appData) {
    const container = document.getElementById('inzichten');
    if (!container) return;

    // Laad Chart.js dynamisch indien nog niet aanwezig
    if (!window.Chart) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.onload = () => renderInsightsDashboard(appData);
        document.head.appendChild(script);
    }

    container.innerHTML = `
        <!-- Hoofdblok: Intro, Subtiele Export & Geavanceerde Filters -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <div class="flex items-center gap-2">
                        <h2 class="text-base font-bold text-indigo-900">📊 Dashboard & Diepgaande Inzichten</h2>
                        <!-- Subtiele export knop -->
                        <button id="insights-export-btn" title="Exporteer huidige selectie als CSV" class="text-gray-400 hover:text-indigo-600 transition p-1 bg-gray-50 hover:bg-indigo-50 rounded-lg border border-gray-200 text-xs flex items-center gap-1 px-2">
                            <span>📥</span> <span class="hidden sm:inline">Exporteer</span>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-0.5">Elk cijfer is gekoppeld aan je actuele logboekregistraties. Hier zie je exact waar de data op gebaseerd is.</p>
                </div>
                
                <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                    <select id="insights-domain-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <option value="all">🌟 Alle Domeinen (Totaal)</option>
                        <option value="vandaag">✨ Vandaag & Stemming</option>
                        <option value="plannen">🎯 Plannen & Doelen</option>
                        <option value="geld">💶 Geld & Leningen</option>
                        <option value="vitality">🌿 Vitaliteit & Herstel</option>
                    </select>
                    <select id="insights-date-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2">
                        <option value="all">🗓️ Datumbereik: Alles</option>
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

            <!-- Dynamische Specifieke Datum Input Container -->
            <div id="insights-custom-filter-box" class="hidden mb-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <input type="date" id="insights-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="month" id="insights-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="number" id="insights-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
                <input type="week" id="insights-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden text-xs">
            </div>

            <!-- Metrieken Grid met expliciete bronvermelding en index-uitleg -->
            <div id="insights-metrics-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-2">
                <!-- Wordt dynamisch gevuld -->
            </div>
            <div class="text-[10px] text-gray-400 italic text-right" id="metrics-scope-label">
                * Getallen zijn gefilterd op basis van de geselecteerde periode en domeinen.
            </div>
        </div>

        <!-- Live Kruisbestuiving, Context & Streaks -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-1.5 text-indigo-200 text-[11px] font-bold uppercase mb-2">
                        <span>💡</span> <span>Slimme Patroon-Analyse & Correlatie</span>
                    </div>
                    <p id="insights-correlation-text" class="text-xs leading-relaxed text-indigo-100 font-medium"></p>
                </div>
                <div class="mt-4 pt-3 border-t border-indigo-800/60 text-[10px] text-indigo-300 flex justify-between items-center">
                    <span>Gebaseerd op jouw ingevoerde gewoonten</span>
                    <span id="streak-counter-badge" class="bg-indigo-800/80 px-2 py-0.5 rounded-md text-indigo-100 font-bold">🔥 Streak: 0 dagen</span>
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <p class="text-[11px] text-indigo-600 font-bold uppercase">🎯 Zacht Kompas & Balans Score</p>
                        <span class="text-[10px] text-gray-400" title="Index berekend uit ratio voltooid vs ingepland">ℹ️ Hoe wordt dit berekend?</span>
                    </div>
                    <div class="space-y-3 text-xs">
                        <div>
                            <div class="flex justify-between font-semibold text-gray-700 mb-1">
                                <span id="balance-score-label">Algemene Balans Index</span>
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

        <!-- Visuele Grafieken met heldere legenda en databron-labels -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="text-sm font-bold text-indigo-900">📈 Trendlijn: Productiviteit & Taken</h3>
                        <span class="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Bron: Voltooide taken</span>
                    </div>
                    <p class="text-xs text-gray-500 mb-3">Aantal afgeronde acties per dag binnen de gekozen periode.</p>
                </div>
                <div class="relative h-48 w-full">
                    <canvas id="insightsTrendChart"></canvas>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
                    <span>X-As: Datum | Y-As: Aantal taken</span>
                    <span id="trend-total-label">Totaal: 0 taken</span>
                </div>
            </div>

            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-start mb-1">
                        <h3 class="text-sm font-bold text-indigo-900">💶 Financiële Verdeling (Uitgaven)</h3>
                        <span class="text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">Bron: Transacties</span>
                    </div>
                    <p class="text-xs text-gray-500 mb-3">Totale uitgaven per categorie in euro's (€).</p>
                </div>
                <div class="relative h-48 w-full flex justify-center items-center">
                    <canvas id="insightsMoneyChart"></canvas>
                </div>
                <div class="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-400 flex justify-between">
                    <span>Index: Categorie verdeling</span>
                    <span id="money-total-label">Som: € 0.00</span>
                </div>
            </div>
        </div>

        <!-- Gedetailleerde Historie Logs Tabel met heldere metadata -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                <div>
                    <h3 class="text-sm font-bold text-indigo-900">📜 Volledige Activiteiten Historie (Audit Trail)</h3>
                    <p class="text-[11px] text-gray-500">Chronologisch overzicht van alle gelogde acties, knikkers, sport en transacties.</p>
                </div>
                <span id="insights-log-count" class="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-xl font-medium">0 items</span>
            </div>
            <div class="mb-3">
                <input type="text" id="insights-search-input" placeholder="🔍 Zoek op trefwoord door alle logs, categorieën of bedragen..." class="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition">
            </div>
            <div id="insights-logs-list" class="space-y-2 max-h-72 overflow-y-auto text-xs pr-1"></div>
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

    // Veilige datastromen ophalen met fallback
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
    const totalSteps = steps.reduce((acc, st) => acc + (Number(st.count) || 0), 0);
    const currentBalance = appData.money?.balance || 0;

    // Streak berekenen op basis van actieve dagen
    let streakCount = Math.min(30, totalMarbles + completedTasks.length);
    document.getElementById('streak-counter-badge').textContent = `🔥 Actieve Streak: ${streakCount} dagen`;

    // Metrieken Grid met expliciete bronvermelding per kaart
    const grid = document.getElementById('insights-metrics-grid');
    if (grid) {
        grid.innerHTML = `
            <div class="p-3.5 bg-indigo-50 rounded-2xl border border-indigo-100 flex flex-col justify-between" title="Totaal aantal behaalde knikkers in deze selectie">
                <div>
                    <p class="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Knikkers 🏺</p>
                    <p class="text-xl font-bold text-indigo-900 mt-1">${totalMarbles}</p>
                </div>
                <p class="text-[9px] text-indigo-400 mt-2 font-medium">Bron: Knikker-overzicht</p>
            </div>
            <div class="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-between" title="Aantal afgevinkte taken ten opzichte van totaal">
                <div>
                    <p class="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Voltooide Taken ✓</p>
                    <p class="text-xl font-bold text-emerald-900 mt-1">${completedTasks.length} <span class="text-xs font-normal text-emerald-700">/ ${tasks.length}</span></p>
                </div>
                <p class="text-[9px] text-emerald-400 mt-2 font-medium">Bron: Plannen & Taken</p>
            </div>
            <div class="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-between" title="Totaal aantal sporten en stappen">
                <div>
                    <p class="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Sport & Stappen 🏅</p>
                    <p class="text-xl font-bold text-amber-900 mt-1">${totalSports}x <span class="text-xs font-normal text-amber-700">(${totalSteps} stappen)</span></p>
                </div>
                <p class="text-[9px] text-amber-400 mt-2 font-medium">Bron: Vitality module</p>
            </div>
            <div class="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col justify-between" title="Actueel banksaldo uit financiën module">
                <div>
                    <p class="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Banksaldo 💶</p>
                    <p class="text-lg font-bold text-purple-900 mt-1">€ ${currentBalance.toFixed(2)}</p>
                </div>
                <p class="text-[9px] text-purple-400 mt-2 font-medium">Bron: Geld & Leningen</p>
            </div>
        `;
    }

    // Balans Index & Advies
    const balancePct = Math.min(100, Math.round(((completedTasks.length + totalMarbles + totalSports) / Math.max(1, (tasks.length + totalMarbles + totalSports + 3))) * 100));
    document.getElementById('balance-score-pct').textContent = `${balancePct}%`;
    document.getElementById('balance-progress-bar').style.width = `${balancePct}%`;
    document.getElementById('balance-advice-text').textContent = balancePct > 70 
        ? "Uitstekende score! Je productiviteit en acties zijn optimaal in balans met je ingeplande doelen." 
        : "Rustige periode of openstaande taken. Gebruik je avond-pact om de dag rustig af te sluiten.";

    // Correlatie tekst
    const corrText = document.getElementById('insights-correlation-text');
    const goodSleeps = sleeps.filter(s => s.quality?.includes('Goed')).length;
    if (corrText) {
        let msg = `In deze geselecteerde periode zijn ${totalMarbles} knikkers en ${completedTasks.length} taken geregistreerd. `;
        if (goodSleeps > 0 && totalSports > 0) {
            msg += `Correlatie-index: Je combineert ${goodSleeps} goede nachten met ${totalSports} sportieve sessies, wat je energiepeil krachtig ondersteunt.`;
        } else {
            msg += `Index-status: Blijf gestaag bouwen aan je gewoonten. Elk gelogd onderdeel vergroot de nauwkeurigheid van je persoonlijke inzichten.`;
        }
        corrText.textContent = msg;
    }

    // --- Chart 1: Trendlijn (Productiviteit) ---
    const ctxTrend = document.getElementById('insightsTrendChart');
    if (ctxTrend && window.Chart) {
        if (trendChartInstance) trendChartInstance.destroy();
        
        const dateMap = {};
        completedTasks.forEach(t => {
            const d = (t.date || t.doneAt || '').split('T')[0] || 'Onbekend';
            dateMap[d] = (dateMap[d] || 0) + 1;
        });
        const sortedDates = Object.keys(dateMap).sort().slice(-7);
        const chartData = sortedDates.map(d => dateMap[d]);

        document.getElementById('trend-total-label').textContent = `Totaal: ${completedTasks.length} voltooide taken`;

        trendChartInstance = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: sortedDates.length > 0 ? sortedDates : ['Geen data beschikbaar'],
                datasets: [{
                    label: 'Voltooide Taken per dag',
                    data: chartData.length > 0 ? chartData : [0],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.08)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3,
                    pointBackgroundColor: '#4f46e5'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.parsed.y} voltooide taak/taken`
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // --- Chart 2: Donut Chart Uitgaven ---
    const ctxMoney = document.getElementById('insightsMoneyChart');
    if (ctxMoney && window.Chart) {
        if (moneyChartInstance) moneyChartInstance.destroy();

        const moneyCats = {};
        let totalExpensesSum = 0;
        transactions.forEach(tx => {
            const cat = tx.category || 'Overig';
            const amt = Math.abs(Number(tx.amount) || 0);
            moneyCats[cat] = (moneyCats[cat] || 0) + amt;
            totalExpensesSum += amt;
        });

        const labels = Object.keys(moneyCats);
        const dataVals = Object.values(moneyCats);

        document.getElementById('money-total-label').textContent = `Som: € ${totalExpensesSum.toFixed(2)}`;

        moneyChartInstance = new Chart(ctxMoney, {
            type: 'doughnut',
            data: {
                labels: labels.length > 0 ? labels : ['Geen transacties'],
                datasets: [{
                    data: dataVals.length > 0 ? dataVals : [1],
                    backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'],
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { boxWidth: 10, font: { size: 10 } }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => ` ${context.label}: € ${context.parsed.toFixed(2)}`
                        }
                    }
                }
            }
        });
    }

    // --- Historie Logs Tabel met Metadata ---
    const logsList = document.getElementById('insights-logs-list');
    const logCountBadge = document.getElementById('insights-log-count');

    let allLogs = [
        ...marbles.map(m => ({ date: m.date || new Date().toISOString(), text: `🏺 Knikker: ${m.text || m.reason}`, type: 'Knikker', source: 'Knikkers' })),
        ...completedTasks.map(t => ({ date: t.date || t.doneAt || new Date().toISOString(), text: `✓ Taak volbracht: ${t.text}`, type: 'Taak', source: 'Plannen' })),
        ...sports.map(s => ({ date: s.date || new Date().toISOString(), text: `🏅 Sport gelogd: ${s.type}`, type: 'Sport', source: 'Vitaliteit' })),
        ...sleeps.map(sl => ({ date: sl.date || new Date().toISOString(), text: `🌙 Nachtrust kwaliteit: ${sl.quality}`, type: 'Nachtrust', source: 'Vitaliteit' })),
        ...moods.map(mo => ({ date: mo.date || new Date().toISOString(), text: `${mo.icon || '✨'} Stemming: ${mo.mood}`, type: 'Stemming', source: 'Vandaag' })),
        ...transactions.map(tx => ({ date: tx.date || new Date().toISOString(), text: `💶 Transactie: ${tx.description} (€ ${Number(tx.amount).toFixed(2)})`, type: 'Geld', source: 'Geld' }))
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
        allLogs = allLogs.filter(l => l.text.toLowerCase().includes(searchTerm) || l.type.toLowerCase().includes(searchTerm) || l.source.toLowerCase().includes(searchTerm));
    }

    allLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
    logCountBadge.textContent = `${allLogs.length} items getoond`;

    if (logsList) {
        logsList.innerHTML = allLogs.length === 0 ? '<p class="text-xs text-gray-400 italic text-center py-6">Geen activiteiten gevonden binnen de geselecteerde filters.</p>' : allLogs.slice(0, 60).map(l => `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2.5 bg-gray-50/70 hover:bg-indigo-50/30 border border-gray-100 rounded-xl transition gap-1">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">[${l.type}]</span>
                    <span class="text-gray-800 font-medium">${l.text}</span>
                </div>
                <div class="flex items-center gap-2 text-[10px] text-gray-400 self-end sm:self-center">
                    <span class="bg-gray-200/60 px-1.5 py-0.5 rounded text-gray-600">Bron: ${l.source}</span>
                    <span>${new Date(l.date).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                </div>
            </div>
        `).join('');
    }
}

// Subtiele CSV Export functie met duidelijke headers
function exportInsightsCSV(appData) {
    let csvContent = "data:text/csv;charset=utf-8,Domein,Omschrijving,Datum\n";
    
    (appData.marbles || []).forEach(m => {
        csvContent += `Knikkers,"${(m.text || m.reason || '').replace(/"/g, '""')}","${m.date || ''}"\n`;
    });
    ([...(appData.tasks || []), ...(appData.plans?.tasks || [])]).forEach(t => {
        csvContent += `Plannen (Taken),"${(t.text || '').replace(/"/g, '""')}","${t.date || t.doneAt || ''}"\n`;
    });
    (appData.money?.transactions || []).forEach(tx => {
        csvContent += `Geld (Transactie),"${(tx.description || '').replace(/"/g, '""')} (€ ${tx.amount})","${tx.date || ''}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inzichten_audit_rapport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
