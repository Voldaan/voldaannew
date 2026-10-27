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
    
    // Initialiseer de Trots-Kluis op de Vandaag-pagina
    initTrotsKluis(appData);
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

// Globaal beschikbaar gemaakt zodat HTML onclick="switchView(...)" attributen vlekkeloos werken
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

// Trots-Kluis logica (Knikkerteller)
function initTrotsKluis(appData) {
    const badge = document.getElementById('marble-count-badge');
    const addBtn = document.getElementById('add-marble-btn');

    function updateDisplay() {
        if (badge) {
            badge.textContent = `${appData.marbles || 0} Knikkers`;
        }
    }

    updateDisplay();

    if (addBtn) {
        addBtn.addEventListener('click', () => {
            appData.marbles = (appData.marbles || 0) + 1;
            saveAppData(appData);
            updateDisplay();
            
            // Kleine visuele feedback bij het klikken
            addBtn.classList.add('scale-105', 'bg-indigo-700');
            setTimeout(() => {
                addBtn.classList.remove('scale-105', 'bg-indigo-700');
            }, 200);
        });
    }
}

export { appData, saveAppData };
