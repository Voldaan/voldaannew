// js/modules/vandaag.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

const CATEGORIES = ['Algemeen', 'Taken', 'Doelen', 'Gezondheid', 'Geld & Aflossingen', 'Contacten', 'Dagstart'];
const DEFAULT_BUDDY_BUTTONS = [
    { id: 1, label: '💚 Vol hoofd', text: 'Hoi, het is even wat druk in mijn hoofd.' },
    { id: 2, label: '☕ Zachte start', text: 'Hoi, ik neem vandaag een zachte start.' },
    { id: 3, label: '📞 Kort schakelen', text: 'Hoi, lukt het om even kort te schakelen?' },
    { id: 4, label: '🛋️ Even rust', text: 'Alles oké, ik rust even uit.' }
];

export function initVandaagModule(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    if (!appData.vandaagModule) appData.vandaagModule = {};
    if (!appData.vandaagModule.buddyButtons) {
        appData.vandaagModule.buddyButtons = [...DEFAULT_BUDDY_BUTTONS];
    }

    container.innerHTML = `
        <!-- 1. Mijn Dag Begint Nu & Mood Tracker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">✨ Mijn Dag Begint Nu</h2>
                <button id="toggle-mood-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                    Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Waar staat je brein op dit moment naar?</p>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <button data-mood="Wazig / Moe" data-icon="🌫️" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5 shadow-sm">
                    <span>🌫️</span> Wazig / Moe
                </button>
                <button data-mood="Chaotisch / Vol" data-icon="⚡" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5 shadow-sm">
                    <span>⚡</span> Chaotisch / Vol
                </button>
                <button data-mood="Rustig / Oké" data-icon="🪨" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5 shadow-sm">
                    <span>🪨</span> Rustig / Oké
                </button>
                <button data-mood="Gefocust" data-icon="🚀" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5 shadow-sm">
                    <span>🚀</span> Gefocust
                </button>
            </div>

            <div id="mood-history-box" class="hidden mt-3 pt-3 border-t border-gray-100 space-y-3">
                <div class="flex justify-between items-center">
                    <span class="text-xs font-bold text-indigo-900 uppercase">Mood Verloop & Trends</span>
                    <select id="mood-filter-date" class="text-[11px] bg-white border border-gray-200 rounded-lg px-2 py-1">
                        <option value="today">Vandaag</option>
                        <option value="week">Deze week</option>
                        <option value="month">Deze maand</option>
                        <option value="all">Alles</option>
                    </select>
                </div>
                <div id="mood-chart-bars" class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl"></div>
                <div id="mood-history-list" class="space-y-1 text-xs text-gray-600 max-h-32 overflow-y-auto"></div>
            </div>
        </div>

        <!-- 2. De Trots-Kluis -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🏺 De Trots-Kluis</h2>
                <span id="marble-count-badge" class="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-bold">0 Knikkers</span>
            </div>
            <p class="text-xs text-gray-500 mb-3">Elke kleine overwinning vult jouw virtuele glazen pot met gekleurde knikkers.</p>
            
            <div class="p-4 bg-gradient-to-b from-indigo-50/80 to-indigo-100/50 border border-indigo-200/60 rounded-2xl mb-3 flex flex-col items-center text-center shadow-inner">
                <div class="text-2xl mb-1">🏺✨</div>
                <p class="text-xs font-bold text-indigo-950 mb-1">Jouw Gevulde Knikkerpot</p>
                <div id="marble-visual-pot" class="flex flex-wrap gap-1.5 justify-center max-h-28 overflow-y-auto p-2 w-full"></div>
            </div>

            <div class="flex flex-col gap-2 mb-3 bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs">
                <div class="grid grid-cols-2 gap-2">
                    <select id="marble-cat-filter" class="px-3 py-2 bg-white border border-gray-200 rounded-xl">
                        <option value="Alle">Alle categorieën</option>
                        ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="marble-date-filter" class="px-3 py-2 bg-white border border-gray-200 rounded-xl">
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
                <div id="marble-custom-filter-box" class="hidden">
                    <input type="date" id="marble-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    <input type="month" id="marble-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    <input type="number" id="marble-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    <input type="week" id="marble-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                </div>
            </div>

            <button id="open-marble-modal-btn" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm mb-3">
                + Knikker erbij ✨
            </button>

            <div id="marble-list" class="space-y-2"></div>
        </div>

        <!-- 3. Actie-Hub voor Vandaag -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <h2 class="text-base font-bold text-indigo-950 mb-1">🎯 Actie-Hub voor Vandaag</h2>
            <p class="text-xs text-gray-500 mb-3">Jouw compacte overzicht van openstaande focus-taken.</p>
            <div id="actie-hub-list" class="space-y-2"></div>
        </div>

        <!-- 4. Idee van de Dag -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <h2 class="text-base font-bold text-indigo-950 mb-1">💡 Idee van de Dag</h2>
            <p class="text-xs text-gray-500 mb-3">Een willekeurige vonk uit je kluis.</p>
            <div id="idea-of-day-card" class="p-3.5 bg-yellow-50/70 border border-yellow-200 rounded-xl space-y-2">
                <p id="idea-day-text" class="text-xs text-gray-800 leading-relaxed font-medium"></p>
                <div class="flex gap-2 pt-1">
                    <button id="grabbel-idea-btn" class="flex-1 py-2 bg-yellow-600 text-white rounded-xl text-xs font-medium hover:bg-yellow-700 transition">🎲 Grabbelen</button>
                    <button id="idea-to-plan-btn" class="px-3 py-2 bg-white border border-yellow-300 text-yellow-900 rounded-xl text-xs font-medium hover:bg-yellow-100 transition">Naar Planbord</button>
                </div>
            </div>
        </div>

        <!-- 5. Zachte Buddy-Lijn (Met Beheer Menu) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-950">💬 Zachte Buddy-Lijn</h2>
                <button id="open-buddy-beheer-modal" class="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition">Beheer & Berichten</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Lichte signalen om op tijd eerlijk te zijn.</p>
            <div id="buddy-buttons-grid" class="grid grid-cols-2 gap-2"></div>
        </div>
    `;

    initVandaagModals(appData);
    initVandaagLogic(appData);
}

function initVandaagModals(appData) {
    const buddyModalHTML = `
        <div id="buddy-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">💬 Beheer Buddy-Lijn & WhatsApp Berichten</h3>
                    <button id="close-buddy-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <p class="text-gray-500">Pas hier de knopteksten en het volledige WhatsApp-bericht aan dat meegestuurd wordt.</p>
                <div id="buddy-edit-list" class="space-y-3"></div>
                <div class="pt-2">
                    <button id="save-buddy-settings" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold">Wijzigingen Opslaan ✨</button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', buddyModalHTML);

    const modal = document.getElementById('buddy-beheer-modal');
    document.getElementById('open-buddy-beheer-modal').onclick = () => {
        modal.classList.remove('hidden');
        renderBuddyEditList(appData);
    };
    document.getElementById('close-buddy-beheer').onclick = () => modal.classList.add('hidden');

    document.getElementById('save-buddy-settings').onclick = () => {
        const items = document.querySelectorAll('.buddy-edit-item');
        const updated = [];
        items.forEach(el => {
            const id = parseInt(el.getAttribute('data-id'));
            const label = el.querySelector('.buddy-label-input').value.trim();
            const text = el.querySelector('.buddy-text-input').value.trim();
            updated.push({ id, label, text });
        });
        appData.vandaagModule.buddyButtons = updated;
        saveAppData(appData);
        modal.classList.add('hidden');
        renderBuddyButtons(appData);
        showToast("Buddy-lijn instellingen opgeslagen! 💬");
    };
}

function renderBuddyEditList(appData) {
    const list = document.getElementById('buddy-edit-list');
    const buttons = appData.vandaagModule.buddyButtons;
    list.innerHTML = buttons.map(b => `
        <div class="buddy-edit-item p-3 bg-gray-50 border rounded-xl space-y-2" data-id="${b.id}">
            <div>
                <label class="block font-semibold text-gray-700 mb-0.5">Knoptekst</label>
                <input type="text" value="${b.label}" class="buddy-label-input w-full px-2.5 py-1.5 bg-white border rounded-lg">
            </div>
            <div>
                <label class="block font-semibold text-gray-700 mb-0.5">Volledig WhatsApp Bericht</label>
                <textarea rows="2" class="buddy-text-input w-full px-2.5 py-1.5 bg-white border rounded-lg">${b.text}</textarea>
            </div>
        </div>
    `).join('');
}

function renderBuddyButtons(appData) {
    const grid = document.getElementById('buddy-buttons-grid');
    if (!grid) return;
    const buttons = appData.vandaagModule.buddyButtons;
    grid.innerHTML = buttons.map(b => `
        <a href="https://wa.me/?text=${encodeURIComponent(b.text)}" target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition shadow-sm flex items-center justify-center">
            ${b.label}
        </a>
    `).join('');
}

function initVandaagLogic(appData) {
    if (!appData.moods) appData.moods = [];
    if (!appData.marbles) appData.marbles = [];

    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            const icon = btn.getAttribute('data-icon');
            appData.moods.push({ id: Date.now(), mood, icon, date: new Date().toISOString() });
            voegTrotsKnikkerToe(appData, `Dagstart check-in: ${mood}`, 'Dagstart');
            saveAppData(appData);
            renderMoodHistory(appData);
            renderTrotsKluis(appData);
        });
    });

    const toggleHistoryBtn = document.getElementById('toggle-mood-history');
    const historyBox = document.getElementById('mood-history-box');
    toggleHistoryBtn.addEventListener('click', () => {
        historyBox.classList.toggle('hidden');
        if (!historyBox.classList.contains('hidden')) renderMoodHistory(appData);
    });
    document.getElementById('mood-filter-date').addEventListener('change', () => renderMoodHistory(appData));

    renderTrotsKluis(appData);
    renderActieHub(appData);
    renderIdeeVanDeDag(appData);
    renderBuddyButtons(appData);
}

function renderTrotsKluis(appData) {
    const listEl = document.getElementById('marble-list');
    const countBadge = document.getElementById('marble-count-badge');
    const visualPot = document.getElementById('marble-visual-pot');
    const catFilter = document.getElementById('marble-cat-filter').value;
    const dateFilter = document.getElementById('marble-date-filter').value;

    const customBox = document.getElementById('marble-custom-filter-box');
    const dateInput = document.getElementById('marble-custom-date');
    const monthInput = document.getElementById('marble-custom-month');
    const yearInput = document.getElementById('marble-custom-year');
    const weekInput = document.getElementById('marble-custom-week');

    dateInput.classList.add('hidden');
    monthInput.classList.add('hidden');
    yearInput.classList.add('hidden');
    weekInput.classList.add('hidden');
    customBox.classList.add('hidden');

    let customVal = null;
    if (dateFilter === 'specific-day') { customBox.classList.remove('hidden'); dateInput.classList.remove('hidden'); customVal = dateInput.value; }
    else if (dateFilter === 'specific-month') { customBox.classList.remove('hidden'); monthInput.classList.remove('hidden'); customVal = monthInput.value; }
    else if (dateFilter === 'specific-year') { customBox.classList.remove('hidden'); yearInput.classList.remove('hidden'); customVal = yearInput.value; }
    else if (dateFilter === 'specific-week') { customBox.classList.remove('hidden'); weekInput.classList.remove('hidden'); customVal = weekInput.value; }

    const marbles = appData.marbles || [];
    countBadge.textContent = `${marbles.length} Knikkers`;

    const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500', 'bg-rose-500', 'bg-teal-500'];
    visualPot.innerHTML = marbles.length === 0 ? '<p class="text-[11px] text-indigo-400 italic">Nog geen knikkers in de pot.</p>' : marbles.map((m, idx) => {
        const colorClass = colors[idx % colors.length];
        return `<div class="w-6 h-6 rounded-full ${colorClass} shadow-sm border border-white/80 flex items-center justify-center text-[10px] text-white font-bold cursor-pointer transition transform hover:scale-110" title="[${m.category || 'Algemeen'}] ${m.text || m.reason || 'Knikker'}">✨</div>`;
    }).join('');

    const filtered = marbles.filter(m => {
        const matchCat = catFilter === 'Alle' || (m.category || 'Algemeen') === catFilter;
        const matchDate = checkDateFilter(m.date, dateFilter, customVal);
        return matchCat && matchDate;
    });

    listEl.innerHTML = filtered.length === 0 ? `<p class="text-xs text-gray-400 italic">Geen knikkers gevonden.</p>` : filtered.slice(-6).reverse().map(m => `
        <div class="flex justify-between items-center p-3 bg-gray-50 border rounded-xl text-xs">
            <div>
                <span class="font-bold text-indigo-900 px-2 py-0.5 bg-indigo-100/70 rounded-md mr-1.5">[${m.category || 'Algemeen'}]</span> 
                <span class="text-gray-800">${m.text || m.reason || 'Knikker'}</span>
                <span class="text-[10px] text-gray-400 block mt-0.5">${new Date(m.date || Date.now()).toLocaleDateString('nl-NL')}</span>
            </div>
            <button onclick="window.deleteMarble(${m.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
        </div>
    `).join('');

    window.deleteMarble = (id) => {
        appData.marbles = appData.marbles.filter(x => x.id !== id);
        saveAppData(appData);
        renderTrotsKluis(appData);
    };

    document.getElementById('marble-cat-filter').onchange = () => renderTrotsKluis(appData);
    document.getElementById('marble-date-filter').onchange = () => renderTrotsKluis(appData);
    dateInput.onchange = () => renderTrotsKluis(appData);
    monthInput.onchange = () => renderTrotsKluis(appData);
    yearInput.oninput = () => renderTrotsKluis(appData);
    weekInput.onchange = () => renderTrotsKluis(appData);
}

function initMarbleModal(appData) {
    const modalHTML = `
        <div id="marble-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">🏺 Voeg Knikker Toe</h3>
                    <button id="close-marble-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form id="marble-modal-form" class="space-y-3">
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Waar ben je trots op?</label>
                        <textarea id="modal-marble-text" rows="2" placeholder="Bijv. Rustig gebleven..." class="w-full px-3 py-2 border rounded-xl text-xs" required></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Categorie</label>
                        <select id="modal-marble-cat" class="w-full px-3 py-2 border rounded-xl text-xs bg-white">
                            ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-marble-modal" class="flex-1 py-2 bg-gray-100 rounded-xl text-xs font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">Toevoegen ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = document.getElementById('marble-modal');
    document.getElementById('open-marble-modal-btn').onclick = () => modal.classList.remove('hidden');
    document.getElementById('close-marble-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('cancel-marble-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('marble-modal-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('modal-marble-text').value.trim();
        const category = document.getElementById('modal-marble-cat').value;
        if (text) {
            voegTrotsKnikkerToe(appData, text, category);
            modal.classList.add('hidden');
            e.target.reset();
            renderTrotsKluis(appData);
        }
    };
}

function renderMoodHistory(appData) {
    const listEl = document.getElementById('mood-history-list');
    const barsEl = document.getElementById('mood-chart-bars');
    const filter = document.getElementById('mood-filter-date').value;
    const moods = (appData.moods || []).filter(m => checkDateFilter(m.date, filter));

    listEl.innerHTML = moods.length === 0 ? `<p class="italic text-gray-400">Geen check-ins.</p>` : moods.slice(-6).reverse().map(m => `
        <div class="flex justify-between items-center py-1 border-b">
            <span class="font-medium text-gray-800">${m.icon || '✨'} ${m.mood}</span>
            <button onclick="window.deleteMood(${m.id})" class="text-gray-300 hover:text-red-500">✕</button>
        </div>
    `).join('');

    window.deleteMood = (id) => {
        appData.moods = appData.moods.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoodHistory(appData);
    };

    const counts = {};
    moods.forEach(m => counts[m.mood] = (counts[m.mood] || 0) + 1);
    const total = moods.length;

    barsEl.innerHTML = total === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen trenddata.</p>' : Object.entries(counts).map(([mood, count]) => {
        const pct = Math.round((count / total) * 100);
        return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${mood}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
    }).join('');
}

function renderActieHub(appData) {
    const listEl = document.getElementById('actie-hub-list');
    const allTasks = [...(appData.tasks || []), ...(appData.plans?.tasks || [])];
    const openTasks = allTasks.filter(t => !t.archived && !t.done && !t.completed).slice(0, 5);
    
    listEl.innerHTML = openTasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken vandaag. Rust!</p>' : openTasks.map(t => `
        <div class="flex justify-between items-center p-3 bg-white border rounded-xl text-xs shadow-sm">
            <div><span class="font-bold text-indigo-700 mr-1">[${t.category || 'Algemeen'}]</span> <span class="text-gray-800 font-medium">${t.text}</span></div>
            <button onclick="window.quickCompleteTask(${t.id})" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition">Klaar ✨</button>
        </div>
    `).join('');

    window.quickCompleteTask = (id) => {
        const task = openTasks.find(t => t.id === id);
        if (task) {
            task.completed = true;
            task.done = true;
            voegTrotsKnikkerToe(appData, `Taak volbracht: ${task.text}`, task.category || 'Taken');
            saveAppData(appData);
            renderActieHub(appData);
        }
    };
}

function renderIdeeVanDeDag(appData) {
    const textEl = document.getElementById('idea-day-text');
    const allIdeas = [...(appData.ideasModule?.ideas || []), ...(appData.ideas || [])].filter(i => !i.archived);
    const randomIdea = allIdeas.length > 0 ? allIdeas[Math.floor(Math.random() * allIdeas.length)] : null;
    
    if (!randomIdea) {
        textEl.textContent = 'Nog geen ideeën in de kluis.';
        return;
    }
    textEl.textContent = randomIdea.text;

    document.getElementById('grabbel-idea-btn').onclick = () => renderIdeeVanDeDag(appData);
    document.getElementById('idea-to-plan-btn').onclick = () => {
        if (!appData.plans.tasks) appData.plans.tasks = [];
        appData.plans.tasks.push({ id: Date.now(), text: `Idee: ${randomIdea.text}`, category: randomIdea.category || 'Algemeen', completed: false, archived: false, date: new Date().toISOString() });
        saveAppData(appData);
        showToast("Idee overgebracht naar het Planbord! 🎯");
    };
}
