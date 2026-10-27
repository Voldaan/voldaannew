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

function renderIdeas(appData) {
    const ideaGrid = document.getElementById('idea-grid');
    if (!ideaGrid) return;

    ideaGrid.innerHTML = '';
    appData.ideas.forEach(idea => {
        const card = document.createElement('div');
        card.className = 'p-4 bg-yellow-50 border border-yellow-200 rounded shadow-sm relative';
        card.innerHTML = `
            <p class="text-gray-800">${idea.text}</p>
            <button data-id="${idea.id}" class="delete-idea text-xs text-red-500 absolute top-2 right-2">✕</button>
        `;

        card.querySelector('.delete-idea').addEventListener('click', () => {
            appData.ideas = appData.ideas.filter(i => i.id !== idea.id);
            saveAppData(appData);
            renderIdeas(appData);
        });

        ideaGrid.appendChild(card);
    });
}
