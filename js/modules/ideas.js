// js/modules/ideas.js
import { saveAppData } from './storage.js';

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
        <!-- 1. Ideeënkluis & Post-its -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">📌 Ideeënkluis & Post-its</h2>
                <div class="flex gap-2">
                    <button id="manage-idea-categories-btn" class="text-xs text-indigo-600 hover:underline">Categorieën</button>
                    <button id="open-all-ideas-modal" class="text-xs text-indigo-600 hover:underline font-medium">Alle Post-its</button>
                </div>
            </div>
            <p class="text-xs text-gray-500 mb-3">Schrijf je gedachten van je af en laat ze rustig sudderen.</p>
            
            <form id="idea-form" class="space-y-2 mb-3">
                <textarea id="idea-text" rows="3" placeholder="Typ een willekeurig idee of wilde gedachte..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500" required></textarea>
                <div class="grid grid-cols-2 gap-2">
                    <select id="idea-cat" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white"></select>
                    <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Prik op het bord 📌</button>
                </div>
            </form>

            <div id="idea-grid" class="grid grid-cols-1 gap-2.5"></div>
        </div>

        <!-- 2. Projecten-Hub -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🚀 Projecten-Hub</h2>
                <button id="open-project-modal-btn" class="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">+ Nieuw Project</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Zet spontane post-its om in gestructureerde projecten.</p>
            
            <div id="project-list" class="space-y-3"></div>
        </div>
    `;

    initIdeasModals(appData);
    initIdeasLogic(appData);
}

function initIdeasModals(appData) {
    // 1. Modal voor Alle Post-its / Archief
    const allIdeasModalHTML = `
        <div id="all-ideas-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">📚 Alle Post-its in Kluis & Archief</h3>
                    <button id="close-all-ideas-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <div class="flex flex-col gap-2 bg-gray-50 p-2.5 rounded-xl border">
                    <input type="text" id="modal-idea-search" placeholder="Live zoeken in ideeën..." class="w-full px-3 py-2 text-xs bg-white border rounded-xl">
                    <div class="flex gap-2">
                        <select id="modal-idea-cat-filter" class="flex-1 px-2 py-1.5 text-xs bg-white border rounded-xl">
                            <option value="Alle">Alle categorieën</option>
                        </select>
                        <button id="toggle-idea-archive-view" class="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-xl">Archief weergeven</button>
                    </div>
                </div>
                <ul id="modal-all-ideas-list" class="space-y-2 text-xs"></ul>
            </div>
        </div>
    `;

    // 2. Modal voor Project toevoegen
    const projectModalHTML = `
        <div id="idea-project-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">🚀 Nieuw Project vanuit Idee</h3>
                    <button id="close-idea-project-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form id="idea-project-form" class="space-y-3 text-xs">
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
                        <label class="block font-semibold text-gray-600 mb-1">Subtaksen (komma-gescheiden)</label>
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

    // 3. Modal voor Post-it Bewerken
    const editIdeaModalHTML = `
        <div id="edit-idea-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-base font-bold text-indigo-950">✏️ Post-it Bewerken</h3>
                    <button id="close-edit-idea-modal" class="text-gray-400 hover:text-gray-600 text-lg">✕</button>
                </div>
                <form id="edit-idea-form" class="space-y-3 text-xs">
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

    document.body.insertAdjacentHTML('beforeend', allIdeasModalHTML + projectModalHTML + editIdeaModalHTML);

    const allModal = document.getElementById('all-ideas-modal');
    document.getElementById('open-all-ideas-modal').onclick = () => {
        allModal.classList.remove('hidden');
        renderModalAllIdeas(appData);
    };
    document.getElementById('close-all-ideas-modal').onclick = () => allModal.classList.add('hidden');

    const projModal = document.getElementById('idea-project-modal');
    document.getElementById('open-project-modal-btn').onclick = () => projModal.classList.remove('hidden');
    document.getElementById('close-idea-project-modal').onclick = () => projModal.classList.add('hidden');
    document.getElementById('cancel-idea-project-modal').onclick = () => projModal.classList.add('hidden');

    const editModal = document.getElementById('edit-idea-modal');
    document.getElementById('close-edit-idea-modal').onclick = () => editModal.classList.add('hidden');
    document.getElementById('cancel-edit-idea-modal').onclick = () => editModal.classList.add('hidden');

    document.getElementById('idea-project-form').onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('modal-proj-title').value.trim();
        const description = document.getElementById('modal-proj-desc').value.trim();
        const timeGoal = document.getElementById('modal-proj-time').value.trim();
        const subRaw = document.getElementById('modal-proj-subtasks').value.trim();
        const subtasks = subRaw ? subRaw.split(',').map(s => ({ text: s.trim(), completed: false })) : [];

        if (title) {
            if (!appData.ideasModule.projects) appData.ideasModule.projects = [];
            appData.ideasModule.projects.push({ id: Date.now(), title, description, timeGoal, subtasks, date: new Date().toISOString() });
            saveAppData(appData);
            projModal.classList.add('hidden');
            e.target.reset();
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

    document.getElementById('manage-idea-categories-btn').onclick = () => {
        const action = prompt("Wil je een categorie Toevoegen of Verwijderen? Typ 'toevoegen' of 'verwijderen':");
        if (action && action.toLowerCase() === 'toevoegen') {
            const cat = prompt("Naam van nieuwe categorie:");
            if (cat && !ideasMod.categories.includes(cat)) {
                ideasMod.categories.push(cat);
                saveAppData(appData);
                updateIdeaCategoryDropdowns(ideasMod);
            }
        } else if (action && action.toLowerCase() === 'verwijderen') {
            const cat = prompt(`Welke categorie verwijderen? (${ideasMod.categories.join(', ')})`);
            if (cat && ideasMod.categories.includes(cat)) {
                ideasMod.categories = ideasMod.categories.filter(c => c !== cat);
                saveAppData(appData);
                updateIdeaCategoryDropdowns(ideasMod);
            }
        }
    };

    document.getElementById('idea-form').onsubmit = (e) => {
        e.preventDefault();
        const text = document.getElementById('idea-text').value.trim();
        const category = document.getElementById('idea-cat').value;
        if (text) {
            ideasMod.ideas.push({ id: Date.now(), text, category, date: new Date().toISOString() });
            saveAppData(appData);
            e.target.reset();
            renderIdeasView(appData);
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

function renderIdeasView(appData) {
    const grid = document.getElementById('idea-grid');
    const ideas = (appData.ideasModule.ideas || []).filter(i => !i.archived);

    grid.innerHTML = ideas.length === 0 ? '<p class="text-xs text-gray-400 italic">Nog geen post-its op het bord.</p>' : ideas.slice(-5).reverse().map(i => {
        const isLong = i.text.length > 90;
        const shortText = isLong ? i.text.slice(0, 90) + '...' : i.text;
        return `
            <div id="idea-card-${i.id}" class="p-3.5 bg-yellow-50/90 border border-yellow-200 rounded-xl relative flex flex-col gap-1.5 shadow-sm">
                <div class="flex justify-between items-start">
                    <span class="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">[${i.category}]</span>
                    <span class="text-[10px] text-gray-400">${new Date(i.date).toLocaleDateString('nl-NL')}</span>
                </div>
                <p id="idea-text-content-${i.id}" class="text-xs text-gray-800 leading-relaxed">${shortText}</p>
                ${isLong ? `<button onclick="window.toggleExpandIdea(${i.id}, \`${encodeURIComponent(i.text)}\`)" id="expand-btn-${i.id}" class="text-[11px] font-semibold text-amber-900 underline text-left">Uitvouwen</button>` : ''}
                <div class="flex gap-3 pt-1 text-[11px] font-semibold text-indigo-700">
                    <button onclick="window.ideaToPlan(${i.id})" class="hover:underline">Naar Planbord</button>
                    <button onclick="window.openEditIdeaModal(${i.id})" class="hover:underline">Bewerken</button>
                    <button onclick="window.archiveIdea(${i.id})" class="text-gray-400 hover:text-red-500 ml-auto">Archiveren</button>
                </div>
            </div>
        `;
    }).join('');

    window.toggleExpandIdea = (id, encodedText) => {
        const textEl = document.getElementById(`idea-text-content-${id}`);
        const btnEl = document.getElementById(`expand-btn-${id}`);
        const fullText = decodeURIComponent(encodedText);
        if (btnEl.textContent === 'Uitvouwen') {
            textEl.textContent = fullText;
            btnEl.textContent = 'Inklappen';
        } else {
            textEl.textContent = fullText.slice(0, 90) + '...';
            btnEl.textContent = 'Uitvouwen';
        }
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

        listEl.innerHTML = filtered.length === 0 ? '<p class="text-gray-400 italic">Geen ideeën gevonden.</p>' : filtered.map(i => `
            <li class="p-3 bg-gray-50 border rounded-xl flex justify-between items-center">
                <div>
                    <span class="font-bold text-indigo-900">[${i.category}]</span> ${i.text}
                    <span class="text-[10px] text-gray-400 block">${new Date(i.date).toLocaleDateString('nl-NL')}</span>
                </div>
                ${showArchived ? `
                    <button onclick="window.restoreIdeaModal(${i.id})" class="text-indigo-600 font-semibold">Terugzetten</button>
                ` : `
                    <button onclick="window.archiveIdeaModal(${i.id})" class="text-red-500">Archiveren</button>
                `}
            </li>
        `).join('');
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
        <div class="p-3.5 bg-gray-50 border rounded-xl space-y-2 text-xs">
            <div class="flex justify-between items-center">
                <span class="font-bold text-indigo-950 text-sm">📁 ${p.title}</span>
                <button onclick="window.archiveProject(${p.id})" class="text-gray-400 hover:text-red-500">Archiveren</button>
            </div>
            ${p.description ? `<p class="text-gray-600">${p.description}</p>` : ''}
            ${p.timeGoal ? `<p class="text-[11px] text-indigo-700 font-medium">⏱️ Planning: ${p.timeGoal}</p>` : ''}
            ${p.subtasks && p.subtasks.length > 0 ? `
                <div class="space-y-1 pt-1 border-t">
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

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-950 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg z-50 transition transform duration-300';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
