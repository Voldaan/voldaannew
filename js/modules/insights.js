// js/modules/insights.js
export function initInsightsModule(appData) {
    const container = document.getElementById('inzichten');
    if (!container) return;

    const marblesCount = (appData.marbles || []).length;
    const tasksDone = (appData.tasks || []).filter(t => t.completed).length;
    const pactsDone = (appData.eveningPacts || []).filter(p => !p.archived).length;
    const balance = appData.money?.balance || 0;

    container.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">📊 Jouw Reis in Cijfers</h2>
            <p class="text-xs text-gray-500 mb-4">Gepersonaliseerde inzichten op basis van jouw eigen data.</p>
            
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div class="p-3.5 bg-indigo-50 rounded-2xl text-center">
                    <p class="text-[11px] text-indigo-600 font-bold uppercase">Knikkers</p>
                    <p class="text-xl font-bold text-indigo-900 mt-1">${marblesCount}</p>
                </div>
                <div class="p-3.5 bg-green-50 rounded-2xl text-center">
                    <p class="text-[11px] text-green-600 font-bold uppercase">Taken Gelukt</p>
                    <p class="text-xl font-bold text-green-900 mt-1">${tasksDone}</p>
                </div>
                <div class="p-3.5 bg-amber-50 rounded-2xl text-center">
                    <p class="text-[11px] text-amber-600 font-bold uppercase">Avond-Pacten</p>
                    <p class="text-xl font-bold text-amber-900 mt-1">${pactsDone}</p>
                </div>
                <div class="p-3.5 bg-blue-50 rounded-2xl text-center">
                    <p class="text-[11px] text-blue-600 font-bold uppercase">Banksaldo</p>
                    <p class="text-lg font-bold text-blue-900 mt-1">€ ${balance.toFixed(0)}</p>
                </div>
            </div>

            <div class="p-4 bg-indigo-900 text-white rounded-2xl shadow-sm">
                <p class="text-[11px] text-indigo-200 uppercase font-semibold mb-1">Zacht Inzicht</p>
                <p class="text-xs italic leading-relaxed">"Je hoeft niet hard te gaan om ergens te komen. Elke stap op jouw eigen tempo is er één."</p>
            </div>
        </div>
    `;
}
