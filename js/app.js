// js/app.js
import { loadAppData, saveAppData } from './modules/storage.js';
import { initMoneyModule } from './modules/money.js';
import { initTasksModule } from './modules/tasks.js';
import { initVitalityModule } from './modules/vitality.js';
import { initIdeasModule } from './modules/ideas.js';

let appData = loadAppData();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Voldaan app is modulair geladen en klaar voor actie!");
    
    initNavigation();
    
    // Initialiseer al je modules
    initMoneyModule(appData);
    initTasksModule(appData);
    initVitalityModule(appData);
    initIdeasModule(appData);
});

// Functie om te wisselen tussen de verschillende schermen/tabs via data-attributes
function initNavigation() {
    const navButtons = document.querySelectorAll('[data-view-target]');
    const views = document.querySelectorAll('.view-section');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = button.getAttribute('data-view-target');
            switchView(targetView);

            // Actieve knop styling bijwerken
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

// Globaal beschikbaar gemaakt zodat oude HTML onclick="switchView(...)" attributen blijven werken
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

export { appData, saveAppData };
