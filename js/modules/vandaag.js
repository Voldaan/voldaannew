// js/modules/vandaag.js
import { saveAppData, checkDateFilter } from './storage.js';

const CATEGORIES = ['Algemeen', 'Taken', 'Doelen', 'Gezondheid', 'Geld & Aflossingen', 'Contacten', 'Dagstart'];

export function initVandaagModule(appData) {
    renderMoodSection(appData);
    renderTrotsKluis(appData);
    renderActieHub(appData);
    renderIdeeVanDeDag(appData);
    renderZachteBuddyLijn(appData);
}

// 1. Mood Check-ins & Historie
function renderMoodSection(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    // Zoek of maak een specifieke sectie voor mood binnen Vandaag
    let moodDiv = document.getElementById('mood-section-wrapper');
    if (!moodDiv) {
        moodDiv = document.createElement('div');
        moodDiv.id = 'mood-section-wrapper';
        moodDiv.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6';
        container.prepend(moodDiv);
    }

    const moods = [
        { label: 'Wazig / Moe', icon: '🌫️' },
        { label: 'Chaotisch / Vol', icon: '⚡' },
        { label: 'Rustig / Oké', icon: '🪨' },
        { label: 'Gefocust', icon: '🚀' }
    ];

    moodDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-bold text-indigo-900">✨ Mijn Dag Begint Nu</h2>
            <button id="toggle-mood-history" class="text-xs text-indigo-600 hover:underline font-medium">Historie</button>
        </div>
        <p class="text-sm text-gray-500 mb-4">Waar staat je brein op dit moment naar?</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            ${moods.map(m => `
                <button data-mood="${m.label}" class="mood-btn p-3 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-indigo-50 hover:border-indigo-200 transition flex items-center justify-center gap-2">
                    <span>${m.icon}</span> ${m.label}
                </button>
            `).join('')}
        </div>
        <div id="mood-history-box" class="hidden mt-4 pt-4 border-t border-gray-100 text-xs text-gray-600">
            <p class="font-bold text-indigo-900 mb-2">Jouw Mood Verloop:</p>
            <div id="mood-history-list" class="space-y-1"></div>
        </div>
    `;

    moodDiv.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            if (!appData.moods) appData.moods = [];
            appData.moods.push({
                id: Date.now(),
                mood,
                date: new Date().toISOString()
            });
            saveAppData(appData);
            alert(`Mood geregistreerd: ${mood} 🪷`);
            updateMoodHistory(appData);
        });
    });

    moodDiv.querySelector('#toggle-mood-history').addEventListener('click', () => {
        const box = moodDiv.querySelector('#mood-history-box');
        box.classList.toggle('hidden');
        if (!box.classList.contains('hidden')) {
            updateMoodHistory(appData);
        }
    });
}

function updateMoodHistory(appData) {
    const list = document.getElementById('mood-history-list');
    if (!list) return;
    const moods = appData.moods || [];
    if (moods.length === 0) {
        list.innerHTML = `<p class="italic text-gray-400">Nog geen check-ins geregistreerd.</p>`;
        return;
    }
    list.innerHTML = moods.slice(-5).reverse().map(m => `
        <div class="flex justify-between py-1 border-b border-gray-50">
            <span class="font-medium text-gray-800">${m.mood}</span>
            <span class="text-gray-400">${new Date(m.date).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
    `).join('');
}

// 2. De Trots-Kluis & Knikkerteller
function renderTrotsKluis(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    let kluisDiv = document.getElementById('trots-kluis-wrapper');
    if (!kluisDiv) {
        kluisDiv = document.createElement('div');
        kluisDiv.id = 'trots-kluis-wrapper';
        kluisDiv.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6';
        container.insertBefore(kluisDiv, container.children[1]);
    }

    const marbles = appData.marbles || [];
    
    kluisDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-bold text-indigo-900">🏺 De Trots-Kluis</h2>
            <span id="marble-count-badge" class="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">${marbles.length} Knikkers</span>
        </div>
        <p class="text-sm text-gray-500 mb-4">Elke kleine overwinning vult jouw virtuele glazen pot.</p>
        
        <!-- Filters -->
        <div class="flex flex-wrap gap-2 mb-4 items-center justify-between">
            <div class="flex gap-2">
                <select id="marble-cat-filter" class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                    <option value="Alle">Alle categorieën</option>
                    ${CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
                <select id="marble-date-filter" class="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl">
                    <option value="all">Alles</option>
                    <option value="today">Vandaag</option>
                    <option value="week">Deze week</option>
                    <option value="month">Deze maand</option>
                    <option value="year">Dit jaar</option>
                </select>
            </div>
            <button id="add-marble-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition">
                + Knikker erbij ✨
            </button>
        </div>

        <div id="marble-list" class="space-y-2"></div>
    `;

    const listEl = kluisDiv.querySelector('#marble-list');
    const catFilterEl = kluisDiv.querySelector('#marble-cat-filter');
    const dateFilterEl = kluisDiv.querySelector('#marble-date-filter');

    function drawMarbles() {
        const selectedCat = catFilterEl.value;
        const selectedDate = dateFilterEl.value;

        const filtered = marbles.filter(m => {
            const matchCat = selectedCat === 'Alle' || m.category === selectedCat;
            const matchDate = checkDateFilter(m.date, selectedDate);
            return matchCat && matchDate;
        });
        
        if (filtered.length === 0) {
            listEl.innerHTML = `<p class="text-xs text-gray-400 italic">Geen knikkers gevonden met deze filters.</p>`;
            return;
        }

        listEl.innerHTML = filtered.slice(-5).reverse().map(m => `
            <div class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                <div>
                    <span class="font-semibold text-indigo-900">[${m.category}]</span> 
                    <span class="text-gray-700">${m.text}</span>
                </div>
                <span class="text-gray-400">${new Date(m.date).toLocaleDateString('nl-NL')}</span>
            </div>
        `).join('');
    }

    catFilterEl.addEventListener('change', drawMarbles);
    dateFilterEl.addEventListener('change', drawMarbles);
    drawMarbles();

    kluisDiv.querySelector('#add-marble-btn').addEventListener('click', () => {
        const text = prompt("Waar ben je trots op?", "Kleine overwinning");
        if (text) {
            const cat = prompt(`Kies categorie (${CATEGORIES.join(', ')}):`, 'Algemeen');
            marbles.push({
                id: Date.now(),
                text,
                category: CATEGORIES.includes(cat) ? cat : 'Algemeen',
                date: new Date().toISOString()
            });
            saveAppData(appData);
            renderTrotsKluis(appData);
        }
    });
}

// 3. Actie-Hub voor Vandaag
function renderActieHub(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    let hubDiv = document.getElementById('actie-hub-wrapper');
    if (!hubDiv) {
        hubDiv = document.createElement('div');
        hubDiv.id = 'actie-hub-wrapper';
        hubDiv.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6';
        container.insertBefore(hubDiv, container.children[2]);
    }

    const tasks = (appData.tasks || []).filter(t => !t.archived && !t.completed).slice(0, 5);

    hubDiv.innerHTML = `
        <h2 class="text-lg font-bold text-indigo-950 mb-1">🎯 Actie-Hub voor Vandaag</h2>
        <p class="text-sm text-gray-500 mb-4">Jouw compacte overzicht van openstaande focus-taken.</p>
        <div class="space-y-2">
            ${tasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande focus-taken voor vandaag.</p>' : ''}
            ${tasks.map(t => `
                <div class="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-xl shadow-sm text-sm">
                    <span>${t.text}</span>
                    <button data-task-id="${t.id}" class="quick-complete-task px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100">Klaar ✨</button>
                </div>
            `).join('')}
        </div>
    `;

    hubDiv.querySelectorAll('.quick-complete-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-task-id'));
            const task = appData.tasks.find(t => t.id === id);
            if (task) {
                task.completed = true;
                saveAppData(appData);
                renderActieHub(appData);
            }
        });
    });
}

// 4. Idee van de Dag
function renderIdeeVanDeDag(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    let ideeDiv = document.getElementById('idee-dag-wrapper');
    if (!ideeDiv) {
        ideeDiv = document.createElement('div');
        ideeDiv.id = 'idee-dag-wrapper';
        ideeDiv.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6';
        container.insertBefore(ideeDiv, container.children[3]);
    }

    const ideas = (appData.ideas || []).filter(i => !i.archived);
    const randomIdea = ideas.length > 0 ? ideas[Math.floor(Math.random() * ideas.length)] : null;

    ideeDiv.innerHTML = `
        <h2 class="text-lg font-bold text-indigo-950 mb-1">💡 Idee van de Dag</h2>
        <p class="text-sm text-gray-500 mb-3">Een willekeurige vonk uit je ideeënkluis.</p>
        <div class="p-4 bg-yellow-50/70 border border-yellow-200 rounded-2xl">
            <p class="text-sm text-gray-800 mb-3">${randomIdea ? randomIdea.text : 'Nog geen ideeën in de kluis gezet.'}</p>
            <div class="flex gap-2">
                <button id="grabbel-btn" class="px-3 py-1.5 bg-yellow-600 text-white rounded-xl text-xs font-medium hover:bg-yellow-700">🎲 Grabbelen</button>
            </div>
        </div>
    `;

    ideeDiv.querySelector('#grabbel-btn').addEventListener('click', () => renderIdeeVanDeDag(appData));
}

// 5. Zachte Buddy-Lijn
function renderZachteBuddyLijn(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    let buddyDiv = document.getElementById('zachte-buddy-wrapper');
    if (!buddyDiv) {
        buddyDiv = document.createElement('div');
        buddyDiv.id = 'zachte-buddy-wrapper';
        buddyDiv.className = 'bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6';
        container.appendChild(buddyDiv);
    }

    buddyDiv.innerHTML = `
        <h2 class="text-lg font-bold text-indigo-950 mb-1">💬 Zachte Buddy-Lijn</h2>
        <p class="text-sm text-gray-500 mb-3">Lichte signalen om eerlijk te zijn zonder zwaarte.</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            <a href="https://wa.me/?text=Hoi,%20het%20is%20even%20wat%20druk%20in%20mijn%20hoofd,%20ik%20neem%20rust." target="_blank" class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">💚 Even vol hoofd</a>
            <a href="https://wa.me/?text=Hoi,%20ik%20neem%20vandaag%20even%20mijn%20tijd%20voor%20een%20zachte%20start." target="_blank" class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">☕ Zachte start</a>
            <a href="https://wa.me/?text=Hoi,%20lukt%20het%20om%20even%20kort%20te%20schakelen?" target="_blank" class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">📞 Kort schakelen</a>
            <a href="https://wa.me/?text=Alles%20oké%20hier,%20ik%20rust%20even%20uit." target="_blank" class="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-800 text-center hover:bg-emerald-100 transition">🛋️ Even rust</a>
        </div>
    `;
}
