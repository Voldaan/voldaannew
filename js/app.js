// js/app.js (bijgewerkt)
import { loadAppData, saveAppData } from './modules/storage.js';
import { initMoneyModule } from './modules/money.js';
import { initTasksModule } from './modules/tasks.js'; // <-- Geïmporteerd

let appData = loadAppData();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Voldaan app is geladen en klaar voor actie!");
    
    initNavigation();
    
    // Initialiseer de modules
    initMoneyModule(appData);
    initTasksModule(appData); // <-- Aangeroepen
});

function initNavigation() {
    const navButtons = document.querySelectorAll('[data-view-target]');
    const views = document.querySelectorAll('.view-section');

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = button.getAttribute('data-view-target');

            views.forEach(view => {
                if (view.id === targetView) {
                    view.classList.remove('hidden');
                } else {
                    view.classList.add('hidden');
                }
            });

            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

export { appData, saveAppData };
