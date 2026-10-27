// js/modules/ideas.js
import { saveAppData } from './storage.js';

export function initIdeasModule(appData) {
    renderIdeas(appData);

    const ideaForm = document.getElementById('idea-form');
    if (ideaForm) {
        ideaForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const ideaInput = document.getElementById('idea-input');
            const ideaText = ideaInput ? ideaInput.value.trim() : '';

            if (ideaText) {
                // Zorg dat appData.ideas een array is
                if (!appData.ideas) appData.ideas = [];

                appData.ideas.push({
                    id: Date.now(),
                    text: ideaText,
                    date: new Date().toISOString()
                });

                saveAppData(appData);
                renderIdeas(appData);
                ideaForm.reset();
            }
        });
    }
}

// Toon de ideeën als post-it grid
function renderIdeas(appData) {
    const ideaGrid = document.getElementById('idea-grid');
    if (!ideaGrid) return;

    ideaGrid.innerHTML = '';
    const ideas = appData.ideas || [];

    if (ideas.length === 0) {
        ideaGrid.innerHTML = `<p class="text-xs text-gray-400 italic col-span-full">Nog geen ideeën vastgelegd in de kluis.</p>`;
        return;
    }

    ideas.forEach(idea => {
        const card = document.createElement('div');
        card.className = 'p-4 bg-yellow-50/80 border border-yellow-200 rounded-xl shadow-sm relative flex flex-col justify-between gap-2';
        
        card.innerHTML = `
            <p class="text-sm text-gray-800 pr-6">${idea.text}</p>
            <button data-id="${idea.id}" class="delete-idea text-xs text-gray-400 hover:text-red-500 absolute top-3 right-3 p-1">✕</button>
        `;

        card.querySelector('.delete-idea').addEventListener('click', () => {
            appData.ideas = appData.ideas.filter(i => i.id !== idea.id);
            saveAppData(appData);
            renderIdeas(appData);
        });

        ideaGrid.appendChild(card);
    });
}
