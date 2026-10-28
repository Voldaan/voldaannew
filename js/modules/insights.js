// js/modules/insights.js
export function initInsightsModule(appData) {
    const container = document.getElementById('inzichten');
    if (!container) return;

    const totalTasks = (appData.plans?.tasks || []).length + (appData.plans?.archivedTasks || []).length;
    const completedTasks = (appData.plans?.archivedTasks || []).filter(t => t.completed).length;
    const totalMarbles = (appData.marbles || []).length;
    const totalIdeas = (appData.ideasModule?.ideas || []).length;

    container.innerHTML = `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <h2 class="text-sm font-bold text-indigo-900 mb-1">📊 Jouw Voldaan Inzichten</h2>
            <p class="text-[11px] text-gray-500 mb-3">Een zacht overzicht van je prestaties en groei.</p>
            
            <div class="grid grid-cols-2 gap-2 text-xs">
                <div class="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
                    <p class="text-gray-500 text-[10px]">Voltooide Taken</p>
                    <p class="text-lg font-bold text-indigo-900">${completedTasks}</p>
                </div>
                <div class="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
                    <p class="text-gray-500 text-[10px]">Trots-Knikkers</p>
                    <p class="text-lg font-bold text-amber-900">${totalMarbles}</p>
                </div>
                <div class="p-3 bg-purple-50/70 border border-purple-100 rounded-xl">
                    <p class="text-gray-500 text-[10px]">Actieve Ideeën</p>
                    <p class="text-lg font-bold text-purple-900">${totalIdeas}</p>
                </div>
                <div class="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
                    <p class="text-gray-500 text-[10px]">Banksaldo</p>
                    <p class="text-lg font-bold text-emerald-900">€ ${(appData.money?.balance || 0).toFixed(2)}</p>
                </div>
            </div>
        </div>
    `;
}
