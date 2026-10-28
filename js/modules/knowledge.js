// js/modules/knowledge.js
import { saveAppData, showToast } from './storage.js';

export function initKnowledgeModule(appData) {
    const container = document.getElementById('kennis');
    if (!container) return;

    if (!appData.knowledge) appData.knowledge = { savedTips: [] };

    container.innerHTML = `
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <h2 class="text-sm font-bold text-indigo-900 mb-1">📚 Kennis & Naslag</h2>
            <p class="text-[11px] text-gray-500 mb-3">Handige inzichten, notities en artikelen die je wilt bewaren.</p>
            
            <form id="knowledge-form" class="space-y-2 mb-3">
                <input type="text" id="knowledge-title" placeholder="Titel van het naslagwerk..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                <textarea id="knowledge-desc" rows="2" placeholder="Notitie of inhoud..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required></textarea>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Kennis Opslaan</button>
            </form>
            <div id="knowledge-list" class="space-y-2"></div>
        </div>
    `;

    document.getElementById('knowledge-form').onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('knowledge-title').value.trim();
        const text = document.getElementById('knowledge-desc').value.trim();
        if (title && text) {
            appData.knowledge.savedTips.push({ id: Date.now(), title, text, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderKnowledge(appData);
            showToast("Kennis item opgeslagen! 📚");
        }
    };

    renderKnowledge(appData);
}

function renderKnowledge(appData) {
    const list = document.getElementById('knowledge-list');
    const items = appData.knowledge?.savedTips || [];
    list.innerHTML = items.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen opgeslagen kennis.</p>' : items.slice(-5).reverse().map(k => `
        <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1 text-xs">
            <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-950">${k.title}</span>
                <button onclick="window.deleteKnowledge(${k.id})" class="text-gray-400 hover:text-red-500 font-bold">✕</button>
            </div>
            <p class="text-gray-600 text-[11px]">${k.text}</p>
        </div>
    `).join('');

    window.deleteKnowledge = (id) => {
        appData.knowledge.savedTips = appData.knowledge.savedTips.filter(x => x.id !== id);
        saveAppData(appData);
        renderKnowledge(appData);
    };
}
