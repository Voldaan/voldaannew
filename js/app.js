// js/app.js
import { loadAppData, saveAppData } from './modules/storage.js';

// Laad de initiële app-data bij het opstarten
let appData = loadAppData();

document.addEventListener('DOMContentLoaded', () => {
    console.log("Voldaan app is geladen en klaar voor actie!");
    
    // Initialiseer tab-navigatie
    initNavigation();
    
    // Hier koppelen we straks de modules aan
});

// Functie om te wisselen tussen de verschillende schermen/tabs in de app
function initNavigation() {
    const navButtons = document.querySelectorAll('[data-view-target]');
    const views = document.querySelectorAll('.view-section'); // Zorg dat je secties deze class hebben in HTML

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const targetView = button.getAttribute('data-view-target');

            // Verberg alle views en toon de gekozen view
            views.forEach(view => {
                if (view.id === targetView) {
                    view.classList.remove('hidden');
                } else {
                    view.classList.add('hidden');
                }
            });

            // Actieve knop styling bijwerken
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
}

export { appData, saveAppData };
