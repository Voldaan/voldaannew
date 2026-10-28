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

    // Tabblad navigatie logica
    const navButtons = document.querySelectorAll('.nav-tab-btn');
    const viewSections = document.querySelectorAll('.view-section');

    function switchTab(targetId) {
        viewSections.forEach(section => {
            if (section.id === targetId) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });

        navButtons.forEach(btn => {
            if (btn.getAttribute('data-target') === targetId) {
                btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
                btn.classList.remove('text-gray-600', 'hover:bg-gray-100');
            } else {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
                btn.classList.add('text-gray-600', 'hover:bg-gray-100');
            }
        });

        // Initialiseer de specifieke module bij het openen van het tabblad
        if (targetId === 'vandaag') initVandaagModule(appData);
        if (targetId === 'plannen') initPlannenModule(appData);
        if (targetId === 'vitality') initVitalityModule(appData);
        if (targetId === 'geld') initMoneyModule(appData);
        if (targetId === 'ideeen') initIdeasModule(appData);
        if (targetId === 'kennis') initKnowledgeModule(appData);
        if (targetId === 'inzichten') initInsightsModule(appData);
        if (targetId === 'luchtig') initLuchtigModule(appData);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            switchTab(target);
        });
    });

    // Start standaard op Vandaag
    switchTab('vandaag');
});
