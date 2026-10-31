// js/modules/knowledge.js
import { saveAppData, showToast } from './storage.js';

const KNOWLEDGE_CATEGORIES = ['Algemeen & ADHD', 'Voetbal', 'Muziek & LP’s', 'Eten & Drinken', 'Gadgets', 'Attenties & Verrassingen'];

const EXPERT_TIPS = [
    { cat: 'Algemeen & ADHD', text: "💡 ADHD-Hack: Verdeel grote taken in mini-stapjes van maximaal 5 minuten. Alles wat groter is voelt als een onoverkoombare berg." },
    { cat: 'Algemeen & ADHD', text: "🧠 Brein-rust: Als je vastloopt in je gedachten, wissel dan direct van taak of zet de 15-minuten snaai-/pauzewachtkamer aan." },
    { cat: 'Algemeen & ADHD', text: "⚡ Prikkel-reductie: Zet je telefoonscherm op grijstinten als je merkt dat je te lang blijft hangen. Dit vermindert de dopamine-trigger aanzienlijk." },
    { cat: 'Voetbal', text: "⚽ Voetbal-pauze: Geniet van het spel, maar koppel nabeschouwingen aan een ontspannen moment met een kop thee in plaats van piekervorming." },
    { cat: 'Voetbal', text: "🛡️ Tactische rust: Net als op het veld helpt het om soms even een stap terug te zetten en te observeren voordat je actie onderneemt." },
    { cat: 'Muziek & LP’s', text: "🎶 Platen-meditatie: Zet bewust één volledige LP op zonder te skippen. Laat de muziek je anker zijn om even helemaal te ontprikkelen." },
    { cat: 'Muziek & LP’s', text: "🎧 Analoog genieten: Het ritueel van een plaat uit de hoes halen, afstoffen en de naald neerzetten brengt je direct in het nu." },
    { cat: 'Eten & Drinken', text: "☕ Zachte start: Begin je ochtend niet meteen met prikkels, maar neem 10 minuten de tijd voor je koffie of thee voordat je de app opent." },
    { cat: 'Eten & Drinken', text: "🥑 Bewust genieten: Een goede maaltijd is een moment van rust. Ervaar de smaken zonder afleiding van schermen." },
    { cat: 'Gadgets', text: "⚙️ Minimalistische techniek: Gebruik gadgets om je leven te vereenvoudigen, niet om je te overladen met notificaties en prikkels." },
    { cat: 'Attenties & Verrassingen', text: "💚 Kleine attentie: Verras iemand van je naasten vandaag met een handgeschreven briefje of een onverwachte knuffel; dat kost niets en betekent de wereld." },
    { cat: 'Attenties & Verrassingen', text: "✨ Onverwacht geluk: Stuur zomaar een appje om te waarderen wat iemand voor je betekent. Kleine moeite, enorm gebaar." }
];

export function initKnowledgeModule(appData) {
    const container = document.getElementById('kennis');
    if (!container) return;

    if (!appData.knowledge) {
        appData.knowledge = { savedTips: [] };
    }

    container.innerHTML = `
        <!-- 1. De Grote Inspiratie-Hub & Live Feed -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100 mb-4">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                <div>
                    <h2 class="text-base font-bold text-indigo-900">💡 Kennis, Hacks & Live Feed</h2>
                    <p class="text-xs text-gray-500">Live stroom van inzichten afgestemd op ADHD, focus, muziek en zachte keuzen.</p>
                </div>
                <select id="knowledge-cat-filter" class="text-xs bg-white border border-gray-200 rounded-xl px-3 py-2 w-full sm:w-auto">
                    <option value="Alle">🌟 Alle Categorieën</option>
                    ${KNOWLEDGE_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
            
            <div id="tip-card" class="p-4 bg-gradient-to-br from-indigo-50/80 to-indigo-100/40 border border-indigo-100 rounded-2xl mb-3 text-xs text-indigo-950 font-medium leading-relaxed shadow-sm">
                <!-- Wordt dynamisch gevuld -->
            </div>
            
            <div class="flex gap-2 mb-4">
                <button id="next-tip-btn" class="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">Andere tip ✨</button>
                <button id="save-tip-btn" class="px-4 py-2.5 bg-white border border-indigo-200 text-indigo-800 rounded-xl text-xs font-semibold hover:bg-indigo-50 transition shadow-sm">Bewaren in Kluis 📌</button>
            </div>

            <!-- Opgeslagen Tips / Kennis-Kluis -->
            <div class="pt-3 border-t border-gray-100">
                <div class="flex justify-between items-center mb-2">
                    <h3 class="text-xs font-bold text-indigo-900 uppercase tracking-wide">📌 Jouw Persoonlijke Kennis-Kluis</h3>
                    <span id="saved-tip-count" class="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg font-medium">0 items</span>
                </div>
                <ul id="saved-tips-list" class="space-y-1.5 text-xs text-gray-600 max-h-48 overflow-y-auto pr-1"></ul>
            </div>
        </div>

        <!-- 2. De Zachte Adem- & Oog-Pauze (Rust-Anker) -->
        <div class="bg-gradient-to-br from-teal-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm mb-4">
            <div class="flex justify-between items-center mb-1">
                <h3 class="text-sm font-bold text-teal-200 flex items-center gap-2">
                    <span>🌿</span> Zachte Adem- & Oogrust Anker
                </h3>
                <span class="text-[10px] bg-teal-800/80 text-teal-100 px-2.5 py-0.5 rounded-lg font-medium">Prikkelarm</span>
            </div>
            <p class="text-xs text-teal-100/80 mb-3">Even 30 seconden loskoppelen van het scherm. Geen scores, alleen rust voor je brein.</p>
            
            <div id="breath-container" class="p-4 bg-white/10 border border-teal-700/50 rounded-xl text-center">
                <p id="breath-status-text" class="text-xs font-medium text-teal-100 mb-2">Klik op de knop om een rustmoment van 30 seconden te starten.</p>
                <button id="start-breath-btn" class="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-semibold transition shadow-sm">Start Rustmoment 🍃</button>
            </div>
        </div>

        <!-- 3. Vinyl & Analoge Sfeer-Anker -->
        <div class="bg-gradient-to-r from-purple-900 via-indigo-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm mb-4">
            <div class="flex justify-between items-center mb-1">
                <h3 class="text-sm font-bold text-purple-200 flex items-center gap-2">
                    <span>🎶</span> Analoog Sfeer-Anker (Vinyl & Muziek)
                </h3>
                <span class="text-[10px] bg-purple-800/80 text-purple-100 px-2.5 py-0.5 rounded-lg font-medium">Offline Mindset</span>
            </div>
            <p class="text-xs text-purple-200/80 mb-3">Laat je inspireren door de rust van muziek en platen als tegenwicht voor de digitale drukte.</p>
            
            <div class="p-3.5 bg-white/10 border border-purple-700/50 rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <p id="vinyl-quote-title" class="font-bold text-purple-100 text-sm">"De naald op de plaat, de stilte in je hoofd."</p>
                    <p class="text-[11px] text-purple-300 mt-0.5">Tip: Zet een favoriete plaat op en leg je telefoon in een andere kamer.</p>
                </div>
                <button id="next-vinyl-quote-btn" class="px-3 py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition whitespace-nowrap shadow-sm">Andere Sfeer-Tip 🎧</button>
            </div>
        </div>

        <!-- 4. Gegevensbeheer & Backup -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border-2 border-indigo-100">
            <h2 class="text-base font-bold text-indigo-950 mb-1">💾 Gegevensbeheer & Backup</h2>
            <p class="text-xs text-gray-500 mb-3">Bewaar je opgebouwde progressie, knikkers, logboeken en kluis veilig op je eigen toestel.</p>
            <div class="flex flex-col sm:flex-row gap-2">
                <button id="export-json-knowledge-btn" class="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition">Exporteer App Backup (JSON)</button>
                <label class="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold text-center cursor-pointer transition border border-indigo-100">
                    Importeer Backup <input type="file" id="import-json-knowledge-file" class="hidden" accept=".json">
                </label>
            </div>
        </div>
    `;

    initKnowledgeLogic(appData);
}

// ---------------------------------------------------------
// Kennis & Hacks Logica & Zachte Ankers
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
        tipCard.innerHTML = `<span class="font-bold text-indigo-800 text-sm">[${current.cat}]</span><br><p class="mt-1 text-gray-800 text-sm leading-relaxed">${current.text}</p>`;
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

    // Zachte Adem- & Oogrust Anker Logica
    const breathBtn = document.getElementById('start-breath-btn');
    const statusText = document.getElementById('breath-status-text');
    if (breathBtn && statusText) {
        breathBtn.onclick = () => {
            breathBtn.disabled = true;
            breathBtn.classList.add('opacity-50');
            let secondsLeft = 30;
            statusText.textContent = `Adem rustig in en uit... (${secondsLeft}s)`;
            
            const interval = setInterval(() => {
                secondsLeft--;
                if (secondsLeft > 0) {
                    statusText.textContent = secondsLeft > 15 ? `Diep ademhalen... (${secondsLeft}s)` : `Schouders ontspannen, blik verzachten... (${secondsLeft}s)`;
                } else {
                    clearInterval(interval);
                    statusText.textContent = "✨ Prachtig. Je brein heeft even rust gekregen.";
                    breathBtn.disabled = false;
                    breathBtn.classList.remove('opacity-50');
                }
            }, 1000);
        };
    }

    // Vinyl Sfeer Quotes Rotatie
    const vinylQuotes = [
        { title: "\"De naald op de plaat, de stilte in je hoofd.\"", tip: "Zet een favoriete klassieker op en laat de plaat helemaal uitdraaien." },
        { title: "\"Vinyl dwingt je tot aandacht.\"", tip: "Geen skip-knop, geen algoritme. Gewoon genieten van wat de artiest voor je maakte." },
        { title: "\"Het warme kraken van een LP is pure rust.\"", tip: "Sluit je ogen en luister gedurende één liedje naar alle afzonderlijke instrumenten." }
    ];
    let vinylIndex = 0;
    const vinylTitleEl = document.getElementById('vinyl-quote-title');
    document.getElementById('next-vinyl-quote-btn').onclick = () => {
        vinylIndex = (vinylIndex + 1) % vinylQuotes.length;
        if (vinylTitleEl) vinylTitleEl.textContent = vinylQuotes[vinylIndex].title;
        showToast("Nieuwe sfeer-tip geladen 🎧");
    };

    renderSavedTips(appData);
    displayCurrentTip();
    initBackupHandlers(appData);
}

function renderSavedTips(appData) {
    const list = document.getElementById('saved-tips-list');
    const countBadge = document.getElementById('saved-tip-count');
    const saved = appData.knowledge?.savedTips || [];

    if (countBadge) countBadge.textContent = `${saved.length} items`;

    list.innerHTML = saved.length === 0 ? '<p class="italic text-gray-400 py-2 text-center">Nog geen tips bewaard in je kluis. Klik op "Bewaren" om inspiratie te onthouden.</p>' : saved.map((t, idx) => `
        <li class="flex justify-between items-center p-2.5 bg-gray-50 hover:bg-indigo-50/40 border border-gray-100 rounded-xl transition gap-2">
            <div>
                <span class="font-bold text-indigo-900">[${t.cat}]</span>
                <span class="text-gray-700 ml-1">${t.text}</span>
            </div>
            <button onclick="window.removeSavedTip(${idx})" class="text-gray-300 hover:text-red-500 font-bold px-1.5 py-0.5 rounded transition">✕</button>
        </li>
    `).join('');

    window.removeSavedTip = (index) => {
        appData.knowledge.savedTips.splice(index, 1);
        saveAppData(appData);
        renderSavedTips(appData);
        showToast("Tip verwijderd uit je kluis.");
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