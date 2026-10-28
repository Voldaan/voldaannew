// js/app.js
import { loadAppData, saveAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';
import { initPlannenModule } from './modules/plannen.js';
import { initVitalityModule } from './modules/vitality.js';
import { initMoneyModule } from './modules/money.js';
import { initIdeasModule } from './modules/ideas.js';
import { initKnowledgeModule } from './modules/knowledge.js';
import { initInsightsModule } from './modules/insights.js';
import { initLuchtigModule } from './modules/luchtig.js';

document.addEventListener('DOMContentLoaded', () => {
    const appData = loadAppData();

    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    function switchTab(tabId) {
        tabContents.forEach(content => {
            content.classList.toggle('hidden', content.id !== tabId);
        });

        navButtons.forEach(btn => {
            const isCurrent = btn.getAttribute('data-tab') === tabId;
            if (isCurrent) {
                btn.className = "nav-btn flex flex-col items-center justify-center py-1 text-indigo-600 font-semibold";
            } else {
                btn.className = "nav-btn flex flex-col items-center justify-center py-1 text-gray-400 hover:text-indigo-600";
            }
        });

        // Veilig initialiseren met foutafvang per module
        try {
            if (tabId === 'vandaag' && typeof initVandaagModule === 'function') initVandaagModule(appData);
            if (tabId === 'plannen' && typeof initPlannenModule === 'function') initPlannenModule(appData);
            if (tabId === 'vitality' && typeof initVitalityModule === 'function') initVitalityModule(appData);
            if (tabId === 'geld' && typeof initMoneyModule === 'function') initMoneyModule(appData);
            if (tabId === 'ideeen' && typeof initIdeasModule === 'function') initIdeasModule(appData);
            if (tabId === 'kennis' && typeof initKnowledgeModule === 'function') initKnowledgeModule(appData);
            if (tabId === 'inzichten' && typeof initInsightsModule === 'function') initInsightsModule(appData);
            if (tabId === 'luchtig' && typeof initLuchtigModule === 'function') initLuchtigModule(appData);
        } catch (err) {
            console.error(`Fout bij laden van module [${tabId}]:`, err);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Start standaard op het 'vandaag' tabblad
    switchTab('vandaag');
});
