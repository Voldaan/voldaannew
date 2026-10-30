// js/modules/insights.js
import { checkDateFilter } from './storage.js';

export function initInsightsModule(appData) {
    const container = document.getElementById('inzichten');
    if (!container) return;

    container.innerHTML = `
        <!-- Bovenste Hoofdblok: Filters & Intro -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <div>
                    <h2 class="text-base font-bold text-indigo-900 mb-1">📊 Totaaloverzicht & Diepgaande Inzichten</h2>
                    <p class="text-xs text-gray-500">Ontdek verborgen patronen, trends en correlaties tussen al je dagelijkse gewoonten, taken, geld en vitaliteit.</p>
                </div>
                <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                    <select id="insights-domain-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 sm:flex-none">
                        <option value="all">🌟 Alle Domeinen</option>
                        <option value="vandaag">✨ Vandaag & Stemming</option>
                        <option value="plannen">🎯 Plannen & Doelen</option>
                        <option value="geld">💶 Geld & Leningen</option>
                        <option value="vitality">🌿 Vitaliteit & Herstel</option>
                    </select>
                    <select id="insights-date-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 sm:flex-none">
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

            <!-- Uitgebreide Metriek Grid -->
            <div id="insights-metrics-grid" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <!-- Dynamisch gevuld -->
            </div>
        </div>

        <!-- Live Kruisbestuiving & Slimme Verbanden -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div class="bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-1.5 text-indigo-200 text-[11px] font-bold uppercase mb-2">
                        <span>💡</span> <span>Slimme Patroon-Analyse & Verbanden</span>
                    </div>
                    <p id="insights-correlation-text" class="text-xs leading-relaxed text-indigo-100 font-medium"></p>
                </div>
                <div class="mt-4 pt-3 border-t border-indigo-800/60 text-[10px] text-indigo-300">
                    Gepubliceerd op basis van jouw actuele logboekgegevens.
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

        <!-- Categorie Trends & Historische Verdeling -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <!-- Linker Kolom: Taak- & Doel-distributie -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
                <h3 class="text-sm font-bold text-indigo-900 mb-1">📈 Productiviteit & Categorieën</h3>
                <p class="text-xs text-gray-500 mb-3">Verdeling van voltooide taken en doelen per categorie.</p>
                <div id="insights-category-breakdown" class="space-y-2 text-xs"></div>
            </div>

            <!-- Rechter Kolom: Financiële Gezondheid & Uitgaven Trends -->
            <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
                <h3 class="text-sm font-bold text-indigo-900 mb-1">💶 Geldstromen & Bewustwording</h3>
                <p class="text-xs text-gray-500 mb-3">Top uitgavencategorieën en bewustwordingslabels.</p>
                <div id="insights-money-breakdown" class="space-y-2 text-xs"></div>
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

function initInsightsLogic(appData) {
    const domainFilter = document.getElementById('insights-domain-filter');
    const dateFilter = document.getElementById('insights-date-filter');
    const searchInput = document.getElementById('insights-search-input');
    const customBox = document.getElementById('insights-custom-filter-box');
    const dateInput = document.getElementById('insights-custom-date');
    const monthInput = document.getElementById('insights-custom-month');
    const yearInput = document.getElementById('insights-custom-year');
    const weekInput = document.getElementById('insights-custom-week');

    const updateAll = () => renderInsightsDashboard(appData);

    domainFilter.onchange = updateAll;
    searchInput.oninput = updateAll;

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

    // Filter datasets op datum
    const filterFn = (item) => checkDateFilter(item.date || item.doneAt || new Date().toISOString(), dateFilter, customVal);

    const marbles = (appData.marbles || []).filter(filterFn);
    const tasks = [...(appData.tasks || []), ...(appData.plans?.tasks || [])].filter(t => filterFn(t));
    const goals = (appData.plans?.goals || []).filter(g => filterFn(g));
    const pacts = (appData.plans?.eveningPacts || []).filter(p => filterFn(p));
    const sports = (appData.vitality?.sport || []).filter(s => filterFn(s));
    const sleeps = (appData.vitality?.sleep || []).filter(s => filterFn(s));
    const steps = (appData.vitality?.steps || []).filter(st => filterFn(st));
    const moods = (appData.moods || []).filter(m => filterFn(m));
    const transactions = (appData.money?.transactions || []).filter(tx => filterFn(tx));
    const expenses = (appData.money?.expectedExpenses || []).filter(e => filterFn(e));

    // Metrieken berekenen
    const completedTasks = tasks.filter(t => t.completed || t.done);
    const totalMarbles = marbles.length;
    const totalSports = sports.length;
    const currentBalance = appData.money?.balance || 0;

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

    // Slimme Verbanden & Correlatie Tekst genereren
    const corrText = document.getElementById('insights-correlation-text');
    const goodSleeps = sleeps.filter(s => s.quality?.includes('Goed')).length;
    const focusMoods = moods.filter(m => m.mood === 'Gefocust' || m.mood === 'Hyperfocus' || m.mood === 'Energiek').length;
    
    if (corrText) {
        let msg = `In de geselecteerde periode zijn er ${totalMarbles} overwinningen gevierd en ${completedTasks.length} taken afgerond. `;
        if (goodSleeps > 0 && focusMoods > 0) {
            msg += `Er is een heldere positieve lijn zichtbaar: ${goodSleeps} goede nachten versterken je energie en focus (${focusMoods}x), wat direct doorwerkt in je productiviteit!`;
        } else if (transactions.length > 0) {
            msg += `Je hebt ${transactions.length} financiële transacties geregistreerd. Houd je Ruimte-Kompas in de gaten om rust en balans te bewaren.`;
        } else {
            msg += `Blijf in je eigen tempo bouwen aan je dagelijkse gewoonten. Elke kleine stap is er één naar groei en rust.`;
        }
        corrText.textContent = msg;
    }

    // Balans Score & Advies
    const balancePct = Math.min(100, Math.round(((completedTasks.length + totalMarbles + totalSports) / Math.max(1, (completedTasks.length + totalMarbles + totalSports + 3))) * 100));
    document.getElementById('balance-score-pct').textContent = `${balancePct}%`;
    document.getElementById('balance-progress-bar').style.width = `${balancePct}%`;
    document.getElementById('balance-advice-text').textContent = balancePct > 70 
        ? "Je energie en acties zijn fantastisch in balans! Blijf goed voor jezelf zorgen." 
        : "Rustige periode. Vergeet niet om af en toe een pauze te nemen en je avond-pact in te zetten.";

    // Categorie Breakdown Links
    const catBox = document.getElementById('insights-category-breakdown');
    const catCounts = {};
    completedTasks.forEach(t => {
        const cat = t.category || 'Algemeen';
        catCounts[cat] = (catCounts[cat] || 0) + 1;
    });
    const totalCatTasks = completedTasks.length;

    if (catBox) {
        catBox.innerHTML = totalCatTasks === 0 ? '<p class="text-gray-400 italic">Geen voltooide taken in deze selectie.</p>' : Object.entries(catCounts).map(([cat, count]) => {
            const pct = Math.round((count / totalCatTasks) * 100);
            return `
                <div>
                    <div class="flex justify-between font-semibold text-indigo-900 mb-0.5">
                        <span>${cat}</span>
                        <span>${count} taken (${pct}%)</span>
                    </div>
                    <div class="w-full bg-indigo-100 rounded-full h-2">
                        <div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Geldstromen Rechts
    const moneyBox = document.getElementById('insights-money-breakdown');
    const moneyCats = {};
    transactions.forEach(tx => {
        const cat = tx.category || 'Overig';
        moneyCats[cat] = (moneyCats[cat] || 0) + tx.amount;
    });

    if (moneyBox) {
        const entries = Object.entries(moneyCats);
        moneyBox.innerHTML = entries.length === 0 ? '<p class="text-gray-400 italic">Geen transacties in deze selectie.</p>' : entries.map(([cat, amount]) => `
            <div class="flex justify-between items-center py-1.5 border-b text-xs">
                <span class="font-bold text-gray-800">[${cat}]</span>
                <span class="font-bold ${amount >= 0 ? 'text-emerald-600' : 'text-red-600'}">${amount >= 0 ? '+' : ''}€ ${amount.toFixed(2)}</span>
            </div>
        `).join('');
    }

    // Gecombineerde Historie Logs Lijst met Zoekfunctie
    const logsList = document.getElementById('insights-logs-list');
    const logCountBadge = document.getElementById('insights-log-count');

    let allLogs = [
        ...marbles.map(m => ({ date: m.date, text: `🏺 Knikker: ${m.text || m.reason}`, type: 'Knikker', category: m.category })),
        ...completedTasks.map(t => ({ date: t.date || t.doneAt, text: `✓ Taak volbracht: ${t.text}`, type: 'Taak', category: t.category })),
        ...sports.map(s => ({ date: s.date, text: `🏅 Sport gelogd: ${s.type}`, type: 'Sport', category: 'Gezondheid' })),
        ...sleeps.map(sl => ({ date: sl.date, text: `🌙 Nachtrust: ${sl.quality}`, type: 'Nachtrust', category: 'Gezondheid' })),
        ...moods.map(mo => ({ date: mo.date, text: `${mo.icon || '✨'} Stemming: ${mo.mood}`, type: 'Stemming', category: 'Dagstart' })),
        ...transactions.map(tx => ({ date: tx.date, text: `💶 Transactie: ${tx.description} (€ ${tx.amount.toFixed(2)})`, type: 'Geld', category: tx.category }))
    ];

    // Filter op domein indien ingesteld
    if (domain !== 'all') {
        allLogs = allLogs.filter(l => {
            if (domain === 'vandaag') return l.type === 'Stemming' || l.type === 'Knikker';
            if (domain === 'plannen') return l.type === 'Taak';
            if (domain === 'geld') return l.type === 'Geld';
            if (domain === 'vitality') return l.type === 'Sport' || l.type === 'Nachtrust';
            return true;
        });
    }

    // Zoekfilter toepassen
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
