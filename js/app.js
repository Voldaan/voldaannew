// js/app.js
import { loadAppData, saveAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';
import { initPlannenModule } from './modules/plannen.js';
import { initVitalityModule } from './modules/vitality.js';
import { initMoneyModule } from './modules/money.js';
import { initIdeasModule } from './modules/ideas.js';

let appData = loadAppData();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Voldaan app is modulair geladen en klaar voor actie!");
    
    // Initialiseer tabblad-navigatie
    initNavigation();
    
    // Initialiseer alle actieve modules
    initVandaagModule(appData);
    initPlannenModule(appData);
    initVitalityModule(appData);
    initMoneyModule(appData);
    initIdeasModule(appData);
});

// Functie om te wisselen tussen de verschillende schermen/tabs
function initNavigation() {
    const navButtons = document.querySelectorAll('[data-view-target], nav button');
    
    // Zorg dat de onclick of dataset correct reageert op switchView
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
