// js/modules/vandaag.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe } from './storage.js';

const CATEGORIES = ['Algemeen', 'Taken', 'Doelen', 'Gezondheid', 'Geld & Aflossingen', 'Contacten', 'Dagstart'];

export function initVandaagModule(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    container.innerHTML = `
        <!-- 1. Mijn Dag Begint Nu & Mood Tracker -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">✨ Mijn Dag Begint Nu</h2>
                <button id="toggle-mood-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                    Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                </button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Waar staat je brein op dit moment naar?</p>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                <button data-mood="Wazig / Moe" data-icon="🌫️" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5">
                    <span>🌫️</span> Wazig / Moe
                </button>
                <button data-mood="Chaotisch / Vol" data-icon="⚡" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5">
                    <span>⚡</span> Chaotisch / Vol
                </button>
                <button data-mood="Rustig / Oké" data-icon="🪨" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5">
                    <span>🪨</span> Rustig / Oké
                </button>
                <button data-mood="Gefocust" data-icon="🚀" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5">
                    <span>🚀</span> Gefocust
                </button>
            </div>

            <!-- Mood Historie & Grafiek Container -->
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
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🏺 De Trots-Kluis</h2>
                <span id="marble-count-badge" class="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-bold">0 Knikkers</span>
            </div>
            <p class="text-xs text-gray-500 mb-3">Elke kleine overwinning vult jouw virtuele glazen pot met gekleurde knikkers.</p>
            
            <div class="flex flex-col gap-2 mb-3">
                <div class="grid grid-cols-2 gap-2">
                    <select id="marble-cat-filter" class="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl">
                        <option value="Alle">Alle categorieën</option>
                        ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <select id="marble-date-filter" class="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl">
                        <option value="all">Alles</option>
                        <option value="today">Vandaag</option>
                        <option value="week">Deze week</option>
                        <option value="month">Deze maand</option>
                        <option value="specific">Specifieke dag...</option>
                    </select>
                </div>
                <div id="marble-specific-date-box" class="hidden">
                    <input type="date" id="marble-specific-date" class="w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-xl">
                </div>
                <button id="open-marble-modal-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">
                    + Knikker erbij ✨
                </button>
            </div>

            <div id="marble-list" class="space-y-2"></div>
        </div>

        <!-- 3. Actie-Hub voor Vandaag -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-950 mb-1">🎯 Actie-Hub voor Vandaag</h2>
            <p class="text-xs text-gray-500 mb-3">Jouw compacte overzicht van openstaande focus-taken.</p>
            <div id="actie-hub-list" class="space-y-2"></div>
        </div>

        <!-- 4. Idee van de Dag -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
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

        <!-- 5. Zachte Buddy-Lijn -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-950 mb-1">💬 Zachte Buddy-Lijn</h2>
            <p class="text-xs text-gray-500 mb-3">Lichte signalen om op tijd eerlijk te zijn.</p>
            <div class="grid grid-cols-2 gap-2">
                <a href="https://wa.me/?text=Hoi,%20het%20is%20even%20wat%20druk%20in%20mijn%20hoofd." target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">💚 Vol hoofd</a>
                <a href="https://wa.me/?text=Hoi,%20ik%20neem%20vandaag%20een%20zachte%20start." target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">☕ Zachte start</a>
                <a href="https://wa.me/?text=Hoi,%20lukt%20het%20om%20even%20kort%20te%20schakelen?" target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">📞 Kort schakelen</a>
                <a href="https://wa.me/?text=Alles%20oké,%20ik%20rust%20even%20uit." target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">🛋️ Even rust</a>
            </div>
        </div>

        <!-- 6. Gegevensbeheer & Backup -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-base font-bold text-indigo-950 mb-1">💾 Gegevensbeheer & Backup</h2>
            <p class="text-xs text-gray-500 mb-3">Bewaar je opgebouwde progressie veilig op je eigen toestel.</p>
            <div class="flex gap-2">
                <button id="export-json-btn" class="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition">Exporteer JSON</button>
                <label class="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold text-center cursor-pointer transition">
                    Importeer JSON <input type="file" id="import-json-file" class="hidden" accept=".json">
                </label>
            </div>
        </div>
    `;

    initMarbleModal(appData);
    initVandaagLogic(appData);
}

function initVandaagLogic(appData) {
    if (!appData.moods) appData.moods = [];
    if (!appData.marbles) appData.marbles = [];

    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            const icon = btn.getAttribute('data-icon');
            const newMood = { id: Date.now(), mood, icon, date: new Date().toISOString() };
            appData.moods.push(newMood);
            saveAppData(appData);
            
            showToast(`Mood geregistreerd: ${icon} ${mood} 🪷`);
            renderMoodHistory(appData);
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
    initBackupLogic(appData);
}

function renderTrotsKluis(appData) {
    const listEl = document.getElementById('marble-list');
    const countBadge = document.getElementById('marble-count-badge');
    const catFilter = document.getElementById('marble-cat-filter').value;
    const dateFilter = document.getElementById('marble-date-filter').value;
    const specificDateInput = document.getElementById('marble-specific-date').value;
    const specificBox = document.getElementById('marble-specific-date-box');

    specificBox.classList.toggle('hidden', dateFilter !== 'specific');

    const marbles = appData.marbles || [];
    countBadge.textContent = `${marbles.length} Knikkers`;

    const filtered = marbles.filter(m => {
        const matchCat = catFilter === 'Alle' || m.category === catFilter;
        let matchDate = checkDateFilter(m.date, dateFilter);
        if (dateFilter === 'specific' && specificDateInput) {
            matchDate = new Date(m.date).toDateString() === new Date(specificDateInput).toDateString();
        }
        return matchCat && matchDate;
    });

    listEl.innerHTML = filtered.length === 0 ? `<p class="text-xs text-gray-400 italic">Geen knikkers gevonden voor deze selectie.</p>` : filtered.slice(-5).reverse().map(m => `
        <div class="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs">
            <div>
                <span class="font-bold text-indigo-900 px-2 py-0.5 bg-indigo-100/70 rounded-md mr-1.5">[${m.category || 'Algemeen'}]</span> 
                <span class="text-gray-800">${m.text || m.reason || 'Knikker'}</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="text-gray-400 text-[10px]">${new Date(m.date || Date.now()).toLocaleDateString('nl-NL')}</span>
                <button onclick="window.deleteMarble(${m.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
            </div>
        </div>
    `).join('');

    window.deleteMarble = (id) => {
        appData.marbles = appData.marbles.filter(x => x.id !== id);
        saveAppData(appData);
        renderTrotsKluis(appData);
        showToast("Knikker verwijderd.");
    };

    document.getElementById('marble-cat-filter').onchange = () => renderTrotsKluis(appData);
    document.getElementById('marble-date-filter').onchange = () => renderTrotsKluis(appData);
    document.getElementById('marble-specific-date').onchange = () => renderTrotsKluis(appData);
}

function initMarbleModal(appData) {
    const modalHTML = `
        <div id="marble-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">🏺 Voeg Knikker Toe aan Trots-Kluis</h3>
                    <button id="close-marble-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form id="marble-modal-form" class="space-y-3">
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Waar ben je trots op?</label>
                        <textarea id="modal-marble-text" rows="2" placeholder="Bijv. Rustig gebleven bij een drukke planning..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" required></textarea>
                    </div>
                    <div>
                        <label class="block text-xs font-semibold text-gray-600 mb-1">Categorie</label>
                        <select id="modal-marble-cat" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white">
                            ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-marble-modal" class="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold">Toevoegen ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('marble-modal');
    document.getElementById('open-marble-modal-btn').addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('close-marble-modal').addEventListener('click', () => modal.classList.add('hidden'));
    document.getElementById('cancel-marble-modal').addEventListener('click', () => modal.classList.add('hidden'));

    document.getElementById('marble-modal-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('modal-marble-text').value.trim();
        const category = document.getElementById('modal-marble-cat').value;
        if (text) {
            voegTrotsKnikkerToe(appData, text, category);
            modal.classList.add('hidden');
            e.target.reset();
            renderTrotsKluis(appData);
        }
    });
}

function renderMoodHistory(appData) {
    const listEl = document.getElementById('mood-history-list');
    const barsEl = document.getElementById('mood-chart-bars');
    const filter = document.getElementById('mood-filter-date').value;

    const moods = (appData.moods || []).filter(m => checkDateFilter(m.date, filter));

    listEl.innerHTML = moods.length === 0 ? `<p class="italic text-gray-400">Geen check-ins in deze periode.</p>` : moods.slice(-6).reverse().map(m => `
        <div class="flex justify-between items-center py-1 border-b border-gray-100">
            <span class="font-medium text-gray-800">${m.icon || '✨'} ${m.mood}</span>
            <div class="flex items-center gap-2">
                <span class="text-gray-400">${new Date(m.date).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</span>
                <button onclick="window.deleteMood(${m.id})" class="text-gray-300 hover:text-red-500">✕</button>
            </div>
        </div>
    `).join('');

    window.deleteMood = (id) => {
        appData.moods = appData.moods.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoodHistory(appData);
        showToast("Check-in verwijderd.");
    };

    const counts = {};
    moods.forEach(m => counts[m.mood] = (counts[m.mood] || 0) + 1);
    const total = moods.length;

    barsEl.innerHTML = total === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen trenddata beschikbaar.</p>' : Object.entries(counts).map(([mood, count]) => {
        const pct = Math.round((count / total) * 100);
        return `
            <div>
                <div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5">
                    <span>${mood}</span>
                    <span>${count}x (${pct}%)</span>
                </div>
                <div class="w-full bg-indigo-200/50 rounded-full h-2 overflow-hidden">
                    <div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderActieHub(appData) {
    const listEl = document.getElementById('actie-hub-list');
    // Haalt taken op uit zowel de nieuwe taken als de uit de backup geïmporteerde taken
    const allTasks = [...(appData.tasks || []), ...(appData.plans?.tasks || [])];
    const openTasks = allTasks.filter(t => !t.archived && !t.done && !t.completed).slice(0, 5);
    
    listEl.innerHTML = openTasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande focus-taken vandaag. Mooi op tijd rust!</p>' : openTasks.map(t => `
        <div class="flex justify-between items-center p-2.5 bg-white border border-gray-100 rounded-xl text-xs">
            <div><span class="font-bold text-indigo-700 mr-1">[${t.category || 'Algemeen'}]</span> <span class="text-gray-800">${t.text}</span></div>
            <button onclick="window.quickCompleteTask(${t.id})" class="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100">Klaar ✨</button>
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
    // Haalt ideeën op uit zowel de ideeënkluis als de oude backup
    const allIdeas = [...(appData.ideasModule?.ideas || []), ...(appData.ideas || [])].filter(i => !i.archived);
    const randomIdea = allIdeas.length > 0 ? allIdeas[Math.floor(Math.random() * allIdeas.length)] : null;

    if (!randomIdea) {
        textEl.textContent = 'Nog geen ideeën in de kluis. Voeg er eentje toe via de Ideeënkluis!';
        return;
    }

    textEl.textContent = randomIdea.text;

    document.getElementById('grabbel-idea-btn').onclick = () => renderIdeeVanDeDag(appData);
    document.getElementById('idea-to-plan-btn').onclick = () => {
        if (!appData.tasks) appData.tasks = [];
        appData.tasks.push({ id: Date.now(), text: `Idee: ${randomIdea.text}`, category: randomIdea.category || 'Algemeen', completed: false, archived: false, date: new Date().toISOString() });
        saveAppData(appData);
        showToast("Idee overgebracht naar het Planbord! 🎯");
    };
}

function initBackupLogic(appData) {
    document.getElementById('export-json-btn').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voldaan_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Backup succesvol geëxporteerd! 💾");
    });

    document.getElementById('import-json-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsed = JSON.parse(event.target.result);
                if (parsed) {
                    localStorage.setItem('voldaan_app_data_v2', JSON.stringify(parsed));
                    location.reload();
                }
            } catch (err) {
                alert("Ongeldig JSON-bestand.");
            }
        };
        reader.readAsText(file);
    });
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
