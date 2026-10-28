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

    // Tabbladen functionaliteit
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

        // Initialiseer de betreffende module
        if (tabId === 'vandaag') initVandaagModule(appData);
        if (tabId === 'plannen') initPlannenModule(appData);
        if (tabId === 'vitality') initVitalityModule(appData);
        if (tabId === 'geld') initMoneyModule(appData);
        if (tabId === 'ideeen') initIdeasModule(appData);
        if (tabId === 'kennis') initKnowledgeModule(appData);
        if (tabId === 'inzichten') initInsightsModule(appData);
        if (tabId === 'luchtig') initLuchtigModule(appData);

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
