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
        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <h2 class="text-lg font-bold text-indigo-900 mb-1">💡 Kennis, Hacks & Backups</h2>
            <p class="text-sm text-gray-500 mb-4">Live stroom van inzichten afgestemd op focus en zachte keuzen.</p>
            
            <div id="tip-card" class="p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl mb-4 text-sm text-indigo-950 font-medium">
                ${tips[0]}
            </div>
            <button id="next-tip-btn" class="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition mb-6">Andere tip ✨</button>

            <div class="pt-4 border-t border-gray-100">
                <h3 class="text-sm font-bold text-indigo-900 mb-2">Gegevensbeheer & Backup</h3>
                <p class="text-xs text-gray-500 mb-3">Bewaar je opgebouwde progressie veilig op je eigen toestel.</p>
                <div class="flex gap-2">
                    <button id="export-backup-btn" class="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold">Exporteer Backup (JSON)</button>
                </div>
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
