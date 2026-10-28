// js/modules/vandaag.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

const DEFAULT_BUDDY_BUTTONS = [
    { id: 1, label: '🌱 Even op adem komen', message: 'Hé lieve vriend, neem even een diepe buikademhaling. Wat er ook speelt, je hoeft het niet nu meteen op te lossen. Je mag er gewoon even zijn.' },
    { id: 2, label: '☕ Rustig aan, je doet het goed', message: 'Pauze! Pak een kop thee, schouders los en laat de controle even vallen. Je inzet tot nu toe is meer dan genoeg geweest.' },
    { id: 3, label: '🛡️ Geen oordeel, alleen liefde', message: 'Het is volkomen oké als het vandaag even anders liep. Zachtheid naar jezelf is de sleutel. Morgen is er weer een schone lei.' }
];

export function initVandaagModule(appData) {
    const container = document.getElementById('vandaag');
    if (!container) return;

    if (!appData.buddySettings) {
        appData.buddySettings = { buttons: [...DEFAULT_BUDDY_BUTTONS] };
    }

    container.innerHTML = `
        <!-- 1. Dagstart / Mood Check-in -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">✨ Mijn Dag Begint Nu</h2>
                <button id="open-mood-historie" class="text-[11px] text-indigo-600 hover:underline font-medium">Historie & Trends</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Waar staat je brein op dit moment naar?</p>
            
            <div class="grid grid-cols-2 gap-2">
                <button onclick="window.logMood('Wazig / Moe', '🌫️')" class="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition flex items-center gap-2">
                    <span class="text-base">🌫️</span>
                    <div><p class="font-bold text-xs text-indigo-950">Wazig / Moe</p><p class="text-[10px] text-gray-500">Rustig aan doen</p></div>
                </button>
                <button onclick="window.logMood('Chaotisch / Vol', '⚡')" class="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition flex items-center gap-2">
                    <span class="text-base">⚡</span>
                    <div><p class="font-bold text-xs text-indigo-950">Chaotisch / Vol</p><p class="text-[10px] text-gray-500">Structureren</p></div>
                </button>
                <button onclick="window.logMood('Rustig / Oké', '🪨')" class="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition flex items-center gap-2">
                    <span class="text-base">🪨</span>
                    <div><p class="font-bold text-xs text-indigo-950">Rustig / Oké</p><p class="text-[10px] text-gray-500">Stabiele basis</p></div>
                </button>
                <button onclick="window.logMood('Gefocust', '🚀')" class="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-left transition flex items-center gap-2">
                    <span class="text-base">🚀</span>
                    <div><p class="font-bold text-xs text-indigo-950">Gefocust</p><p class="text-[10px] text-gray-500">Lekker knallen</p></div>
                </button>
            </div>
        </div>

        <!-- 2. De Trots-Kluis -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">🏺 De Trots-Kluis</h2>
                <span id="marble-count-badge" class="px-2.5 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-[11px] font-bold">0 Knikkers</span>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Elke kleine overwinning vult jouw virtuele glazen pot.</p>
            
            <div class="bg-gradient-to-br from-amber-50/50 to-indigo-50/40 border border-indigo-100 p-4 rounded-2xl text-center space-y-2">
                <p class="text-xs font-bold text-indigo-950">🏺 ✨ Jouw Gevulde Knikkerpot</p>
                <div id="marbles-visual-grid" class="flex flex-wrap gap-1.5 justify-center max-h-32 overflow-y-auto p-1"></div>
            </div>
        </div>

        <!-- 3. De Buddy-lijn -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">💬 De Buddy-lijn</h2>
                <button id="open-buddy-beheer" class="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[10px] font-semibold hover:bg-indigo-100 transition">Beheer ⚙️</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Direct een warm, ondersteunend duwtje in de rug.</p>
            
            <div id="buddy-buttons-container" class="flex flex-col gap-2"></div>
        </div>

        <!-- 4. Actie-Hub voor Vandaag -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h2 class="text-sm font-bold text-indigo-900 mb-1">🎯 Actie-Hub voor Vandaag</h2>
            <p class="text-[11px] text-gray-500 mb-2.5">Jouw compacte overzicht van openstaande focus-taken.</p>
            <ul id="vandaag-task-list" class="space-y-2"></ul>
        </div>
    `;

    initVandaagModals(appData);
    initVandaagLogic(appData);
}

function initVandaagModals(appData) {
    const historyModalHTML = `
        <div id="mood-history-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">📊 Historie & Trends Check-ins</h3>
                    <button id="close-mood-history" class="text-gray-400 hover:text-gray-600 text-base">✕</button>
                </div>
                <div id="mood-history-list" class="space-y-2 text-xs"></div>
            </div>
        </div>
    `;

    const buddyModalHTML = `
        <div id="buddy-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer Buddy-lijn Knoppen</h3>
                    <button id="close-buddy-beheer" class="text-gray-400 hover:text-gray-600 text-base">✕</button>
                </div>
                <div id="buddy-edit-list" class="space-y-3 max-h-64 overflow-y-auto text-xs"></div>
                <button id="save-buddy-settings" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs">Wijzigingen Opslaan ✨</button>
            </div>
        </div>
    `;

    const messageModalHTML = `
        <div id="buddy-message-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-3 border border-indigo-100 text-center">
                <div class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center mx-auto text-lg">💬</div>
                <h3 class="text-sm font-bold text-indigo-950">Jouw Buddy-bericht</h3>
                <p id="buddy-message-text" class="text-xs text-gray-700 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100"></p>
                <button id="close-buddy-message" class="w-full py-2 bg-indigo-600 text-white rounded-xl font-semibold text-xs">Dank je wel ❤️</button>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', historyModalHTML + buddyModalHTML + messageModalHTML);

    const histModal = document.getElementById('mood-history-modal');
    document.getElementById('open-mood-historie').onclick = () => {
        histModal.classList.remove('hidden');
        renderMoodHistoryList(appData);
    };
    document.getElementById('close-mood-history').onclick = () => histModal.classList.add('hidden');

    const buddyModal = document.getElementById('buddy-beheer-modal');
    document.getElementById('open-buddy-beheer').onclick = () => {
        buddyModal.classList.remove('hidden');
        renderBuddyBeheerList(appData);
    };
    document.getElementById('close-buddy-beheer').onclick = () => buddyModal.classList.add('hidden');

    document.getElementById('save-buddy-settings').onclick = () => {
        const items = document.querySelectorAll('.buddy-item-edit');
        appData.buddySettings.buttons = Array.from(items).map((el, index) => ({
            id: index + 1,
            label: el.querySelector('.buddy-label-input').value,
            message: el.querySelector('.buddy-msg-input').value
        }));
        saveAppData(appData);
        buddyModal.classList.add('hidden');
        initVandaagModule(appData);
        showToast("Buddy-lijn instellingen opgeslagen! ✨");
    };

    document.getElementById('close-buddy-message').onclick = () => document.getElementById('buddy-message-modal').classList.add('hidden');
}

function renderMoodHistoryList(appData) {
    const listEl = document.getElementById('mood-history-list');
    const moods = appData.moods || [];
    listEl.innerHTML = moods.length === 0 ? '<p class="text-gray-400 italic">Nog geen check-ins geregistreerd.</p>' : moods.slice(-15).reverse().map(m => `
        <div class="flex justify-between items-center p-2.5 bg-gray-50 border rounded-xl">
            <div class="flex items-center gap-2">
                <span class="text-base">${m.icon || '✨'}</span>
                <div>
                    <p class="font-bold text-indigo-950">${m.mood}</p>
                    <span class="text-[10px] text-gray-400">${new Date(m.date).toLocaleString('nl-NL')}</span>
                </div>
            </div>
            <button onclick="window.deleteMood(${m.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
        </div>
    `).join('');

    window.deleteMood = (id) => {
        appData.moods = appData.moods.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoodHistoryList(appData);
    };
}

function renderBuddyBeheerList(appData) {
    const listEl = document.getElementById('buddy-edit-list');
    const buttons = appData.buddySettings.buttons || DEFAULT_BUDDY_BUTTONS;
    listEl.innerHTML = buttons.map((b, idx) => `
        <div class="buddy-item-edit p-2.5 bg-gray-50 border rounded-xl space-y-1.5">
            <div>
                <label class="block font-semibold text-gray-600 text-[10px]">Knop ${idx + 1} Label</label>
                <input type="text" value="${b.label}" class="buddy-label-input w-full px-2.5 py-1 border rounded-lg bg-white">
            </div>
            <div>
                <label class="block font-semibold text-gray-600 text-[10px]">Volledig Bericht bij Klik</label>
                <textarea rows="2" class="buddy-msg-input w-full px-2.5 py-1 border rounded-lg bg-white">${b.message}</textarea>
            </div>
        </div>
    `).join('');
}

function initVandaagLogic(appData) {
    window.logMood = (moodName, icon) => {
        if (!appData.moods) appData.moods = [];
        appData.moods.push({ id: Date.now(), mood: moodName, icon, date: new Date().toISOString() });
        voegTrotsKnikkerToe(appData, `Dagstart check-in: ${moodName}`, 'Vitaliteit');
        saveAppData(appData);
        showToast(`Check-in opgeslagen: ${moodName} ${icon}`);
    };

    const marbles = appData.marbles || [];
    document.getElementById('marble-count-badge').textContent = `${marbles.length} Knikkers`;
    const marblesGrid = document.getElementById('marbles-visual-grid');
    const marbleColors = ['bg-indigo-500', 'bg-purple-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-teal-500'];
    marblesGrid.innerHTML = marbles.length === 0 ? '<p class="text-[11px] text-gray-400 italic">Nog geen knikkers in je kluis. Voltooi taken of check-ins!</p>' : marbles.map((m, idx) => `
        <div class="w-7 h-7 rounded-full ${marbleColors[idx % marbleColors.length]} text-white flex items-center justify-center text-xs shadow-xs font-bold" title="${m.text}">✨</div>
    `).join('');

    const buddyContainer = document.getElementById('buddy-buttons-container');
    const buttons = appData.buddySettings.buttons || DEFAULT_BUDDY_BUTTONS;
    buddyContainer.innerHTML = buttons.map(b => `
        <button onclick="window.triggerBuddyMessage(${b.id})" class="w-full py-2.5 px-3 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-200 text-indigo-950 rounded-xl text-xs font-semibold text-left transition flex justify-between items-center">
            <span>${b.label}</span>
            <span class="text-indigo-500 text-sm">→</span>
        </button>
    `).join('');

    window.triggerBuddyMessage = (id) => {
        const btn = buttons.find(x => x.id === id);
        if (btn) {
            document.getElementById('buddy-message-text').textContent = btn.message;
            document.getElementById('buddy-message-modal').classList.remove('hidden');
        }
    };

    const taskList = document.getElementById('vandaag-task-list');
    const tasks = (appData.plans?.tasks || []).filter(t => !t.completed && !t.archived);
    taskList.innerHTML = tasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken voor vandaag.</p>' : tasks.slice(0, 5).map(t => `
        <li class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
            <div>
                <span class="font-bold text-indigo-700">[${t.category}]</span> 
                <span class="text-gray-900 font-medium">${t.text}</span>
            </div>
            <button onclick="window.completeVandaagTask(${t.id})" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-semibold text-[11px] hover:bg-emerald-100 transition">Klaar ✨</button>
        </li>
    `).join('');

    window.completeVandaagTask = (id) => {
        const t = appData.plans.tasks.find(x => x.id === id);
        if (t) {
            t.completed = true;
            voegTrotsKnikkerToe(appData, `Taak volbracht: ${t.text}`, t.category || 'Taken');
            saveAppData(appData);
            initVandaagModule(appData);
        }
    };
}
