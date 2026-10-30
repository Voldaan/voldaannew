// js/modules/ideas.js
import { saveAppData, showToast } from './storage.js';

const DEFAULT_IDEA_CATEGORIES = ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'];

const CATEGORY_COLORS = {
    'Algemeen': { bg: 'bg-slate-50/90', border: 'border-slate-200', badgeBg: 'bg-slate-100', badgeText: 'text-slate-700' },
    'Voldaan': { bg: 'bg-amber-50/90', border: 'border-amber-200', badgeBg: 'bg-amber-100', badgeText: 'text-amber-800' },
    'Creatief': { bg: 'bg-purple-50/90', border: 'border-purple-200', badgeBg: 'bg-purple-100', badgeText: 'text-purple-800' },
    'Werk / Studie': { bg: 'bg-sky-50/90', border: 'border-sky-200', badgeBg: 'bg-sky-100', badgeText: 'text-sky-800' },
    'Privé / Thuis': { bg: 'bg-emerald-50/90', border: 'border-emerald-200', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-800' }
};

function getCategoryColorStyle(category) {
    if (CATEGORY_COLORS[category]) {
        return CATEGORY_COLORS[category];
    }
    return { bg: 'bg-rose-50/90', border: 'border-rose-200', badgeBg: 'bg-rose-100', badgeText: 'text-rose-800' };
}

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
        <div class="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(99,102,241,0.15)] border border-indigo-200/80 mb-4 transition-all">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">📌 Ideeënkluis & Post-its</h2>
                <div class="flex gap-2">
                    <button id="open-idea-cat-manager" class="text-xs text-indigo-600 hover:underline">Categorieën</button>
                    <button id="open-all-ideas-modal" class="text-xs text-indigo-600 hover:underline font-medium">Beheer & Archief</button>
                </div>
            </div>
            <p class="text-xs text-gray-500 mb-3">Schrijf je gedachten van je af en laat ze rustig sudderen.</p>
            
            <div id="idea-cat-manager-box" class="hidden mb-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2 text-xs">
                <p class="font-bold text-indigo-950">Categorieën Beheren</p>
                <div class="flex gap-2">
                    <input type="text" id="new-idea-cat-input" placeholder="Nieuwe categorie..." class="flex-1 px-3 py-1.5 bg-white border rounded-xl">
                    <button id="add-idea-cat-submit" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen</button>
                </div>
                <div id="idea-category-chips-list" class="flex flex-wrap gap-1.5 pt-1"></div>
            </div>

            <form id="idea-form" class="space-y-2 mb-3">
                <textarea id="idea-text" rows="3" placeholder="Typ een willekeurig idee of wilde gedachte..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" required></textarea>
                <div class="grid grid-cols-2 gap-2">
                    <select id="idea-cat" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"></select>
                    <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">Prik op het bord 📌</button>
                </div>
            </form>

            <div id="idea-grid" class="grid grid-cols-1 gap-2.5 mb-2"></div>
            <div id="idea-expand-toggle-container" class="text-center"></div>
        </div>

        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🚀 Projecten-Hub</h2>
                <button id="open-project-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">+ Nieuw Project</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Zet spontane post-its om in gestructureerde projecten.</p>
            
            <div id="project-list" class="space-y-3"></div>
        </div>
    `;

    initIdeasModals(appData);
    initIdeasLogic(appData);
}

function initIdeasModals(appData) {
    const allIdeasModalHTML = `
        <div id="all-ideas-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">📚 Alle Post-its in Kluis & Archief</h3>
                    <button id="close-all-ideas-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <div class="flex flex-col gap-2 bg-gray-50 p-2.5 rounded-xl border">
                    <input type="text" id="modal-idea-search" placeholder="Live zoeken in ideeën..." class="w-full px-3 py-2 bg-white border rounded-xl">
                    <div class="flex gap-2">
                        <select id="modal-idea-cat-filter" class="flex-1 px-2 py-1.5 bg-white border rounded-xl">
                            <option value="Alle">Alle categorieën</option>
                        </select>
                        <button id="toggle-idea-archive-view" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-semibold rounded-xl">Archief weergeven</button>
                    </div>
                </div>
                <ul id="modal-all-ideas-list" class="space-y-2"></ul>
            </div>
        </div>
    `;

    const projectModalHTML = `
        <div id="idea-project-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🚀 Nieuw Project vanuit Idee</h3>
                    <button id="close-idea-project-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="idea-project-form" class="space-y-3">
                    <input type="hidden" id="modal-proj-source-id">
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
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Subtaken (komma-gescheiden)</label>
                        <input type="text" id="modal-proj-subtasks" placeholder="Stap 1, Stap 2, Stap 3" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-idea-project-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Project Aanmaken ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    const editIdeaModalHTML = `
        <div id="edit-idea-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">✏️ Post-it Bewerken</h3>
                    <button id="close-edit-idea-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="edit-idea-form" class="space-y-3">
                    <input type="hidden" id="edit-idea-id">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Tekst</label>
                        <textarea id="edit-idea-text" rows="4" class="w-full px-3 py-2 border rounded-xl" required></textarea>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Categorie</label>
                        <select id="edit-idea-cat" class="w-full px-3 py-2 border rounded-xl bg-white"></select>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-edit-idea-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Opslaan ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    if (!document.getElementById('all-ideas-modal')) {
        document.body.insertAdjacentHTML('beforeend', allIdeasModalHTML + projectModalHTML + editIdeaModalHTML);
    }

    const allModal = document.getElementById('all-ideas-modal');
    document.getElementById('open-all-ideas-modal').onclick = () => {
        allModal.classList.remove('hidden');
        renderModalAllIdeas(appData);
    };
    document.getElementById('close-all-ideas-modal').onclick = () => allModal.classList.add('hidden');

    const projModal = document.getElementById('idea-project-modal');
    document.getElementById('open-project-modal-btn').onclick = () => {
        document.getElementById('modal-proj-source-id').value = '';
        document.getElementById('idea-project-form').reset();
        projModal.classList.remove('hidden');
    };
    document.getElementById('close-idea-project-modal').onclick = () => projModal.classList.add('hidden');
    document.getElementById('cancel-idea-project-modal').onclick = () => projModal.classList.add('hidden');

    const editModal = document.getElementById('edit-idea-modal');
    document.getElementById('close-edit-idea-modal').onclick = () => editModal.classList.add('hidden');
    document.getElementById('cancel-edit-idea-modal').onclick = () => editModal.classList.add('hidden');

    document.getElementById('idea-project-form').onsubmit = (e) => {
        e.preventDefault();
        const sourceId = document.getElementById('modal-proj-source-id').value;
        const title = document.getElementById('modal-proj-title').value.trim();
        const description = document.getElementById('modal-proj-desc').value.trim();
        const timeGoal = document.getElementById('modal-proj-time').value.trim();
        const subRaw = document.getElementById('modal-proj-subtasks').value.trim();
        const subtasks = subRaw ? subRaw.split(',').map(s => ({ text: s.trim(), completed: false })) : [];

        if (title) {
            if (!appData.ideasModule.projects) appData.ideasModule.projects = [];
            appData.ideasModule.projects.push({ id: Date.now(), title, description, timeGoal, subtasks, date: new Date().toISOString() });
            
            if (sourceId) {
                const item = appData.ideasModule.ideas.find(x => x.id == sourceId);
                if (item) {
                    appData.ideasModule.ideas = appData.ideasModule.ideas.filter(x => x.id != sourceId);
                    if (!appData.ideasModule.archivedIdeas) appData.ideasModule.archivedIdeas = [];
                    appData.ideasModule.archivedIdeas.push(item);
                }
            }

            saveAppData(appData);
            projModal.classList.add('hidden');
            e.target.reset();
            renderIdeasView(appData);
            renderProjectsView(appData);
            showToast("Project succesvol aangemaakt! 🚀");
        }
    };

    document.getElementById('edit-idea-form').onsubmit = (e) => {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-idea-id').value);
        const text = document.getElementById('edit-idea-text').value.trim();
        const category = document.getElementById('edit-idea-cat').value;
        const item = appData.ideasModule.ideas.find(i => i.id === id);
        if (item && text) {
            item.text = text;
            item.category = category;
            saveAppData(appData);
            editModal.classList.add('hidden');
            renderIdeasView(appData);
            showToast("Post-it bijgewerkt! ✏️");
        }
    };
}

function initIdeasLogic(appData) {
    const ideasMod = appData.ideasModule;
    updateIdeaCategoryDropdowns(ideasMod);

    const catBox = document.getElementById('idea-cat-manager-box');
    document.getElementById('open-idea-cat-manager').onclick = () => {
        catBox.classList.toggle('hidden');
        renderIdeaCategoryChips(appData);
    };

    document.getElementById('add-idea-cat-submit').onclick = () => {
        const input = document.getElementById('new-idea-cat-input');
        const val = input.value.trim();
        if (val && !ideasMod.categories.includes(val)) {
            ideasMod.categories.push(val);
            saveAppData(appData);
            updateIdeaCategoryDropdowns(ideasMod);
            renderIdeaCategoryChips(appData);
            input.value = '';
        }
    };

    document.getElementById('idea-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('idea-text').value.trim();
        const category = document.getElementById('idea-cat').value;
        if (text) {
            if (!appData.ideasModule.ideas) appData.ideasModule.ideas = [];
            appData.ideasModule.ideas.push({ id: Date.now(), text, category, date: new Date().toISOString() });
            saveAppData(appData); // Sla direct op in localStorage via storage.js
            e.target.reset();
            renderIdeasView(appData);
            showToast("Post-it toegevoegd! 📌");
        }
    };

    renderIdeasView(appData);
    renderProjectsView(appData);
}

function updateIdeaCategoryDropdowns(ideasMod) {
    const catSelect = document.getElementById('idea-cat');
    const modalCatFilter = document.getElementById('modal-idea-cat-filter');
    const editCatSelect = document.getElementById('edit-idea-cat');
    if (!catSelect) return;

    const cats = ideasMod.categories || DEFAULT_IDEA_CATEGORIES;
    catSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    if (modalCatFilter) {
        modalCatFilter.innerHTML = `<option value="Alle">Alle categorieën</option>` + cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
    if (editCatSelect) {
        editCatSelect.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

function renderIdeaCategoryChips(appData) {
    const chipsList = document.getElementById('idea-category-chips-list');
    if (!chipsList) return;
    const cats = appData.ideasModule.categories || DEFAULT_IDEA_CATEGORIES;
    chipsList.innerHTML = cats.map(c => `
        <span class="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-indigo-900 font-medium text-[11px]">
            ${c}
            ${cats.length > 1 ? `<button onclick="window.removeIdeaCategory('${c}')" class="text-red-400 hover:text-red-600 font-bold ml-1">✕</button>` : ''}
        </span>
    `).join('');

    window.removeIdeaCategory = (catName) => {
        appData.ideasModule.categories = appData.ideasModule.categories.filter(c => c !== catName);
        saveAppData(appData);
        updateIdeaCategoryDropdowns(appData.ideasModule);
        renderIdeaCategoryChips(appData);
    };
}

let showAllIdeas = false;

function renderIdeasView(appData) {
    const grid = document.getElementById('idea-grid');
    const toggleContainer = document.getElementById('idea-expand-toggle-container');
    const ideas = (appData.ideasModule.ideas || []).filter(i => !i.archived);
    
    const displayIdeas = showAllIdeas ? ideas.slice().reverse() : ideas.slice(-5).reverse();

    grid.innerHTML = displayIdeas.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen post-its op het bord.</p>' : displayIdeas.map(i => {
        const colors = getCategoryColorStyle(i.category);
        return `
            <div class="p-3.5 ${colors.bg} border ${colors.border} rounded-xl relative flex flex-col gap-1.5 shadow-sm transition-all">
                <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold ${colors.badgeText} ${colors.badgeBg} px-2 py-0.5 rounded-full">[${i.category}]</span>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] text-gray-400">${new Date(i.date).toLocaleDateString('nl-NL')}</span>
                        <div class="relative">
                            <button onclick="window.toggleIdeaMenu(${i.id})" class="text-gray-500 hover:text-gray-800 font-bold px-1 text-sm">⋮</button>
                            <div id="idea-menu-${i.id}" class="hidden absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1 text-xs">
                                <button onclick="window.openEditIdeaModal(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700">✏️ Bewerken</button>
                                <button onclick="window.ideaToPlan(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-indigo-700">🎯 Naar Planbord</button>
                                <button onclick="window.ideaToProject(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-indigo-700">🚀 Maak Project</button>
                                <button onclick="window.archiveIdea(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-amber-700">📦 Niet meer relevant</button>
                                <button onclick="window.deleteIdea(${i.id})" class="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-red-600">🗑️ Verwijderen</button>
                            </div>
                        </div>
                    </div>
                </div>
                <p class="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">${i.text}</p>
            </div>
        `;
    }).join('');

    if (ideas.length > 5) {
        toggleContainer.innerHTML = `<button onclick="window.toggleShowAllIdeas()" class="text-xs text-indigo-600 font-semibold underline mt-1">${showAllIdeas ? 'Minder weergeven (max 5)' : `Alles weergeven (${ideas.length} post-its)`}</button>`;
    } else {
        toggleContainer.innerHTML = '';
    }

    window.toggleShowAllIdeas = () => {
        showAllIdeas = !showAllIdeas;
        renderIdeasView(appData);
    };

    window.toggleIdeaMenu = (id) => {
        document.querySelectorAll('[id^="idea-menu-"]').forEach(el => {
            if (el.id !== `idea-menu-${id}`) el.classList.add('hidden');
        });
        const menu = document.getElementById(`idea-menu-${id}`);
        if (menu) menu.classList.toggle('hidden');
    };

    window.openEditIdeaModal = (id) => {
        const item = appData.ideasModule.ideas.find(x => x.id === id);
        if (item) {
            document.getElementById('edit-idea-id').value = item.id;
            document.getElementById('edit-idea-text').value = item.text;
            document.getElementById('edit-idea-cat').value = item.category;
            document.getElementById('edit-idea-modal').classList.remove('hidden');
        }
    };

    window.ideaToPlan = (id) => {
        const item = appData.ideasModule.ideas.find(x => x.id === id);
        if (item) {
            if (!appData.plans) appData.plans = { tasks: [] };
            if (!appData.plans.tasks) appData.plans.tasks = [];
            appData.plans.tasks.push({ id: Date.now(), text: item.text, category: item.category, priority: 'Normaal', completed: false, date: new Date().toISOString() });
            saveAppData(appData);
            showToast("Idee overgebracht naar het Planbord! 🎯");
        }
    };

    window.ideaToProject = (id) => {
        const item = appData.ideasModule.ideas.find(x => x.id === id);
        if (item) {
            document.getElementById('modal-proj-source-id').value = item.id;
            document.getElementById('modal-proj-title').value = item.text.slice(0, 40);
            document.getElementById('modal-proj-desc').value = item.text;
            document.getElementById('idea-project-modal').classList.remove('hidden');
        }
    };

    window.archiveIdea = (id) => {
        const item = appData.ideasModule.ideas.find(x => x.id === id);
        if (item) {
            appData.ideasModule.ideas = appData.ideasModule.ideas.filter(x => x.id !== id);
            if (!appData.ideasModule.archivedIdeas) appData.ideasModule.archivedIdeas = [];
            appData.ideasModule.archivedIdeas.push(item);
            saveAppData(appData);
            renderIdeasView(appData);
            showToast("Post-it gearchiveerd.");
        }
    };

    window.deleteIdea = (id) => {
        if (confirm("Weet je zeker dat je deze post-it definitief wilt verwijderen?")) {
            appData.ideasModule.ideas = appData.ideasModule.ideas.filter(x => x.id !== id);
            saveAppData(appData);
            renderIdeasView(appData);
            showToast("Post-it verwijderd.");
        }
    };
}

function renderModalAllIdeas(appData) {
    const listEl = document.getElementById('modal-all-ideas-list');
    const searchInput = document.getElementById('modal-idea-search');
    const catFilter = document.getElementById('modal-idea-cat-filter');
    const toggleArchiefBtn = document.getElementById('toggle-idea-archive-view');
    let showArchived = false;

    function draw() {
        const ideasMod = appData.ideasModule;
        const pool = showArchived ? (ideasMod.archivedIdeas || []) : (ideasMod.ideas || []);
        const query = searchInput.value.toLowerCase();
        const selCat = catFilter.value;
        const filtered = pool.filter(i => i.text.toLowerCase().includes(query) && (selCat === 'Alle' || i.category === selCat));

        listEl.innerHTML = filtered.length === 0 ? '<p class="text-gray-400 italic">Geen ideeën gevonden.</p>' : filtered.map(i => {
            const colors = getCategoryColorStyle(i.category);
            return `
                <li class="p-3 ${colors.bg} border ${colors.border} rounded-xl flex justify-between items-center">
                    <div>
                        <span class="font-bold ${colors.badgeText}">[${i.category}]</span> ${i.text}
                        <span class="text-[10px] text-gray-400 block">${new Date(i.date).toLocaleDateString('nl-NL')}</span>
                    </div>
                    ${showArchived ? `
                        <button onclick="window.restoreIdeaModal(${i.id})" class="text-indigo-600 font-semibold">Terugzetten</button>
                    ` : `
                        <button onclick="window.archiveIdeaModal(${i.id})" class="text-red-500 font-semibold">Archiveren</button>
                    `}
                </li>
            `;
        }).join('');
    }

    searchInput.oninput = draw;
    catFilter.onchange = draw;
    toggleArchiefBtn.onclick = () => {
        showArchived = !showArchived;
        toggleArchiefBtn.textContent = showArchived ? "Actieve Post-its weergeven" : "Archief weergeven";
        draw();
    };

    window.archiveIdeaModal = (id) => {
        const item = appData.ideasModule.ideas.find(x => x.id === id);
        if (item) {
            appData.ideasModule.ideas = appData.ideasModule.ideas.filter(x => x.id !== id);
            if (!appData.ideasModule.archivedIdeas) appData.ideasModule.archivedIdeas = [];
            appData.ideasModule.archivedIdeas.push(item);
            saveAppData(appData);
            draw();
            renderIdeasView(appData);
        }
    };

    window.restoreIdeaModal = (id) => {
        const item = appData.ideasModule.archivedIdeas.find(x => x.id === id);
        if (item) {
            appData.ideasModule.archivedIdeas = appData.ideasModule.archivedIdeas.filter(x => x.id !== id);
            appData.ideasModule.ideas.push(item);
            saveAppData(appData);
            draw();
            renderIdeasView(appData);
        }
    };

    draw();
}

function renderProjectsView(appData) {
    const listEl = document.getElementById('project-list');
    const projects = (appData.ideasModule.projects || []).filter(p => !p.archived);

    listEl.innerHTML = projects.length === 0 ? '<p class="text-xs text-gray-400 italic">Geen actieve projecten.</p>' : projects.map(p => `
        <div class="p-3.5 bg-gray-50 border border-indigo-100 rounded-xl space-y-2 text-xs">
            <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-950 text-sm">📁 ${p.title}</span>
                <button onclick="window.archiveProject(${p.id})" class="text-gray-400 hover:text-red-500 font-bold">Archiveren</button>
            </div>
            ${p.description ? `<p class="text-gray-600">${p.description}</p>` : ''}
            ${p.timeGoal ? `<p class="text-[11px] text-indigo-700 font-medium">⏱️ Planning: ${p.timeGoal}</p>` : ''}
            ${p.subtasks && p.subtasks.length > 0 ? `
                <div class="space-y-1 pt-1 border-t border-gray-200">
                    <p class="font-semibold text-gray-700">Subtaken:</p>
                    ${p.subtasks.map((st, idx) => `
                        <div class="flex items-center gap-2">
                            <input type="checkbox" ${st.completed ? 'checked' : ''} onchange="window.toggleSubtask(${p.id}, ${idx})">
                            <span class="${st.completed ? 'line-through text-gray-400' : ''}">${st.text}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `).join('');

    window.toggleSubtask = (projId, subIdx) => {
        const proj = appData.ideasModule.projects.find(x => x.id === projId);
        if (proj && proj.subtasks[subIdx]) {
            proj.subtasks[subIdx].completed = !proj.subtasks[subIdx].completed;
            saveAppData(appData);
            renderProjectsView(appData);
        }
    };

    window.archiveProject = (id) => {
        const proj = appData.ideasModule.projects.find(x => x.id === id);
        if (proj) {
            appData.ideasModule.projects = appData.ideasModule.projects.filter(x => x.id !== id);
            if (!appData.ideasModule.archivedProjects) appData.ideasModule.archivedProjects = [];
            appData.ideasModule.archivedProjects.push(proj);
            saveAppData(appData);
            renderProjectsView(appData);
            showToast("Project gearchiveerd.");
        }
    };
}