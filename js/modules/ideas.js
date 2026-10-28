// js/modules/ideas.js
import { saveAppData, voegTrotsKnikkerToe, showToast } from './storage.js';

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

    container.innerHTML = `
        <!-- De Ideeënkluis & Post-its -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-sm font-bold text-indigo-900">📌 De Ideeënkluis</h2>
                <button id="open-ideas-beheer" class="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg text-[11px] font-semibold hover:bg-indigo-100 transition">Beheer ⚙️</button>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Prik je losse ideeën op het bord en werk ze later uit.</p>

            <form id="idea-form" class="space-y-2 mb-3">
                <textarea id="idea-text" rows="2" placeholder="Wat voor idee popt er op in je hoofd?..." class="w-full px-3 py-1.5 border border-gray-200 rounded-xl text-xs" required></textarea>
                <div class="grid grid-cols-2 gap-2">
                    <select id="idea-category" class="w-full px-2.5 py-1.5 border border-gray-200 rounded-xl text-xs bg-white"></select>
                    <button type="submit" class="w-full py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Prik op het bord 📌</button>
                </div>
            </form>

            <div class="grid grid-cols-1 gap-2.5" id="ideas-grid"></div>
            <div id="ideas-more-container" class="text-center mt-2"></div>
        </div>

        <!-- Projecten Hub -->
        <div class="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-sm font-bold text-indigo-900">🚀 Projecten Hub</h2>
            </div>
            <p class="text-[11px] text-gray-500 mb-2.5">Ideeën die zijn doorgegroeid tot concrete projecten.</p>
            <div id="projects-list" class="space-y-2"></div>
        </div>
    `;

    initIdeasModals(appData);
    initIdeasLogic(appData);
}

function initIdeasModals(appData) {
    const modalsHTML = `
        <!-- Idee Bewerken Modal -->
        <div id="edit-idea-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 border border-gray-200 text-xs">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">✏️ Idee Bewerken</h3>
                    <button id="close-edit-idea" class="text-gray-400 font-bold text-base">✕</button>
                </div>
                <form id="edit-idea-form" class="space-y-2.5">
                    <input type="hidden" id="edit-idea-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Idee tekst</label>
                        <textarea id="edit-idea-text-input" rows="3" class="w-full px-3 py-2 border rounded-xl" required></textarea>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                        <select id="edit-idea-cat" class="w-full px-2.5 py-1.5 border rounded-xl bg-white"></select>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-edit-idea" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>

        <!-- Ideeën Beheer Modal -->
        <div id="ideas-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-5 shadow-xl space-y-3 max-h-[85vh] overflow-y-auto border border-gray-200 text-xs">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer Ideeënkluis</h3>
                    <button id="close-ideas-beheer" class="text-gray-400 font-bold text-base">✕</button>
                </div>
                <div class="space-y-3">
                    <div>
                        <p class="font-bold text-indigo-900 mb-1">Categorieën Beheren</p>
                        <div class="flex gap-2 mb-2">
                            <input type="text" id="modal-idea-new-cat" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 border rounded-xl">
                            <button id="modal-idea-add-cat-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen</button>
                        </div>
                        <div id="modal-idea-cat-chips" class="flex flex-wrap gap-1.5"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById('edit-idea-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalsHTML);
    }

    const editModal = document.getElementById('edit-idea-modal');
    document.getElementById('close-edit-idea').onclick = () => editModal.classList.add('hidden');
    document.getElementById('cancel-edit-idea').onclick = () => editModal.classList.add('hidden');

    document.getElementById('edit-idea-form').onsubmit = (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-idea-id').value);
        const text = document.getElementById('edit-idea-text-input').value.trim();
        const category = document.getElementById('edit-idea-cat').value;

        const idea = (appData.ideasModule.ideas || []).find(x => x.id === id);
        if (idea && text) {
            idea.text = text;
            idea.category = category;
            saveAppData(appData);
            editModal.classList.add('hidden');
            initIdeasModule(appData);
            showToast("Idee bijgewerkt! 📌");
        }
    };

    const beheerModal = document.getElementById('ideas-beheer-modal');
    document.getElementById('open-ideas-beheer').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderIdeasBeheerModal(appData);
    };
    document.getElementById('close-ideas-beheer').onclick = () => beheerModal.classList.add('hidden');
}

function renderIdeasBeheerModal(appData) {
    const chipsContainer = document.getElementById('modal-idea-cat-chips');
    const cats = appData.ideasModule.categories || DEFAULT_IDEA_CATEGORIES;
    chipsContainer.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 border rounded-lg text-indigo-900 font-medium text-[11px]">
            ${c} ${cats.length > 1 ? `<button onclick="window.removeIdeaCat('${c}')" class="text-red-400 font-bold ml-1">✕</button>` : ''}
        </span>
    `).join('');

    window.removeIdeaCat = (catName) => {
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
}

function initIdeasLogic(appData) {
    const ideasMod = appData.ideasModule;
    const cats = ideasMod.categories || DEFAULT_IDEA_CATEGORIES;

    const catSelect = document.getElementById('idea-category');
    catSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');

    document.getElementById('idea-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('idea-text').value.trim();
        const category = document.getElementById('idea-category').value;
        if (text) {
            if (!ideasMod.ideas) ideasMod.ideas = [];
            ideasMod.ideas.push({ id: Date.now(), text, category, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderIdeasViews(appData);
            showToast("Idee geprikt op het bord! 📌");
        }
    };

    renderIdeasViews(appData);
}

function renderIdeasViews(appData) {
    const ideasMod = appData.ideasModule;
    const grid = document.getElementById('ideas-grid');
    const moreContainer = document.getElementById('ideas-more-container');

    const ideas = ideasMod.ideas || [];
    let showAllIdeas = window._showAllIdeas || false;
    const displayedIdeas = showAllIdeas ? ideas : ideas.slice(-5).reverse();

    grid.innerHTML = displayedIdeas.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen ideeën geprikt.</p>' : displayedIdeas.map(i => `
        <div class="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-2 relative shadow-xs">
            <div class="flex justify-between items-start">
                <span class="font-bold text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded-md text-[10px]">${i.category}</span>
                <!-- 3-puntjes menu knop -->
                <div class="relative">
                    <button onclick="window.toggleIdeaMenu(${i.id})" class="text-gray-500 hover:text-indigo-900 font-bold px-2 py-0.5 text-sm">⋮</button>
                    <div id="idea-menu-${i.id}" class="hidden absolute right-0 top-6 bg-white border border-gray-200 rounded-xl shadow-lg p-1.5 z-20 space-y-1 w-44 text-[11px]">
                        <button onclick="window.openEditIdea(${i.id})" class="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-gray-800 font-medium">✏️ Bewerken</button>
                        <button onclick="window.ideaToPlan(${i.id})" class="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-indigo-700 font-medium">🎯 Naar Planbord</button>
                        <button onclick="window.ideaToProject(${i.id})" class="w-full text-left px-2 py-1 hover:bg-gray-50 rounded text-purple-700 font-medium">🚀 Maak Project</button>
                        <button onclick="window.deleteIdea(${i.id})" class="w-full text-left px-2 py-1 hover:bg-red-50 rounded text-red-600 font-medium">✕ Niet relevant</button>
                    </div>
                </div>
            </div>
            <p class="text-gray-900 font-medium leading-relaxed">${i.text}</p>
            <span class="text-[10px] text-gray-400 block">📅 ${new Date(i.date).toLocaleDateString('nl-NL')}</span>
        </div>
    `).join('');

    if (ideas.length > 5) {
        moreContainer.innerHTML = `<button id="toggle-more-ideas" class="text-[11px] text-indigo-600 font-semibold hover:underline">${showAllIdeas ? 'Minder weergeven' : `+ ${ideas.length - 5} meer weergeven...`}</button>`;
        document.getElementById('toggle-more-ideas').onclick = () => {
            window._showAllIdeas = !showAllIdeas;
            renderIdeasViews(appData);
        };
    } else {
        moreContainer.innerHTML = '';
    }

    // Toggle 3-puntjes menu
    window.toggleIdeaMenu = (id) => {
        // Sluit eerst alle andere menus
        document.querySelectorAll('[id^="idea-menu-"]').forEach(el => {
            if (el.id !== `idea-menu-${id}`) el.classList.add('hidden');
        });
        document.getElementById(`idea-menu-${id}`).classList.toggle('hidden');
    };

    window.openEditIdea = (id) => {
        const i = ideas.find(x => x.id === id);
        if (i) {
            document.getElementById('edit-idea-id').value = i.id;
            document.getElementById('edit-idea-text-input').value = i.text;
            
            const catSelect = document.getElementById('edit-idea-cat');
            const cats = ideasMod.categories || DEFAULT_IDEA_CATEGORIES;
            catSelect.innerHTML = cats.map(c => `<option value="${c}" ${c === i.category ? 'selected' : ''}>${c}</option>`).join('');

            document.getElementById('edit-idea-modal').classList.remove('hidden');
        }
    };

    window.ideaToPlan = (id) => {
        const i = ideas.find(x => x.id === id);
        if (i) {
            if (!appData.plans) appData.plans = { tasks: [], categories: [], archivedTasks: [] };
            if (!appData.plans.tasks) appData.plans.tasks = [];
            appData.plans.tasks.push({ id: Date.now(), text: i.text, category: i.category || 'Privé', priority: 'Normaal', completed: false, date: new Date().toISOString() });
            saveAppData(appData);
            showToast("Idee overgezet naar het planbord! 🎯");
        }
    };

    window.ideaToProject = (id) => {
        const i = ideas.find(x => x.id === id);
        if (i) {
            if (!ideasMod.projects) ideasMod.projects = [];
            ideasMod.projects.push({ id: Date.now(), name: i.text, status: 'Lopend', date: new Date().toISOString() });
            saveAppData(appData);
            renderIdeasViews(appData);
            showToast("Idee omgezet naar Project! 🚀");
        }
    };

    window.deleteIdea = (id) => {
        ideasMod.ideas = ideasMod.ideas.filter(x => x.id !== id);
        saveAppData(appData);
        renderIdeasViews(appData);
        showToast("Idee verwijderd.");
    };

    // Render Projecten Hub
    const projContainer = document.getElementById('projects-list');
    const projects = ideasMod.projects || [];
    projContainer.innerHTML = projects.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen actieve projecten.</p>' : projects.map(p => `
        <div class="flex justify-between items-center p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
            <div>
                <span class="font-bold text-indigo-950">${p.name}</span>
                <span class="text-[10px] text-gray-400 block">${new Date(p.date).toLocaleDateString('nl-NL')}</span>
            </div>
            <button onclick="window.deleteProjectIdea(${p.id})" class="text-red-400 font-bold hover:text-red-600 px-1">✕</button>
        </div>
    `).join('');

    window.deleteProjectIdea = (id) => {
        ideasMod.projects = ideasMod.projects.filter(x => x.id !== id);
        saveAppData(appData);
        renderIdeasViews(appData);
        showToast("Project verwijderd.");
    };
}
