// js/modules/ideas.js
import { saveAppData, checkDateFilter, showToast } from './storage.js';

const DEFAULT_IDEA_CATEGORIES = ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'];

export function initIdeasModule(appData) {
    const container = document.getElementById('ideeen');
    if (!container) return;

    if (!appData.ideasModule) {
        appData.ideasModule = {
            ideas: [],
            projects: [],
            categories: [...DEFAULT_IDEA_CATEGORIES],
            archivedIdeas: [],
            archivedProjects: []
        };
    }
    if (!appData.ideasModule.categories) appData.ideasModule.categories = [...DEFAULT_IDEA_CATEGORIES];

    let showAllIdeas = false;

    container.innerHTML = `
        <!-- 1. Ideeënkluis & Post-its -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">📌 Ideeënkluis & Post-its</h2>
                <button id="open-ideas-beheer-modal" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 transition">Beheer & Archief ⚙️</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Schrijf je gedachten van je af en laat ze rustig sudderen.</p>

            <form id="idea-form" class="space-y-2 mb-3">
                <textarea id="idea-text" rows="2" placeholder="Typ een willekeurig idee of wilde gedachte..." class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" required></textarea>
                <div class="grid grid-cols-2 gap-2">
                    <select id="idea-cat" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white"></select>
                    <button type="submit" class="w-full py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Prik op het bord 📌</button>
                </div>
            </form>

            <div id="idea-grid" class="grid grid-cols-1 gap-2"></div>
            <div id="idea-more-container" class="text-center mt-2"></div>
        </div>

        <!-- 2. Projecten-Hub -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">🚀 Projecten-Hub</h2>
                <button id="open-project-modal-btn" class="px-2.5 py-1 bg-indigo-600 text-white rounded-xl text-[11px] font-semibold hover:bg-indigo-700 transition">+ Nieuw Project</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Zet spontane post-its om in gestructureerde projecten.</p>
            
            <div id="project-list" class="space-y-2.5"></div>
        </div>
    `;

    initIdeasModals(appData);
    initIdeasLogic(appData);
}

function initIdeasModals(appData) {
    const beheerModalHTML = `
        <div id="ideas-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer & Archief Ideeënkluis</h3>
                    <button id="close-ideas-beheer" class="text-gray-400 hover:text-gray-600 font-bold text-base">✕</button>
                </div>
                <div class="space-y-3 text-xs">
                    <div>
                        <p class="font-bold text-indigo-900 mb-1">Categorieën Beheren</p>
                        <div class="flex gap-2 mb-2">
                            <input type="text" id="modal-idea-new-cat" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 border rounded-xl">
                            <button id="modal-idea-add-cat-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen</button>
                        </div>
                        <div id="modal-idea-cat-chips" class="flex flex-wrap gap-1.5"></div>
                    </div>
                    <div class="border-t pt-2">
                        <p class="font-bold text-indigo-900 mb-1">Gearchiveerde Post-its</p>
                        <div id="modal-archived-ideas-list" class="space-y-1.5 max-h-48 overflow-y-auto"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const projectModalHTML = `
        <div id="idea-project-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">🚀 Nieuw Project vanuit Idee</h3>
                    <button id="close-idea-project-modal" class="text-gray-400 hover:text-gray-600 text-base">✕</button>
                </div>
                <form id="idea-project-form" class="space-y-2.5 text-xs">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Titel van het project</label>
                        <input type="text" id="modal-proj-title" placeholder="Bijv. Voldaan app vernieuwen" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving</label>
                        <textarea id="modal-proj-desc" rows="2" placeholder="Wat is het doel van dit project?" class="w-full px-3 py-2 border rounded-xl"></textarea>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Tijdsdoel / Planning</label>
                        <input type="text" id="modal-proj-time" placeholder="Bijv. Voor eind van de maand" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-idea-project-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Project Aanmaken ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', beheerModalHTML + projectModalHTML);

    const beheerModal = document.getElementById('ideas-beheer-modal');
    document.getElementById('open-ideas-beheer-modal').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderIdeasBeheerModal(appData);
    };
    document.getElementById('close-ideas-beheer').onclick = () => beheerModal.classList.add('hidden');

    const projModal = document.getElementById('idea-project-modal');
    document.getElementById('open-project-modal-btn').onclick = () => projModal.classList.remove('hidden');
    document.getElementById('close-idea-project-modal').onclick = () => projModal.classList.add('hidden');
    document.getElementById('cancel-idea-project-modal').onclick = () => projModal.classList.add('hidden');

    document.getElementById('idea-project-form').onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('modal-proj-title').value.trim();
        const description = document.getElementById('modal-proj-desc').value.trim();
        const timeGoal = document.getElementById('modal-proj-time').value.trim();

        if (title) {
            if (!appData.ideasModule.projects) appData.ideasModule.projects = [];
            appData.ideasModule.projects.push({ id: Date.now(), title, description, timeGoal, subtasks: [], date: new Date().toISOString() });
            saveAppData(appData);
            projModal.classList.add('hidden');
            e.target.reset();
            renderProjectsView(appData);
            showToast("Project succesvol aangemaakt! 🚀");
        }
    };
}

function renderIdeasBeheerModal(appData) {
    const chipsContainer = document.getElementById('modal-idea-cat-chips');
    const cats = appData.ideasModule.categories || DEFAULT_IDEA_CATEGORIES;
    chipsContainer.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border rounded-lg text-indigo-900 font-medium text-[11px]">
            ${c} ${cats.length > 1 ? `<button onclick="window.removeIdeaCatModal('${c}')" class="text-red-400 hover:text-red-600 font-bold ml-1">✕</button>` : ''}
        </span>
    `).join('');

    window.removeIdeaCatModal = (catName) => {
        appData.ideasModule.categories = appData.ideasModule.categories.filter(c => c !== catName);
        saveAppData(appData);
        renderIdeasBeheerModal(appData);
        initIdeasModule(appData);
        showToast("Categorie verwijderd.");
    };

    document.getElementById('modal-idea-add-cat-btn').onclick = () => {
        const val = document.getElementById('modal-idea-new-cat').value.trim();
        if (val && !cats.includes(val)) {
            cats.push(val);
            saveAppData(appData);
            document.getElementById('modal-idea-new-cat').value = '';
            renderIdeasBeheerModal(appData);
            initIdeasModule(appData);
            showToast(`Categorie '${val}' toegevoegd! ✨`);
        }
    };

    const archivedList = document.getElementById('modal-archived-ideas-list');
    const archived = appData.ideasModule.archivedIdeas || [];
    archivedList.innerHTML = archived.length === 0 ? '<p class="text-gray-400 italic">Geen gearchiveerde post-its.</p>' : archived.map(i => `
        <div class="flex justify-between items-center p-2 bg-gray-50 border rounded-xl text-xs">
            <span>[${i.category}] ${i.text.slice(0, 40)}...</span>
            <div class="flex gap-2">
                <button onclick="window.restoreIdeaModal(${i.id})" class="text-indigo-600 font-semibold hover:underline">Terugzetten</button>
                <button onclick="window.permaDeleteIdea(${i.id})" class="text-red-500 font-semibold hover:underline">Verwijderen</button>
            </div>
        </div>
    `).join('');

    window.restoreIdeaModal = (id) => {
        const item = appData.ideasModule.archivedIdeas.find(x => x.id === id);
        if (item) {
            appData.ideasModule.archivedIdeas = appData.ideasModule.archivedIdeas.filter(x => x.id !== id);
            appData.ideasModule.ideas.push(item);
            saveAppData(appData);
            renderIdeasBeheerModal(appData);
            initIdeasModule(appData);
            showToast("Post-it hersteld!");
        }
    };

    window.permaDeleteIdea = (id) => {
        appData.ideasModule.archivedIdeas = appData.ideasModule.archivedIdeas.filter(x => x.id !== id);
        saveAppData(appData);
        renderIdeasBeheerModal(appData);
        initIdeasModule(appData);
        showToast("Post-it definitief verwijderd.");
    };
}

function initIdeasLogic(appData) {
    const ideasMod = appData.ideasModule;
    updateIdeaCategoryDropdowns(ideasMod);

    let showAllIdeas = false;

    document.getElementById('idea-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('idea-text').value.trim();
        const category = document.getElementById('idea-cat').value;
        if (text) {
            ideasMod.ideas.push({ id: Date.now(), text, category, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderIdeasView(appData);
            showToast("Post-it geprikt! 📌");
        }
    };

    renderIdeasView(appData);
    renderProjectsView(appData);

    function renderIdeasView(appData) {
        const grid = document.getElementById('idea-grid');
        const moreContainer = document.getElementById('idea-more-container');
        const ideas = (ideasMod.ideas || []).filter(i => !i.archived);

        const displayedIdeas = showAllIdeas ? ideas : ideas.slice(-5).reverse();

        grid.innerHTML = displayedIdeas.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen post-its op het bord.</p>' : displayedIdeas.map(i => {
            const isLong = i.text.length > 80;
            const shortText = isLong ? i.text.slice(0, 80) + '...' : i.text;
            return `
                <div class="p-3 bg-yellow-50/90 border border-yellow-200 rounded-xl relative flex flex-col gap-1.5 shadow-xs">
                    <div class="flex justify-between items-start">
                        <span class="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">[${i.category}]</span>
                        <div class="relative">
                            <button onclick="window.toggleIdeaMenu(${i.id})" class="text-gray-500 hover:text-gray-800 font-bold px-1.5 py-0.5 rounded-lg bg-yellow-100/60 text-xs">⋮</button>
                            <div id="idea-menu-${i.id}" class="hidden absolute right-0 top-6 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 w-40 text-xs">
                                <button onclick="window.editIdeaInline(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700 font-medium">Bewerken ✏️</button>
                                <button onclick="window.ideaToPlan(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-indigo-700 font-medium">Naar Planbord 🎯</button>
                                <button onclick="window.ideaToProject(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-indigo-700 font-medium">Maak Project 🚀</button>
                                <button onclick="window.archiveIdea(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-600 font-medium">Niet relevant / Weg ✕</button>
                            </div>
                        </div>
                    </div>
                    <p id="idea-text-content-${i.id}" class="text-xs text-gray-800 leading-relaxed">${shortText}</p>
                    ${isLong ? `<button onclick="window.toggleExpandIdea(${i.id}, \`${encodeURIComponent(i.text)}\`)" id="expand-btn-${i.id}" class="text-[10px] font-semibold text-amber-900 underline text-left">Uitvouwen</button>` : ''}
                </div>
            `;
        }).join('');

        if (ideas.length > 5) {
            moreContainer.innerHTML = `<button id="toggle-more-ideas-btn" class="text-[11px] text-indigo-600 font-semibold hover:underline">${showAllIdeas ? 'Minder weergeven' : `+ ${ideas.length - 5} meer weergeven...`}</button>`;
            document.getElementById('toggle-more-ideas-btn').onclick = () => {
                showAllIdeas = !showAllIdeas;
                renderIdeasView(appData);
            };
        } else {
            moreContainer.innerHTML = '';
        }

        window.toggleIdeaMenu = (id) => {
            const menu = document.getElementById(`idea-menu-${id}`);
            document.querySelectorAll('[id^="idea-menu-"]').forEach(m => { if (m !== menu) m.classList.add('hidden'); });
            menu.classList.toggle('hidden');
        };

        window.toggleExpandIdea = (id, encodedText) => {
            const textEl = document.getElementById(`idea-text-content-${id}`);
            const btnEl = document.getElementById(`expand-btn-${id}`);
            const fullText = decodeURIComponent(encodedText);
            if (btnEl.textContent === 'Uitvouwen') {
                textEl.textContent = fullText;
                btnEl.textContent = 'Inklappen';
            } else {
                textEl.textContent = fullText.slice(0, 80) + '...';
                btnEl.textContent = 'Uitvouwen';
            }
        };

        window.editIdeaInline = (id) => {
            const item = ideasMod.ideas.find(x => x.id === id);
            if (item) {
                const newText = prompt("BewERK post-it tekst:", item.text);
                if (newText !== null && newText.trim() !== '') {
                    item.text = newText.trim();
                    saveAppData(appData);
                    renderIdeasView(appData);
                    showToast("Post-it bijgewerkt! ✏️");
                }
            }
        };

        window.ideaToPlan = (id) => {
            const item = ideasMod.ideas.find(x => x.id === id);
            if (item) {
                if (!appData.plans) appData.plans = { tasks: [] };
                if (!appData.plans.tasks) appData.plans.tasks = [];
                appData.plans.tasks.push({ id: Date.now(), text: item.text, category: item.category, priority: 'Normaal', completed: false, date: new Date().toISOString() });
                saveAppData(appData);
                showToast("Idee overgebracht naar het Planbord! 🎯");
            }
        };

        window.ideaToProject = (id) => {
            const item = ideasMod.ideas.find(x => x.id === id);
            if (item) {
                if (!ideasMod.projects) ideasMod.projects = [];
                ideasMod.projects.push({ id: Date.now(), title: item.text.slice(0, 40), description: item.text, timeGoal: '', subtasks: [], date: new Date().toISOString() });
                saveAppData(appData);
                renderProjectsView(appData);
                showToast("Omgezet in een Project! 🚀");
            }
        };

        window.archiveIdea = (id) => {
            const item = ideasMod.ideas.find(x => x.id === id);
            if (item) {
                ideasMod.ideas = ideasMod.ideas.filter(x => x.id !== id);
                if (!ideasMod.archivedIdeas) ideasMod.archivedIdeas = [];
                ideasMod.archivedIdeas.push(item);
                saveAppData(appData);
                renderIdeasView(appData);
                showToast("Post-it gearchiveerd.");
            }
        };
    }
}

function updateIdeaCategoryDropdowns(ideasMod) {
    const catSelect = document.getElementById('idea-cat');
    if (!catSelect) return;
    const cats = ideasMod.categories || DEFAULT_IDEA_CATEGORIES;
    catSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderProjectsView(appData) {
    const listEl = document.getElementById('project-list');
    const projects = (appData.ideasModule.projects || []).filter(p => !p.archived);

    listEl.innerHTML = projects.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen actieve projecten.</p>' : projects.map(p => `
        <div class="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5 text-xs">
            <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-950">📁 ${p.title}</span>
                <button onclick="window.archiveProject(${p.id})" class="text-gray-400 hover:text-red-500 font-bold">✕</button>
            </div>
            ${p.description ? `<p class="text-gray-600 text-[11px]">${p.description}</p>` : ''}
            ${p.timeGoal ? `<p class="text-[10px] text-indigo-700 font-medium">⏱️ Planning: ${p.timeGoal}</p>` : ''}
        </div>
    `).join('');

    window.archiveProject = (id) => {
        appData.ideasModule.projects = appData.ideasModule.projects.filter(x => x.id !== id);
        saveAppData(appData);
        renderProjectsView(appData);
        showToast("Project verwijderd.");
    };
}
