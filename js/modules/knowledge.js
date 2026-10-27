// js/modules/knowledge.js
export function initKnowledgeModule(appData) {
    const container = document.getElementById('kennis');
    if (!container) return;

    const tips = [
        "💡 ADHD-Hack: Verdeel grote taken in mini-stapjes van maximaal 5 minuten. Alles wat groter is voelt als een berg.",
        "🧠 Brein-rust: Als je vastloopt, wissel dan van taak of zet de 15-minuten snaai-/pauzewachtkamer aan.",
        "✨ Zachte start: Je hoeft niet meteen productief te zijn. Begin met een kop thee en check in bij je mood.",
        "🌱 Het Avond-Pact: Schrijf op wat je loslaat voor vandaag, zodat je slaapbrein rust krijgt."
    ];

    container.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">💡 Kennis, Hacks & Backups</h2>
            <p class="text-xs text-gray-500 mb-3">Live stroom van inzichten afgestemd op focus en zachte keuzen.</p>
            
            <div id="tip-card" class="p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl mb-3 text-xs text-indigo-950 font-medium leading-relaxed">
                ${tips[0]}
            </div>
            <button id="next-tip-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition mb-5">Andere tip ✨</button>

            <div class="pt-4 border-t border-gray-100">
                <h3 class="text-xs font-bold text-indigo-900 mb-1">Gegevensbeheer & Backup</h3>
                <p class="text-xs text-gray-500 mb-3">Bewaar je opgebouwde progressie veilig op je eigen toestel.</p>
                <button id="export-backup-btn" class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition">Exporteer Backup (JSON)</button>
            </div>
        </div>
    `;

    let tipIndex = 0;
    document.getElementById('next-tip-btn').addEventListener('click', () => {
        tipIndex = (tipIndex + 1) % tips.length;
        document.getElementById('tip-card').textContent = tips[tipIndex];
    });

    document.getElementById('export-backup-btn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
        const dlAnchor = document.createElement('a');
        dlAnchor.setAttribute("href", dataStr);
        dlAnchor.setAttribute("download", `voldaan_backup_${new Date().toISOString().slice(0,10)}.json`);
        document.body.appendChild(dlAnchor);
        dlAnchor.click();
        dlAnchor.remove();
    });
}
