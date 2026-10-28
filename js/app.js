// js/app.js
import { loadAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';
// Importeer hier eventueel je andere modules als je die hebt, bijvoorbeeld:
// import { initPlannenModule } from './modules/plannen.js';
// import { initMoneyModule } from './modules/money.js';

document.addEventListener('DOMContentLoaded', () => {
    const appData = loadAppData();

    // Globale router functie om te schakelen tussen tabbladen
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        const target = document.getElementById(tabId);
        if (target) {
            target.classList.remove('hidden');
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

    // Klik-listeners koppelen aan alle navigatieknoppen in de onderste balk
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId) {
                window.switchTab(tabId);
            }
        });
    });

    // Initialiseer modules
    initVandaagModule(appData);
    // Voeg hier eventuele initialisaties van andere tabbladen toe indien nodig
});
