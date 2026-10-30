// js/app.js
import { loadAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';
import { initPlannenModule } from './modules/plannen.js';
import { initMoneyModule } from './modules/money.js';
import { initVitalityModule } from './modules/vitality.js';
import { initIdeasModule } from './modules/ideas.js';
import { initKnowledgeModule } from './modules/knowledge.js';
import { initLuchtigModule } from './modules/luchtig.js';
import { initInsightsModule } from './modules/insights.js';

document.addEventListener('DOMContentLoaded', () => {
    let appData = loadAppData();

    // Initialiseer alle modules direct bij opstarten zodat de DOM-elementen bestaan
    try { initVandaagModule(appData); } catch (e) { console.error("Fout Vandaag:", e); }
    try { initPlannenModule(appData); } catch (e) { console.error("Fout Plannen:", e); }
    try { initMoneyModule(appData); } catch (e) { console.error("Fout Geld:", e); }
    try { initVitalityModule(appData); } catch (e) { console.error("Fout Vitaliteit:", e); }
    try { initIdeasModule(appData); } catch (e) { console.error("Fout Ideeën:", e); }
    try { initKnowledgeModule(appData); } catch (e) { console.error("Fout Kennis:", e); }
    try { initLuchtigModule(appData); } catch (e) { console.error("Fout Luchtig:", e); }
    try { initInsightsModule(appData); } catch (e) { console.error("Fout Inzichten:", e); }

    // Globale switchTab functie
    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        const target = document.getElementById(tabId);
        if (target) {
            target.classList.remove('hidden');
        } else {
            tabId = 'vandaag';
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

        // Sla het actieve tabblad op zodat het onthouden wordt bij verversen
        localStorage.setItem('activeTab', tabId);

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

    // Herstel het laatst bezochte tabblad bij opstarten of verversen
    const savedTab = localStorage.getItem('activeTab') || 'vandaag';
    window.switchTab(savedTab);
});
