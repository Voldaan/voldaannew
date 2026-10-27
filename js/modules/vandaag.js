// js/modules/vandaag.js
import { saveAppData, checkDateFilter } from './storage.js';

const CATEGORIES = ['Algemeen', 'Taken', 'Doelen', 'Gezondheid', 'Geld & Aflossingen', 'Contacten', 'Dagstart'];

export function initVandaagModule(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    let moodDiv = document.getElementById('mood-section-wrapper');
    if (!moodDiv) {
        moodDiv = document.createElement('div');
        moodDiv.id = 'mood-section-wrapper';
        moodDiv.className = 'bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4';
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
            <h2 class="text-base font-bold text-indigo-900">✨ Mijn Dag Begint Nu</h2>
            <button id="toggle-mood-history" class="text-xs text-indigo-600 hover:underline font-medium">Historie</button>
        </div>
        <p class="text-xs text-gray-500 mb-3">Waar staat je brein op dit moment naar?</p>
        <div class="grid grid-cols-2 gap-2 mb-3">
            ${moods.map(m => `
                <button data-mood="${m.label}" class="mood-btn p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium hover:bg-indigo-50 transition flex items-center justify-center gap-1.5">
                    <span>${m.icon}</span> ${m.label}
                </button>
            `).join('')}
        </div>
        <div id="mood-history-box" class="hidden mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
            <p class="font-bold text-indigo-900 mb-1">Jouw Mood Verloop:</p>
            <div id="mood-history-list" class="space-y-1"></div>
        </div>
    `;

    moodDiv.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mood = btn.getAttribute('data-mood');
            if (!appData.moods) appData.moods = [];
            appData.moods.push({ id: Date.now(), mood, date: new Date().toISOString() });
            saveAppData(appData);
            alert(`Mood geregistreerd: ${mood} 🪷`);
            updateMoodHistory(appData);
        });
    });

    moodDiv.querySelector('#toggle-mood-history').addEventListener('click', () => {
        const box = moodDiv.querySelector('#mood-history-box');
        box.classList.toggle('hidden');
        if (!box.classList.contains('hidden')) updateMoodHistory(appData);
    });

    renderTrotsKluis(appData);
    renderActieHub(appData);
    renderIdeeVanDeDag(appData);
    renderZachteBuddyLijn(appData);
}

function updateMoodHistory(appData) {
    const list = document.getElementById('mood-history-list');
    if (!list) return;
    const moods = appData.moods || [];
    list.innerHTML = moods.length === 0 ? `<p class="italic text-gray-400">Nog geen check-ins.</p>` : moods.slice(-5).reverse().map(m => `
        <div class="flex justify-between py-1 border-b border-gray-50">
            <span class="font-medium text-gray-800">${m.mood}</span>
            <span class="text-gray-400">${new Date(m.date).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' })}</span>
        </div>
    `).join('');
}

function renderTrotsKluis(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    let kluisDiv = document.getElementById('trots-kluis-wrapper');
    if (!kluisDiv) {
        kluisDiv = document.createElement('div');
        kluisDiv.id = 'trots-kluis-wrapper';
        kluisDiv.className = 'bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4';
        container.appendChild(kluisDiv);
    }

    const marbles = appData.marbles || [];
    
    kluisDiv.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <h2 class="text-base font-bold text-indigo-900">🏺 De Trots-Kluis</h2>
            <span class="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-bold">${marbles.length} Knikkers</span>
        </div>
        <p class="text-xs text-gray-500 mb-3">Elke kleine overwinning vult jouw virtuele pot.</p>
        
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
                </select>
            </div>
            <button id="add-marble-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">
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
        const filtered = marbles.filter(m => (selectedCat === 'Alle' || m.category === selectedCat) && checkDateFilter(m.date, selectedDate));
        
        listEl.innerHTML = filtered.length === 0 ? `<p class="text-xs text-gray-400 italic">Geen knikkers gevonden.</p>` : filtered.slice(-5).reverse().map(m => `
            <div class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs">
                <div><span class="font-semibold text-indigo-900">[${m.category}]</span> <span class="text-gray-700">${m.text}</span></div>
                <span class="text-gray-400 text-[10px]">${new Date(m.date).toLocaleDateString('nl-NL')}</span>
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
            marbles.push({ id: Date.now(), text, category: CATEGORIES.includes(cat) ? cat : 'Algemeen', date: new Date().toISOString() });
            saveAppData(appData);
            renderTrotsKluis(appData);
        }
    });
}

function renderActieHub(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;
    let hubDiv = document.getElementById('actie-hub-wrapper');
    if (!hubDiv) {
        hubDiv = document.createElement('div');
        hubDiv.id = 'actie-hub-wrapper';
        hubDiv.className = 'bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4';
        container.appendChild(hubDiv);
    }
    const tasks = (appData.tasks || []).filter(t => !t.archived && !t.completed).slice(0, 5);
    hubDiv.innerHTML = `
        <h2 class="text-base font-bold text-indigo-950 mb-1">🎯 Actie-Hub voor Vandaag</h2>
        <p class="text-xs text-gray-500 mb-3">Jouw compacte overzicht van openstaande focus-taken.</p>
        <div class="space-y-2">
            ${tasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande focus-taken.</p>' : tasks.map(t => `
                <div class="flex justify-between items-center p-2.5 bg-white border border-gray-100 rounded-xl text-xs">
                    <span class="text-gray-800">${t.text}</span>
                    <button data-task-id="${t.id}" class="quick-complete-task px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg font-semibold">Klaar ✨</button>
                </div>
            `).join('')}
        </div>
    `;
    hubDiv.querySelectorAll('.quick-complete-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = Number(btn.getAttribute('data-task-id'));
            const task = appData.tasks.find(t => t.id === id);
            if (task) { task.completed = true; saveAppData(appData); renderActieHub(appData); }
        });
    });
}

function renderIdeeVanDeDag(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;
    let ideeDiv = document.getElementById('idee-dag-wrapper');
    if (!ideeDiv) {
        ideeDiv = document.createElement('div');
        ideeDiv.id = 'idee-dag-wrapper';
        ideeDiv.className = 'bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4';
        container.appendChild(ideeDiv);
    }
    const ideas = (appData.ideas || []).filter(i => !i.archived);
    const randomIdea = ideas.length > 0 ? ideas[Math.floor(Math.random() * ideas.length)] : null;
    ideeDiv.innerHTML = `
        <h2 class="text-base font-bold text-indigo-950 mb-1">💡 Idee van de Dag</h2>
        <p class="text-xs text-gray-500 mb-3">Een willekeurige vonk uit je kluis.</p>
        <div class="p-3.5 bg-yellow-50/70 border border-yellow-200 rounded-xl">
            <p class="text-xs text-gray-800 mb-3">${randomIdea ? randomIdea.text : 'Nog geen ideeën in de kluis.'}</p>
            <button id="grabbel-btn" class="w-full py-2 bg-yellow-600 text-white rounded-xl text-xs font-medium">🎲 Grabbelen</button>
        </div>
    `;
    ideeDiv.querySelector('#grabbel-btn').addEventListener('click', () => renderIdeeVanDeDag(appData));
}

function renderZachteBuddyLijn(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;
    let buddyDiv = document.getElementById('zachte-buddy-wrapper');
    if (!buddyDiv) {
        buddyDiv = document.createElement('div');
        buddyDiv.id = 'zachte-buddy-wrapper';
        buddyDiv.className = 'bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4';
        container.appendChild(buddyDiv);
    }
    buddyDiv.innerHTML = `
        <h2 class="text-base font-bold text-indigo-950 mb-1">💬 Zachte Buddy-Lijn</h2>
        <p class="text-xs text-gray-500 mb-3">Lichte signalen om eerlijk te zijn.</p>
        <div class="grid grid-cols-2 gap-2">
            <a href="https://wa.me/?text=Hoi,%20het%20is%20even%20wat%20druk%20in%20mijn%20hoofd." target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center">💚 Vol hoofd</a>
            <a href="https://wa.me/?text=Hoi,%20ik%20neem%20vandaag%20een%20zachte%20start." target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center">☕ Zachte start</a>
            <a href="https://wa.me/?text=Hoi,%20lukt%20het%20om%20even%20kort%20te%20schakelen?" target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center">📞 Kort schakelen</a>
            <a href="https://wa.me/?text=Alles%20oké,%20ik%20rust%20even%20uit." target="_blank" class="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] font-semibold text-emerald-800 text-center">🛋️ Even rust</a>
        </div>
    `;
}
