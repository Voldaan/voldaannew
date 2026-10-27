// js/modules/ideas.js
import { saveAppData } from './storage.js';

const IDEA_CATEGORIES = ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'];

export function initIdeasModule(appData) {
    const container = document.getElementById('ideeen');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">📌 Ideeënkluis & Post-its</h2>
            <p class="text-xs text-gray-500 mb-3">Typ een willekeurig idee of wilde gedachte.</p>
            
            <form id="idea-form" class="space-y-2 mb-3">
                <textarea id="idea-text" rows="2" placeholder="Typ een wilde gedachte..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" required></textarea>
                <div class="grid grid-cols-2 gap-2">
                    <select id="idea-cat" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white">
                        ${IDEA_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
                    </select>
                    <button type="submit" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-medium">Prik op bord</button>
                </div>
            </form>

            <div id="idea-grid" class="grid grid-cols-1 gap-2.5"></div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-base font-bold text-indigo-900 mb-1">🚀 Projecten-Hub</h2>
            <p class="text-xs text-gray-500 mb-3">Zet wilde ideeën om in projecten.</p>
            
            <form id="project-form" class="flex flex-col gap-2 mb-3">
                <input type="text" id="project-title" placeholder="Titel van het project..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs" required>
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-medium">+ Project</button>
            </form>
            <div id="project-list" class="space-y-2"></div>
        </div>
    `;

    initIdeasLogic(appData);
}

function initIdeasLogic(appData) {
    if (!appData.ideas) appData.ideas = [];
    if (!appData.projects) appData.projects = [];

    document.getElementById('idea-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('idea-text').value.trim();
        const category = document.getElementById('idea-cat').value;
        if (text) {
            appData.ideas.push({ id: Date.now(), text, category, archived: false, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderIdeasView(appData);
        }
    });

    document.getElementById('project-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('project-title').value.trim();
        if (title) {
            appData.projects.push({ id: Date.now(), title, subtasks: [], archived: false, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderIdeasView(appData);
        }
    });

    renderIdeasView(appData);
}

function renderIdeasView(appData) {
    const grid = document.getElementById('idea-grid');
    const ideas = (appData.ideas || []).filter(i => !i.archived);

    grid.innerHTML = ideas.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen post-its.</p>' : ideas.slice(-6).reverse().map(i => `
        <div class="p-3.5 bg-yellow-50/80 border border-yellow-200 rounded-xl relative flex flex-col gap-1.5">
            <div>
                <span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">[${i.category}]</span>
                <p class="text-xs text-gray-800 mt-1.5">${i.text}</p>
            </div>
            <button onclick="window.deleteIdea(${i.id})" class="absolute top-2 right-2 text-xs text-gray-400 hover:text-red-500">✕</button>
        </div>
    `).join('');

    window.deleteIdea = (id) => {
        appData.ideas = appData.ideas.filter(x => x.id !== id);
        saveAppData(appData);
        renderIdeasView(appData);
    };

    const projList = document.getElementById('project-list');
    const projs = (appData.projects || []).filter(p => !p.archived);
    projList.innerHTML = projs.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen projecten.</p>' : projs.map(p => `
        <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
            <span class="font-bold text-indigo-950">📁 ${p.title}</span>
            <button onclick="window.deleteProject(${p.id})" class="text-gray-400 hover:text-red-500">Verwijderen</button>
        </div>
    `).join('');

    window.deleteProject = (id) => {
        appData.projects = appData.projects.filter(x => x.id !== id);
        saveAppData(appData);
        renderIdeasView(appData);
    };
}
