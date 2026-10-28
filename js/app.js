// js/app.js
import { loadAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';

document.addEventListener('DOMContentLoaded', () => {
    const appData = loadAppData();

    // Globale router functie om te schakelen tussen tabbladen
    window.switchTab = function(tabId) {
        // Verberg alle tabbladen
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        // Toon het geselecteerde tabblad
        const target = document.getElementById(tabId);
        if (target) {
            target.classList.remove('hidden');
        }

        // Update de actieve styling van de navigatieknoppen onderaan
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('text-indigo-600', 'font-bold');
            btn.classList.add('text-gray-500');
            
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('text-indigo-600', 'font-bold');
                btn.classList.remove('text-gray-500');
            }
        });

        // Scroll soepel terug naar boven bij het wisselen van tab
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

    // Start de Vandaag-module bij het openen van de app
    initVandaagModule(appData);
});
