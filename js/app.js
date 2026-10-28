// js/app.js
import { loadAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';

document.addEventListener('DOMContentLoaded', () => {
    let appData = loadAppData();

    // Globale switchTab functie
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        const target = document.getElementById(tabId);
        if (target) {
            target.classList.remove('hidden');
        } else {
            // Fallback als container mist: toon Vandaag
            const fallback = document.getElementById('vandaag');
            if (fallback) fallback.classList.remove('hidden');
        }

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('text-indigo-600', 'font-bold');
            btn.classList.add('text-gray-500');
            
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('text-indigo-600', 'font-bold');
                btn.classList.remove('text-gray-500');
            }
        });

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Klik-listeners koppelen aan alle navigatieknoppen onderaan
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId) {
                window.switchTab(tabId);
            }
        });
    });

    // Start de Vandaag module veilig
    try {
        initVandaagModule(appData);
    } catch (e) {
        console.error("Fout bij laden Vandaag module:", e);
    }
});