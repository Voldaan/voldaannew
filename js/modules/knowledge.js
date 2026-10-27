// js/modules/knowledge.js
import { saveAppData } from './storage.js';

const KNOWLEDGE_CATEGORIES = ['Algemeen & ADHD', 'Voetbal', 'Muziek & LP’s', 'Eten & Drinken', 'Gadgets', 'Attenties & Verrassingen'];

const EXPERT_TIPS = [
    { cat: 'Algemeen & ADHD', text: "💡 ADHD-Hack: Verdeel grote taken in mini-stapjes van maximaal 5 minuten. Alles wat groter is voelt als een onoverkoombare berg." },
    { cat: 'Algemeen & ADHD', text: "🧠 Brein-rust: Als je vastloopt in je gedachten, wissel dan direct van taak of zet de 15-minuten snaai-/pauzewachtkamer aan." },
    { cat: 'Voetbal', text: "⚽ Voetbal-pauze: Geniet van het spel, maar koppel nabeschouwingen aan een ontspannen moment met een kop thee in plaats van piekervorming." },
    { cat: 'Muziek & LP’s', text: "🎶 Platen-meditatie: Zet bewust één volledige LP op zonder te skippen. Laat de muziek je anker zijn om even helemaal te ontprikkelen." },
    { cat: 'Eten & Drinken', text: "☕ Zachte start: Begin je ochtend niet meteen met prikkels, maar neem 10 minuten de tijd voor je koffie of thee voordat je de app opent." },
    { cat: 'Attenties & Verrassingen', text: "💚 Kleine attentie: Verras iemand van je naasten vandaag met een handgeschreven briefje of een onverwachte knuffel; dat kost niets en betekent de wereld." }
];

export function initKnowledgeModule(appData) {
    const container = document.getElementById('kennis');
    if (!container) return;

    if (!appData.knowledge) {
        appData.knowledge = { savedTips: [] };
    }

    container.innerHTML = `
        <!-- 1. Live Feed & Expert Tips -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">💡 Kennis, Hacks & Live Feed</h2>
                <select id="knowledge-cat-filter" class="text-xs bg-white border border-gray-200 rounded-lg px-2 py-1">
                    <option value="Alle">Alle Categorieën</option>
                    ${KNOWLEDGE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            <p class="text-xs text-gray-500 mb-3">Live stroom van inzichten afgestemd op ADHD, focus en zachte keuzen.</p>
            
            <div id="tip-card" class="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl mb-3 text-xs text-indigo-950 font-medium leading-relaxed">
                <!-- Wordt dynamisch gevuld -->
            </div>
            
            <div class="flex gap-2 mb-4">
                <button id="next-tip-btn" class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Andere tip ✨</button>
                <button id="save-tip-btn" class="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-800 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition">Bewaren 📌</button>
            </div>

            <!-- Opgeslagen Tips -->
            <div class="pt-3 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-2 uppercase">Jouw Bewaarde Hacks & Tips</h3>
                <ul id="saved-tips-list" class="space-y-1.5 text-xs text-gray-600"></ul>
            </div>
        </div>

        <!-- 2. Gegevensbeheer & Backup -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-base font-bold text-indigo-950 mb-1">💾 Gegevensbeheer & Backup</h2>
            <p class="text-xs text-gray-500 mb-3">Bewaar je opgebouwde progressie veilig op je eigen toestel.</p>
            <div class="flex gap-2">
                <button id="export-json-knowledge-btn" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition">Exporteer Backup (JSON)</button>
                <label class="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold text-center cursor-pointer transition">
                    Importeer Backup <input type="file" id="import-json-knowledge-file" class="hidden" accept=".json">
                </label>
            </div>
        </div>
    `;

    initKnowledgeLogic(appData);
}

// ---------------------------------------------------------
// Kennis & Hacks Logica
// ---------------------------------------------------------

function initKnowledgeLogic(appData) {
    let currentFilteredTips = [...EXPERT_TIPS];
    let tipIndex = 0;

    const tipCard = document.getElementById('tip-card');
    const catFilter = document.getElementById('knowledge-cat-filter');

    function displayCurrentTip() {
        if (currentFilteredTips.length === 0) {
            tipCard.textContent = "Geen tips gevonden voor deze categorie.";
            return;
        }
        if (tipIndex >= currentFilteredTips.length) tipIndex = 0;
        const current = currentFilteredTips[tipIndex];
        tipCard.innerHTML = `<span class="font-bold text-indigo-800">[${current.cat}]</span><br>${current.text}`;
    }

    catFilter.onchange = () => {
        const selected = catFilter.value;
        if (selected === 'Alle') {
            currentFilteredTips = [...EXPERT_TIPS];
        } else {
            currentFilteredTips = EXPERT_TIPS.filter(t => t.cat === selected);
        }
        tipIndex = 0;
        displayCurrentTip();
    };

    document.getElementById('next-tip-btn').onclick = () => {
        tipIndex = (tipIndex + 1) % currentFilteredTips.length;
        displayCurrentTip();
    };

    document.getElementById('save-tip-btn').onclick = () => {
        const activeTip = currentFilteredTips[tipIndex];
        if (activeTip) {
            if (!appData.knowledge.savedTips) appData.knowledge.savedTips = [];
            // Voorkom dubbel opslaan
            if (!appData.knowledge.savedTips.some(t => t.text === activeTip.text)) {
                appData.knowledge.savedTips.push(activeTip);
                saveAppData(appData);
                renderSavedTips(appData);
                showToast("Tip opgeslagen in je persoonlijke kluis! 📌");
            } else {
                showToast("Deze tip stond al in je bewaarde lijst.");
            }
        }
    };

    renderSavedTips(appData);
    displayCurrentTip();
    initBackupHandlers(appData);
}

function renderSavedTips(appData) {
    const list = document.getElementById('saved-tips-list');
    const saved = appData.knowledge?.savedTips || [];

    list.innerHTML = saved.length === 0 ? '<p class="italic text-gray-400">Nog geen tips bewaard.</p>' : saved.map((t, idx) => `
        <li class="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
            <span>💡 ${t.text.slice(0, 50)}...</span>
            <button onclick="window.removeSavedTip(${idx})" class="text-gray-300 hover:text-red-500">✕</button>
        </li>
    `).join('');

    window.removeSavedTip = (index) => {
        appData.knowledge.savedTips.splice(index, 1);
        saveAppData(appData);
        renderSavedTips(appData);
    };
}

function initBackupHandlers(appData) {
    document.getElementById('export-json-knowledge-btn').onclick = () => {
        const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `voldaan_backup_${new Date().toISOString().slice(0,10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast("Backup succesvol geëxporteerd! 💾");
    };

    document.getElementById('import-json-knowledge-file').onchange = (e) => {
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
    };
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
