// js/modules/vitality.js
import { saveAppData, voegTrotsKnikkerToe, showToast } from './storage.js';

export function initVitalityModule(appData) {
    const container = document.getElementById('vitality');
    if (!container) return;

    if (!appData.vitality) {
        appData.vitality = {
            sleep: [],
            steps: [],
            sport: [],
            sportTypes: ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Hardlopen', 'Rekken / Yoga'],
            nutrition: []
        };
    }

    container.innerHTML = `
        <!-- 1. Slaap Loggen -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <h2 class="text-sm font-bold text-indigo-900 mb-1">💤 Slaap & Herstel</h2>
            <p class="text-[11px] text-gray-500 mb-2.5">Hoe heb je geslapen afgelopen nacht?</p>
            
            <form id="sleep-form" class="flex flex-col gap-2 mb-3">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-[10px] font-semibold text-gray-600 mb-1">Aantal uren</label>
                        <input type="number" step="0.5" id="sleep-hours" placeholder="Bijv. 7.5" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                    </div>
                    <div>
                        <label class="block text-[10px] font-semibold text-gray-600 mb-1">Kwaliteit</label>
                        <select id="sleep-quality" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white">
                            <option value="Diep & Rustgevend">Diep & Rustgevend ✨</option>
                            <option value="Oké / Voldoende">Oké / Voldoende 🪨</option>
                            <option value="Onrustig / Moe">Onrustig / Moe 🌫️</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Slaap vastleggen 💤</button>
            </form>
            <ul id="sleep-list" class="space-y-1.5"></ul>
        </div>

        <!-- 2. Sport & Beweging -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <h2 class="text-sm font-bold text-indigo-900 mb-1">⚡ Sport & Beweging</h2>
            <p class="text-[11px] text-gray-500 mb-2.5">Houd je fysieke activiteit bij op jouw tempo.</p>
            
            <form id="sport-form" class="flex flex-col gap-2 mb-3">
                <div class="grid grid-cols-2 gap-2">
                    <select id="sport-type" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white">
                        ${(appData.vitality.sportTypes || []).map(s => `<option value="${s}">${s}</option>`).join('')}
                    </select>
                    <input type="number" id="sport-duration" placeholder="Duur in minuten" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                </div>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Beweging vastleggen ⚡</button>
            </form>
            <ul id="sport-list" class="space-y-1.5"></ul>
        </div>

        <!-- 3. Voeding & Drinken -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <h2 class="text-sm font-bold text-indigo-900 mb-1">🥗 Voeding & Hydratatie</h2>
            <p class="text-[11px] text-gray-500 mb-2.5">Zacht voor je lichaam zorgen.</p>
            
            <form id="nutrition-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="nutrition-text" placeholder="Bijv. 2 liter water gedronken..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Notitie toevoegen 🥗</button>
            </form>
            <ul id="nutrition-list" class="space-y-1.5"></ul>
        </div>
    `;

    initVitalityLogic(appData);
}

function initVitalityLogic(appData) {
    const vit = appData.vitality;

    document.getElementById('sleep-form').onsubmit = (e) => {
        e.preventDefault();
        const hours = parseFloat(document.getElementById('sleep-hours').value);
        const quality = document.getElementById('sleep-quality').value;
        if (!isNaN(hours)) {
            if (!vit.sleep) vit.sleep = [];
            vit.sleep.push({ id: Date.now(), hours, quality, date: new Date().toISOString() });
            voegTrotsKnikkerToe(appData, `Slaap geregistreerd: ${hours}u`, 'Vitaliteit');
            saveAppData(appData);
            e.target.reset();
            renderVitalityViews(appData);
            showToast("Slaap opgeslagen! 💤");
        }
    };

    document.getElementById('sport-form').onsubmit = (e) => {
        e.preventDefault();
        const type = document.getElementById('sport-type').value;
        const duration = parseInt(document.getElementById('sport-duration').value);
        if (!isNaN(duration)) {
            if (!vit.sport) vit.sport = [];
            vit.sport.push({ id: Date.now(), type, duration, date: new Date().toISOString() });
            voegTrotsKnikkerToe(appData, `Sport volbracht: ${type}`, 'Vitaliteit');
            saveAppData(appData);
            e.target.reset();
            renderVitalityViews(appData);
            showToast("Sportactiviteit opgeslagen! ⚡");
        }
    };

    document.getElementById('nutrition-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('nutrition-text').value.trim();
        if (text) {
            if (!vit.nutrition) vit.nutrition = [];
            vit.nutrition.push({ id: Date.now(), text, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderVitalityViews(appData);
            showToast("Voeding genoteerd! 🥗");
        }
    };

    renderVitalityViews(appData);
}

function renderVitalityViews(appData) {
    const vit = appData.vitality;

    document.getElementById('sleep-list').innerHTML = (vit.sleep || []).length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen slaapregistraties.</p>' : (vit.sleep || []).slice(-5).reverse().map(s => `
        <li class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
            <div><span class="font-bold text-indigo-900">${s.hours} uur</span> - <span class="text-gray-600">${s.quality}</span></div>
            <button onclick="window.deleteSleep(${s.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
        </li>
    `).join('');

    window.deleteSleep = (id) => {
        vit.sleep = vit.sleep.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };

    document.getElementById('sport-list').innerHTML = (vit.sport || []).length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen sportactiviteiten.</p>' : (vit.sport || []).slice(-5).reverse().map(sp => `
        <li class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
            <div><span class="font-bold text-indigo-900">${sp.type}</span> (${sp.duration} min)</div>
            <button onclick="window.deleteSport(${sp.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
        </li>
    `).join('');

    window.deleteSport = (id) => {
        vit.sport = vit.sport.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };

    document.getElementById('nutrition-list').innerHTML = (vit.nutrition || []).length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen notities.</p>' : (vit.nutrition || []).slice(-5).reverse().map(n => `
        <li class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
            <span class="text-gray-800 font-medium">${n.text}</span>
            <button onclick="window.deleteNut(${n.id})" class="text-gray-300 hover:text-red-500 font-bold px-1">✕</button>
        </li>
    `).join('');

    window.deleteNut = (id) => {
        vit.nutrition = vit.nutrition.filter(x => x.id !== id);
        saveAppData(appData);
        renderVitalityViews(appData);
    };
}
