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

const viewOrder = ['vandaag', 'plannen', 'vitality', 'geld', 'ideeen', 'kennis', 'inzichten'];

document.addEventListener('DOMContentLoaded', () => {
    console.log("Voldaan app is volledig geoptimaliseerd!");
    
    initNavigation();
    initSwipeGestures();
    
    initVandaagModule(appData);
    initPlannenModule(appData);
    initVitalityModule(appData);
    initMoneyModule(appData);
    initIdeasModule(appData);
    initKnowledgeModule(appData);
    initInsightsModule(appData);
});

// Functie om te wisselen tussen de tabbladen + meescrollende menubalk
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

        // Update actieve styling en laat de knop automatisch in beeld schuiven
        const buttons = document.querySelectorAll('nav button');
        buttons.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (onclickAttr.includes(targetView)) {
                btn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm', 'scale-105');
                btn.classList.remove('bg-white', 'text-gray-700', 'border', 'border-gray-200');
                
                // Zorg dat de menubalk automatisch meescrollt naar de actieve knop
                btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            } else {
                btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm', 'scale-105');
                btn.classList.add('bg-white', 'text-gray-700', 'border', 'border-gray-200');
            }
        });
    };
}

// Swipe-bewegingen met automatische tabwissel
function initSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    const minSwipeDistance = 60;

    document.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);

    document.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);

    function handleSwipe() {
        const distance = touchEndX - touchStartX;
        if (Math.abs(distance) < minSwipeDistance) return;

        const currentViewEl = document.querySelector('.view-section:not(.hidden)');
        if (!currentViewEl) return;
        const currentIndex = viewOrder.indexOf(currentViewEl.id);
        if (currentIndex === -1) return;

        if (distance < 0) {
            const nextIndex = (currentIndex + 1) % viewOrder.length;
            window.switchView(viewOrder[nextIndex]);
        } else {
            const prevIndex = (currentIndex - 1 + viewOrder.length) % viewOrder.length;
            window.switchView(viewOrder[prevIndex]);
        }
    }
}

export { appData, saveAppData };
