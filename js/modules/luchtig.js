// js/modules/luchtig.js
export function initLuchtigModule(appData) {
    const container = document.getElementById('luchtig');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4 text-center space-y-3">
            <div class="w-12 h-12 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-center justify-center mx-auto text-xl">🍃</div>
            <h2 class="text-sm font-bold text-indigo-900">Luchtig & Ontspanning</h2>
            <p class="text-xs text-gray-600 leading-relaxed">Even helemaal niks moeten. Neem een diepe zucht, zet een fijn muziekje op en laat de controle los.</p>
            <a href="https://open.spotify.com" target="_blank" class="block w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Open Rustgevende Muziek 🎵</a>
        </div>
    `;
}
