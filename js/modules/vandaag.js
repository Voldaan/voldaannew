// js/modules/vandaag.js
import { saveAppData, checkDateFilter, voegTrotsKnikkerToe, showToast } from './storage.js';

const CATEGORIES = ['Algemeen', 'Taken', 'Doelen', 'Gezondheid', 'Geld & Aflossingen', 'Contacten', 'Dagstart'];
const DEFAULT_BUDDY_BUTTONS = [
    { id: 1, label: '💚 Vol hoofd', text: 'Hoi, het is even wat druk in mijn hoofd.' },
    { id: 2, label: '☕ Zachte start', text: 'Hoi, ik neem vandaag een zachte start.' },
    { id: 3, label: '📞 Kort schakelen', text: 'Hoi, lukt het om even kort te schakelen?' },
    { id: 4, label: '🛋️ Even rust', text: 'Alles oké, ik rust even uit.' }
];

const MOOD_TYPES = [
    { label: 'Wazig / Moe', icon: '🌫️' },
    { label: 'Rustig / Okay', icon: '🪨' },
    { label: 'Energiek', icon: '⚡' },
    { label: 'Chaotisch', icon: '🌀' },
    { label: 'Hyperfocus', icon: '🎯' },
    { label: 'Kan beter', icon: '🌧️' }
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
            <p class="text-xs text-gray-500 mb-3">Hoe voelt je brein op dit moment?</p>
            
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
                ${MOOD_TYPES.map(m => `
                    <button data-mood="${m.label}" data-icon="${m.icon}" class="mood-btn p-2.5 bg-[#f0f4f8] border border-[#d9e2ec] rounded-xl text-xs font-medium hover:bg-[#e2e8f0] transition flex items-center justify-center gap-1.5 shadow-sm text-center text-indigo-950">
                        <span class="text-sm">${m.icon}</span> <span class="truncate">${m.label}</span>
                    </button>
                `).join('')}
            </div>
            <div id="mood-history-box" class="hidden mt-3 pt-3 border-t border-gray-100 space-y-3 text-xs">
                <div class="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div class="grid grid-cols-2 gap-2">
                        <select id="mood-filter-item" class="px-3 py-2 bg-white border border-gray-200 rounded-xl">
                            <option value="Alle">Alle stemmingen</option>
                            ${MOOD_TYPES.map(m => `<option value="${m.label}">${m.label}</option>`).join('')}
                        </select>
                        <select id="mood-filter-date" class="px-3 py-2 bg-white border border-gray-200 rounded-xl">
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
                    <div id="mood-custom-filter-box" class="hidden pt-1">
                        <input type="date" id="mood-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                        <input type="month" id="mood-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                        <input type="number" id="mood-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                        <input type="week" id="mood-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button id="mood-view-bars" class="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold">Categorie %</button>
                    <button id="mood-view-chart" class="px-2.5 py-1 bg-white border text-gray-700 rounded-lg font-semibold">Tijdlijn met Datums</button>
                </div>
                <div id="mood-chart-container" class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl"></div>
                <div id="mood-history-list" class="space-y-1.5 max-h-40 overflow-y-auto"></div>
            </div>
        </div>

        <!-- 2. Actie-Hub voor Vandaag -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4 space-y-4 text-xs">
            <div class="flex justify-between items-center">
                <h2 class="text-base font-bold text-indigo-950">📋 Actie-Hub voor Vandaag</h2>
                <span class="px-3 py-1 bg-indigo-600 text-white rounded-xl font-semibold shadow-sm">Direct Afvinken</span>
            </div>
            <p class="text-gray-500">Hier verzamelen we de belangrijkste zaken van jouw andere tabbladen. Vink ze hier direct af!</p>
            <div class="p-3.5 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-1">
                <p class="font-bold text-indigo-950">🌙 JOUW AVOND-PACT VOOR VANDAAG:</p>
                <div id="actie-hub-pact-container" class="text-gray-700 font-medium">Nog geen Avond-pact gezet. Maak er een aan op de Plannen-tab!</div>
            </div>
            <div class="space-y-2">
                <div class="flex justify-between items-center">
                    <p class="font-bold text-indigo-950">🎯 FOCUS-TAKEN (NIEUWSTE EERST):</p>
                    <a href="#plannen" onclick="window.switchTab && window.switchTab('plannen')" class="px-2.5 py-1 bg-white border rounded-lg text-indigo-700 font-semibold hover:bg-gray-50">Beheer op Plannen-tab →</a>
                </div>
                <div id="actie-hub-tasks-list" class="space-y-2"></div>
            </div>
            <div class="space-y-2 pt-2 border-t border-gray-100">
                <div class="flex justify-between items-center">
                    <p class="font-bold text-indigo-950">🧭 DOELEN CHECK-IN:</p>
                    <a href="#plannen" onclick="window.switchTab && window.switchTab('plannen')" class="px-2.5 py-1 bg-white border rounded-lg text-indigo-700 font-semibold hover:bg-gray-50">Beheer op Plannen-tab →</a>
                </div>
                <div id="actie-hub-goals-list" class="space-y-2"></div>
            </div>
        </div>

        <!-- 3. Idee van de Dag -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-950">💡 Idee van de Dag</h2>
                <button id="grabbel-idea-btn" class="px-2.5 py-1 bg-amber-100 text-amber-900 rounded-lg text-xs font-semibold hover:bg-amber-200 transition">🎲 Grabbelen</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Een willekeurige vonk uit je kluis.</p>
            <div id="idea-of-day-card" class="p-3 bg-yellow-50/70 border border-yellow-200 rounded-xl space-y-2">
                <p id="idea-day-text" class="text-xs text-gray-800 leading-relaxed font-medium"></p>
                <div class="flex gap-2 pt-1">
                    <button id="idea-to-plan-btn" class="flex-1 py-1.5 bg-white border border-yellow-300 text-yellow-900 rounded-lg text-xs font-medium hover:bg-yellow-100 transition text-center">Naar Planbord</button>
                    <button id="idea-to-project-btn" class="flex-1 py-1.5 bg-yellow-600 text-white rounded-lg text-xs font-medium hover:bg-yellow-700 transition text-center">Naar Project</button>
                </div>
            </div>
        </div>

        <!-- 4. De Trots-Kluis (Nu verplaatst naar onder Idee van de Dag) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex justify-between items-center mb-2">
                <h2 class="text-base font-bold text-indigo-900">🏺 De Trots-Kluis</h2>
                <div class="flex items-center gap-3">
                    <span id="marble-count-badge" class="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-bold">0 Knikkers</span>
                    <button id="toggle-marble-history" class="text-xs text-indigo-600 hover:underline font-medium text-right leading-tight">
                        Historie<br><span class="text-[10px] text-gray-500">& Trends</span>
                    </button>
                </div>
            </div>
            <p class="text-xs text-gray-500 mb-3">Elke overwinning valt als een echte knikker in jouw glazen pot.</p>
            
            <div id="physics-pot-container" class="relative w-full h-48 bg-gradient-to-b from-indigo-50/90 to-indigo-100/70 border-2 border-indigo-200/80 rounded-2xl mb-3 overflow-hidden shadow-inner flex items-center justify-center">
                <canvas id="marble-canvas" class="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"></canvas>
                <div class="absolute bottom-2 text-[10px] text-indigo-900 font-semibold bg-white/80 px-2.5 py-0.5 rounded-full shadow-sm pointer-events-none">💡 Sleep met je muis/vinger aan de knikkers!</div>
            </div>
            <div id="marble-history-box" class="hidden mt-3 pt-3 border-t border-gray-100 space-y-3 text-xs">
                <div class="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border border-gray-100">
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
                    <div id="marble-custom-filter-box" class="hidden pt-1">
                        <input type="date" id="marble-custom-date" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                        <input type="month" id="marble-custom-month" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                        <input type="number" id="marble-custom-year" placeholder="Bijv. 2026" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                        <input type="week" id="marble-custom-week" class="w-full px-3 py-2 bg-white border rounded-xl hidden">
                    </div>
                </div>
                <div class="flex justify-end gap-2">
                    <button id="marble-view-bars" class="px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold">Categorie %</button>
                    <button id="marble-view-chart" class="px-2.5 py-1 bg-white border text-gray-700 rounded-lg font-semibold">Tijdlijn met Datums</button>
                </div>
                <div id="marble-chart-container" class="space-y-1.5 bg-indigo-50/50 p-3 rounded-xl"></div>
                <div id="marble-list" class="space-y-1.5 max-h-40 overflow-y-auto"></div>
            </div>
        </div>

        <!-- 5. Zachte Buddy-Lijn -->
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
    initPhysicsMarblePot(appData);
}

function initPhysicsMarblePot(appData) {
    const canvas = document.getElementById('marble-canvas');
    if (!canvas || typeof Matter === 'undefined') return;

    const container = canvas.parentElement;
    const width = container.clientWidth || 320;
    const height = 192;

    canvas.width = width;
    canvas.height = height;

    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint } = Matter;
    const engine = Engine.create();

    const render = Render.create({
        canvas: canvas,
        engine: engine,
        options: {
            width: width,
            height: height,
            wireframes: false,
            background: 'transparent'
        }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    const wallOptions = { isStatic: true, render: { visible: false } };
    const ground = Bodies.rectangle(width / 2, height + 10, width, 40, wallOptions);
    const leftWall = Bodies.rectangle(-10, height / 2, 40, height * 2, wallOptions);
    const rightWall = Bodies.rectangle(width + 10, height / 2, 40, height * 2, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    const marbles = appData.marbles || [];
    const colorMap = {
        'Taken': '#6366f1',
        'Gezondheid': '#10b981',
        'Doelen': '#f59e0b',
        'Geld & Aflossingen': '#8b5cf6',
        'Dagstart': '#ec4899',
        'Contacten': '#14b8a6',
        'Algemeen': '#3b82f6'
    };

    marbles.forEach((m, idx) => {
        const cat = m.category || 'Algemeen';
        const color = colorMap[cat] || '#6366f1';
        const x = width / 2 + (Math.random() * 80 - 40);
        const y = -20 - (idx * 10);

        const circle = Bodies.circle(x, y, 12, {
            restitution: 0.5,
            friction: 0.05,
            render: {
                fillStyle: color,
                strokeStyle: '#ffffff',
                lineWidth: 2
            }
        });
        Composite.add(engine.world, circle);
    });

    const mouse = Mouse.create(canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: {
            stiffness: 0.2,
            render: { visible: false }
        }
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;
}

function initVandaagModals(appData) {
    if (document.getElementById('buddy-beheer-modal')) return;

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

let currentMoodViewMode = 'bars';
let currentMarbleViewMode = 'bars';

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

    const toggleMarbleHistoryBtn = document.getElementById('toggle-marble-history');
    const marbleHistoryBox = document.getElementById('marble-history-box');
    toggleMarbleHistoryBtn.addEventListener('click', () => {
        marbleHistoryBox.classList.toggle('hidden');
        if (!marbleHistoryBox.classList.contains('hidden')) renderTrotsKluis(appData);
    });

    document.getElementById('mood-filter-item').addEventListener('change', () => renderMoodHistory(appData));
    setupDateFilterListeners('mood', () => renderMoodHistory(appData));

    document.getElementById('mood-view-bars').addEventListener('click', () => {
        currentMoodViewMode = 'bars';
        document.getElementById('mood-view-bars').className = 'px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold';
        document.getElementById('mood-view-chart').className = 'px-2.5 py-1 bg-white border text-gray-700 rounded-lg font-semibold';
        renderMoodHistory(appData);
    });

    document.getElementById('mood-view-chart').addEventListener('click', () => {
        currentMoodViewMode = 'chart';
        document.getElementById('mood-view-chart').className = 'px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold';
        document.getElementById('mood-view-bars').className = 'px-2.5 py-1 bg-white border text-gray-700 rounded-lg font-semibold';
        renderMoodHistory(appData);
    });

    // Categorie en datum filter voor De Trots-Kluis
    document.getElementById('marble-cat-filter').addEventListener('change', () => renderTrotsKluis(appData));
    setupDateFilterListeners('marble', () => renderTrotsKluis(appData));

    document.getElementById('marble-view-bars').addEventListener('click', () => {
        currentMarbleViewMode = 'bars';
        document.getElementById('marble-view-bars').className = 'px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold';
        document.getElementById('marble-view-chart').className = 'px-2.5 py-1 bg-white border text-gray-700 rounded-lg font-semibold';
        renderTrotsKluis(appData);
    });

    document.getElementById('marble-view-chart').addEventListener('click', () => {
        currentMarbleViewMode = 'chart';
        document.getElementById('marble-view-chart').className = 'px-2.5 py-1 bg-indigo-600 text-white rounded-lg font-semibold';
        document.getElementById('marble-view-bars').className = 'px-2.5 py-1 bg-white border text-gray-700 rounded-lg font-semibold';
        renderTrotsKluis(appData);
    });

    renderTrotsKluis(appData);
    renderActieHub(appData);
    renderIdeeVanDeDag(appData);
    renderBuddyButtons(appData);
}

function setupDateFilterListeners(prefix, callback) {
    const dateFilterSelect = document.getElementById(`${prefix}-filter-date`);
    const customBox = document.getElementById(`${prefix}-custom-filter-box`);
    const dateInput = document.getElementById(`${prefix}-custom-date`);
    const monthInput = document.getElementById(`${prefix}-custom-month`);
    const yearInput = document.getElementById(`${prefix}-custom-year`);
    const weekInput = document.getElementById(`${prefix}-custom-week`);

    if (!dateFilterSelect) return;

    dateFilterSelect.addEventListener('change', () => {
        // Verberg alle specifieke invoervelden eerst
        if (customBox) customBox.classList.add('hidden');
        if (dateInput) { dateInput.classList.add('hidden'); dateInput.value = ''; }
        if (monthInput) { monthInput.classList.add('hidden'); monthInput.value = ''; }
        if (yearInput) { yearInput.classList.add('hidden'); yearInput.value = ''; }
        if (weekInput) { weekInput.classList.add('hidden'); weekInput.value = ''; }

        const val = dateFilterSelect.value;
        
        // Als er een specifieke optie wordt gekozen, klap het hoofdboxje en het juiste invoerveld open
        if (val.startsWith('specific-')) {
            if (customBox) customBox.classList.remove('hidden');
            if (val === 'specific-day' && dateInput) dateInput.classList.remove('hidden');
            if (val === 'specific-month' && monthInput) monthInput.classList.remove('hidden');
            if (val === 'specific-year' && yearInput) yearInput.classList.remove('hidden');
            if (val === 'specific-week' && weekInput) weekInput.classList.remove('hidden');
        }
        callback();
    });

    // Luister naar wijzigingen in de ingevulde specifieke datums/maanden/jaren/weken
    [dateInput, monthInput, yearInput, weekInput].forEach(inp => {
        if (inp) {
            inp.addEventListener('change', callback);
            inp.addEventListener('input', callback);
        }
    });
}

function renderTrotsKluis(appData) {
    const listEl = document.getElementById('marble-list');
    const countBadge = document.getElementById('marble-count-badge');
    const containerEl = document.getElementById('marble-chart-container');
    
    const catFilter = document.getElementById('marble-cat-filter').value;
    const dateFilter = document.getElementById('marble-date-filter').value;

    const dateInput = document.getElementById('marble-custom-date');
    const monthInput = document.getElementById('marble-custom-month');
    const yearInput = document.getElementById('marble-custom-year');
    const weekInput = document.getElementById('marble-custom-week');

    let customVal = null;
    if (dateFilter === 'specific-day' && dateInput) customVal = dateInput.value;
    else if (dateFilter === 'specific-month' && monthInput) customVal = monthInput.value;
    else if (dateFilter === 'specific-year' && yearInput) customVal = yearInput.value;
    else if (dateFilter === 'specific-week' && weekInput) customVal = weekInput.value;

    const marbles = appData.marbles || [];
    countBadge.textContent = `${marbles.length} Knikkers`;

    initPhysicsMarblePot(appData);

    const filtered = marbles.filter(m => {
        const matchCat = catFilter === 'Alle' || (m.category || 'Algemeen') === catFilter;
        const matchDate = checkDateFilter(m.date, dateFilter, customVal);
        return matchCat && matchDate;
    });

    listEl.innerHTML = filtered.length === 0 ? `<p class="text-xs text-gray-400 italic">Geen knikkers gevonden in deze selectie.</p>` : filtered.slice(-6).reverse().map(m => `
        <div class="flex justify-between items-center p-2.5 bg-gray-50 border rounded-xl text-xs">
            <div>
                <span class="font-bold text-indigo-900 px-1.5 py-0.5 bg-indigo-100/70 rounded-md mr-1">[${m.category || 'Algemeen'}]</span> 
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

    if (currentMarbleViewMode === 'bars') {
        const counts = {};
        filtered.forEach(m => {
            const cat = m.category || 'Algemeen';
            counts[cat] = (counts[cat] || 0) + 1;
        });
        const total = filtered.length;

        containerEl.innerHTML = total === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen trenddata in deze selectie.</p>' : Object.entries(counts).map(([cat, count]) => {
            const pct = Math.round((count / total) * 100);
            return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${cat}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
        }).join('');
    } else {
        const dateGroups = {};
        filtered.forEach(m => {
            const dateStr = new Date(m.date || Date.now()).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            dateGroups[dateStr] = (dateGroups[dateStr] || 0) + 1;
        });

        const entries = Object.entries(dateGroups);
        containerEl.innerHTML = entries.length === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen data voor tijdlijn.</p>' : `
            <p class="text-[11px] font-bold text-indigo-900 mb-2">Activiteits-tijdlijn (Aantal overwinningen per datum):</p>
            <div class="space-y-1.5 max-h-36 overflow-y-auto">
                ${entries.map(([date, count]) => `
                    <div class="flex justify-between items-center bg-white p-2 rounded-lg border text-xs">
                        <span class="font-semibold text-gray-700">📅 ${date}</span>
                        <span class="px-2 py-0.5 bg-indigo-100 text-indigo-800 font-bold rounded-md">+${count} knikker${count > 1 ? 's' : ''}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function renderMoodHistory(appData) {
    const listEl = document.getElementById('mood-history-list');
    const containerEl = document.getElementById('mood-chart-container');
    const itemFilter = document.getElementById('mood-filter-item').value;
    const dateFilter = document.getElementById('mood-filter-date').value;

    const dateInput = document.getElementById('mood-custom-date');
    const monthInput = document.getElementById('mood-custom-month');
    const yearInput = document.getElementById('mood-custom-year');
    const weekInput = document.getElementById('mood-custom-week');

    let customVal = null;
    if (dateFilter === 'specific-day' && dateInput) customVal = dateInput.value;
    else if (dateFilter === 'specific-month' && monthInput) customVal = monthInput.value;
    else if (dateFilter === 'specific-year' && yearInput) customVal = yearInput.value;
    else if (dateFilter === 'specific-week' && weekInput) customVal = weekInput.value;

    const allMoods = appData.moods || [];
    const filteredMoods = allMoods.filter(m => {
        const matchItem = itemFilter === 'Alle' || m.mood === itemFilter;
        const matchDate = checkDateFilter(m.date, dateFilter, customVal);
        return matchItem && matchDate;
    });

    listEl.innerHTML = filteredMoods.length === 0 ? `<p class="italic text-gray-400">Geen check-ins gevonden.</p>` : filteredMoods.slice(-6).reverse().map(m => `
        <div class="flex justify-between items-center py-1 border-b">
            <span class="font-medium text-gray-800">${m.icon || '✨'} ${m.mood} <span class="text-[10px] text-gray-400">(${new Date(m.date).toLocaleDateString('nl-NL')})</span></span>
            <button onclick="window.deleteMood(${m.id})" class="text-gray-300 hover:text-red-500">✕</button>
        </div>
    `).join('');

    window.deleteMood = (id) => {
        appData.moods = appData.moods.filter(x => x.id !== id);
        saveAppData(appData);
        renderMoodHistory(appData);
    };

    if (currentMoodViewMode === 'bars') {
        const counts = {};
        filteredMoods.forEach(m => counts[m.mood] = (counts[m.mood] || 0) + 1);
        const total = filteredMoods.length;

        containerEl.innerHTML = total === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen trenddata in deze selectie.</p>' : Object.entries(counts).map(([mood, count]) => {
            const pct = Math.round((count / total) * 100);
            return `<div><div class="flex justify-between text-[11px] font-semibold text-indigo-900 mb-0.5"><span>${mood}</span><span>${count}x (${pct}%)</span></div><div class="w-full bg-indigo-200/50 rounded-full h-2"><div class="bg-indigo-600 h-2 rounded-full" style="width: ${pct}%"></div></div></div>`;
        }).join('');
    } else {
        const dateGroups = {};
        filteredMoods.forEach(m => {
            const dateStr = new Date(m.date || Date.now()).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
            if (!dateGroups[dateStr]) dateGroups[dateStr] = [];
            dateGroups[dateStr].push(`${m.icon || ''} ${m.mood}`);
        });

        const entries = Object.entries(dateGroups);
        containerEl.innerHTML = entries.length === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen data voor tijdlijn.</p>' : `
            <p class="text-[11px] font-bold text-indigo-900 mb-2">Tijdlijn van stemmingen per datum:</p>
            <div class="space-y-1.5 max-h-36 overflow-y-auto">
                ${entries.map(([date, moods]) => `
                    <div class="flex justify-between items-center bg-white p-2 rounded-lg border text-xs">
                        <span class="font-semibold text-gray-700 whitespace-nowrap">📅 ${date}</span>
                        <span class="text-indigo-900 font-medium text-right truncate ml-2">${moods.join(', ')}</span>
                    </div>
                `).join('')}
            </div>
        `;
    }
}

function renderActieHub(appData) {
    const pactContainer = document.getElementById('actie-hub-pact-container');
    const tasksListEl = document.getElementById('actie-hub-tasks-list');
    const goalsListEl = document.getElementById('actie-hub-goals-list');

    const activePacts = appData.plans?.eveningPacts || [];
    if (activePacts.length > 0) {
        pactContainer.innerHTML = activePacts[activePacts.length - 1].text;
    } else {
        pactContainer.innerHTML = 'Nog geen Avond-pact gezet. Maak er een aan op de Plannen-tab!';
    }

    const allTasks = [...(appData.tasks || []), ...(appData.plans?.tasks || [])];
    const openTasks = allTasks.filter(t => !t.archived && !t.done && !t.completed).slice(0, 5);
    
    tasksListEl.innerHTML = openTasks.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen openstaande taken gevonden.</p>' : openTasks.map(t => `
        <div class="flex justify-between items-center p-3 bg-white border rounded-xl text-xs shadow-sm">
            <div class="flex items-center gap-2">
                <input type="checkbox" disabled class="w-4 h-4 rounded text-indigo-600">
                <div><span class="font-bold text-indigo-900 mr-1">[${t.category || 'Algemeen'}]</span> <span class="text-gray-900 text-sm font-medium">${t.text}</span></div>
            </div>
            <button onclick="window.quickCompleteTask(${t.id})" class="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm flex items-center gap-1">
                <span>✓</span> Afvinken
            </button>
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
            showToast("Taak afgevinkt! ✨");
        }
    };

    const goals = appData.plans?.goals || [];
    goalsListEl.innerHTML = goals.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen doelen ingesteld.</p>' : goals.slice(0, 3).map(g => `
        <div class="flex justify-between items-center p-3 bg-white border rounded-xl text-xs shadow-sm">
            <div>
                <span class="font-bold text-indigo-950 text-sm">🎯 ${g.title}</span>
                <span class="text-[10px] text-gray-500 block">Schild: ${g.shield || 'Geen'}</span>
            </div>
            <div class="flex gap-1.5 items-center">
                <button onclick="window.quickGoalStatus(${g.id}, 'volledig')" class="p-1.5 bg-emerald-600 text-white rounded-lg shadow-sm" title="Volledig">✓</button>
                <button onclick="window.quickGoalStatus(${g.id}, 'schild')" class="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm" title="Schild">🛡️</button>
            </div>
        </div>
    `).join('');

    window.quickGoalStatus = (id, status) => {
        const g = goals.find(x => x.id === id);
        if (g) {
            g.status = status;
            if (status === 'volledig') voegTrotsKnikkerToe(appData, `Doel volbracht: ${g.title}`, 'Doelen');
            saveAppData(appData);
            renderActieHub(appData);
            showToast("Doel-status bijgewerkt! 🎯");
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
        if (!appData.plans) appData.plans = { tasks: [] };
        if (!appData.plans.tasks) appData.plans.tasks = [];
        appData.plans.tasks.push({ id: Date.now(), text: `Idee: ${randomIdea.text}`, category: randomIdea.category || 'Algemeen', completed: false, archived: false, date: new Date().toISOString() });
        saveAppData(appData);
        showToast("Idee overgebracht naar het Planbord! 🎯");
    };

    document.getElementById('idea-to-project-btn').onclick = () => {
        if (!appData.ideasModule) appData.ideasModule = { projects: [] };
        if (!appData.ideasModule.projects) appData.ideasModule.projects = [];
        appData.ideasModule.projects.push({ id: Date.now(), title: randomIdea.text.slice(0, 40), description: randomIdea.text, timeGoal: 'Binnenkort', subtasks: [], date: new Date().toISOString() });
        saveAppData(appData);
        showToast("Idee omgezet naar een Project! 🚀");
    };
}
