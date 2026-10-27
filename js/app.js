// js/app.js
import { loadAppData, saveAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';
import { initPlannenModule } from './modules/plannen.js';
import { initVitalityModule } from './modules/vitality.js';
import { initMoneyModule } from './modules/money.js';
import { initIdeasModule } from './modules/ideas.js';
import { initKnowledgeModule } from './modules/knowledge.js';
import { initInsightsModule } from './modules/insights.js';

let appData = loadAppData();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Voldaan app is volledig geladen!");
    
    initNavigation();
    
    initVandaagModule(appData);
    initPlannenModule(appData);
    initVitalityModule(appData);
    initMoneyModule(appData);
    initIdeasModule(appData);
    initKnowledgeModule(appData);
    initInsightsModule(appData);
});

function initNavigation() {
    window.switchView = function(targetView) {
        const views = document.querySelectorAll('.view-section');
        views.forEach(view => {
            if (view.id === targetView) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        });
    };
}

export { appData, saveAppData };
