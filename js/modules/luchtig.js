// js/modules/luchtig.js
import { saveAppData, showToast } from './storage.js';

const DEFAULT_PLAYLISTS = [
    { id: 1, title: "Lofi Beats & Focus", desc: "Rustige beats om zachtjes door te werken of te ontprikkelen.", link: "https://open.spotify.com" },
    { id: 2, title: "Podcast: Rust in je Hoofd", desc: "Inspirerende verhalen en handige handvatten voor meer structuur.", link: "https://open.spotify.com" },
    { id: 3, title: "Vrolijke Vibe & Klassiekers", desc: "Goede energie zonder dat het te hard binnenkomt.", link: "https://open.spotify.com" }
];

const DEFAULT_NEWS_SOURCES = [
    { name: "Alles", url: "ALL" },
    { name: "3voor12", url: "https://3voor12.vpro.nl/rss.xml" }, // Gecorrigeerde werkende RSS feed url
    { name: "OOR", url: "https://oor.nl/feed/" },
    { name: "Blues Magazine", url: "https://www.bluesmagazine.nl/feed/" },
    { name: "MusicMeter", url: "https://www.musicmeter.nl/rss/" },
    { name: "Podiuminfo", url: "https://www.podiuminfo.nl/rss/nieuws.xml" },
    { name: "Festivalinfo", url: "https://www.festivalinfo.nl/rss/nieuws.xml" },
    { name: "Maxazine", url: "https://www.maxazine.nl/feed/" },
    { name: "Pitchfork", url: "https://pitchfork.com/feed/feed-news/rss" },
    { name: "AllMusic", url: "https://www.allmusic.com/rss" }
];

export function initLuchtigModule(appData) {
    const container = document.getElementById('luchtig');
    if (!container) return;

    if (!appData.luchtig) {
        appData.luchtig = { 
            customPlaylists: [...DEFAULT_PLAYLISTS], 
            newsSources: [...DEFAULT_NEWS_SOURCES],
            userLink: '', 
            discogsUser: '', 
            sudokuGame: null, 
            activeNewsSource: 'Alles',
            discogsTab: 'collection' 
        };
    }
    if (!appData.luchtig.newsSources) {
        appData.luchtig.newsSources = [...DEFAULT_NEWS_SOURCES];
    }
    if (!appData.luchtig.customPlaylists) {
        appData.luchtig.customPlaylists = [...DEFAULT_PLAYLISTS];
    }

    const hasDiscogsUser = Boolean(appData.luchtig.discogsUser);
    const currentSource = appData.luchtig.activeNewsSource || 'Alles';
    const sources = appData.luchtig.newsSources;
    const currentDiscogsTab = appData.luchtig.discogsTab || 'collection';

    container.innerHTML = `
        <!-- 1. volDaan Draait Luisteromgeving -->
        <div class="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-5 rounded-2xl shadow-sm border border-emerald-200/80 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🎧</span>
                    <h2 class="text-base font-bold text-emerald-950">volDaan Draait</h2>
                </div>
                <div class="flex gap-2">
                    <button id="open-playlist-modal" class="text-xs text-emerald-700 hover:underline font-semibold">+ Toevoegen</button>
                    <button id="open-playlists-beheer" class="text-xs text-indigo-700 hover:underline font-semibold">Beheer ⚙️</button>
                </div>
            </div>
            <p class="text-xs text-gray-600 mb-3">Jouw favoriete luisteromgeving.</p>
            
            <div id="featured-player-box" class="p-3.5 bg-white border border-emerald-200 rounded-xl mb-3 shadow-xs space-y-2"></div>
            <div id="playlists-container" class="space-y-2"></div>
        </div>

        <!-- 2. Live Muziek- en Festivalnieuws Hub -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <h2 class="text-base font-bold text-indigo-900">🎸 Muziek- & Festivalnieuws</h2>
                <div class="flex gap-2">
                    <button id="open-news-beheer" class="text-xs text-indigo-700 hover:underline font-semibold">Beheer ⚙️</button>
                    <button id="refresh-news-btn" class="text-xs text-indigo-600 hover:underline font-semibold">Ververs 🔄</button>
                </div>
            </div>
            <p class="text-xs text-gray-500 mb-3">Het laatste nieuws, tournee-aankondigingen en recensies.</p>
            
            <div class="flex flex-wrap gap-1.5 mb-3" id="news-sources-tabs">
                ${sources.map(src => `
                    <button data-source="${src.name}" class="news-tab-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                        currentSource === src.name ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }">${src.name}</button>
                `).join('')}
            </div>

            <div id="music-news-container" class="space-y-2 max-h-80 overflow-y-auto pr-1">
                <p class="text-xs text-gray-400 italic text-center py-4">Nieuws ophalen...</p>
            </div>
        </div>

        <!-- 3. volDaan Draait Vinyl (Met zichtbaar vinyl icoontje) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <div class="flex items-center gap-2">
                    <span class="text-lg">💿</span>
                    <h2 class="text-base font-bold text-indigo-900">volDaan Draait Vinyl</h2>
                </div>
                <button id="toggle-discogs-edit" class="text-xs text-indigo-600 hover:underline font-semibold">${hasDiscogsUser ? 'Wijzigen ⚙️' : 'Instellen 🔄'}</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Beheer en doorzoek je vinyl collectie en verlanglijst.</p>
            
            <div id="discogs-input-box" class="${hasDiscogsUser ? 'hidden' : ''} mb-3 space-y-2">
                <input type="text" id="discogs-username-input" placeholder="Vul je Discogs gebruikersnaam in..." value="${appData.luchtig.discogsUser || ''}" class="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs">
                <button id="fetch-discogs-btn" class="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Gegevens Ophalen ✨</button>
            </div>

            <div id="discogs-content-section" class="${hasDiscogsUser ? '' : 'hidden'} space-y-2.5">
                <div class="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
                    <button id="discogs-tab-coll" class="py-1.5 rounded-lg text-xs font-bold transition ${currentDiscogsTab === 'collection' ? 'bg-white text-indigo-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'}">Collectie</button>
                    <button id="discogs-tab-want" class="py-1.5 rounded-lg text-xs font-bold transition ${currentDiscogsTab === 'wantlist' ? 'bg-white text-indigo-950 shadow-xs' : 'text-gray-500 hover:text-gray-900'}">Wantlist</button>
                </div>

                <input type="text" id="discogs-search-input" placeholder="Zoek op artiest of album..." class="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <div id="discogs-catalog-container" class="space-y-2 max-h-72 overflow-y-auto pr-1"></div>
            </div>
        </div>

        <!-- 4. Oneindige Sudoku Puzzel met geforceerde 3x3 rasterlijnen -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🧩 Oneindige Sudoku</h2>
                <button id="new-sudoku-btn" class="text-xs text-indigo-600 hover:underline font-semibold">Nieuwe Puzzel 🔄</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Zet je gedachten op pauze. Je voortgang wordt automatisch bewaard!</p>
            
            <div id="sudoku-board" class="grid grid-cols-9 gap-0 bg-indigo-950 p-2 rounded-xl max-w-[315px] mx-auto mb-3 shadow-inner"></div>
            
            <div class="flex gap-2">
                <button id="check-sudoku-btn" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Controleer Puzzel ✨</button>
            </div>
            <div id="sudoku-message" class="text-center text-xs font-bold mt-2"></div>
        </div>
    `;

    initLuchtigModals(appData);
    initLuchtigLogic(appData);
}

function initLuchtigModals(appData) {
    if (document.getElementById('playlist-modal')) return;

    const modalsHTML = `
        <div id="playlist-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🎧 volDaan Draait - Toevoegen</h3>
                    <button id="close-playlist-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="playlist-form" class="space-y-3">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Titel</label>
                        <input type="text" id="modal-pl-title" placeholder="Bijv. Ochtend Focus" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving</label>
                        <input type="text" id="modal-pl-desc" placeholder="Bijv. Rustige achtergrondmuziek" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Spotify / Luisterlink</label>
                        <input type="url" id="modal-pl-link" placeholder="https://open.spotify.com/..." class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-playlist-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-semibold">Toevoegen ✨</button>
                    </div>
                </form>
            </div>
        </div>

        <div id="playlists-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs max-h-[85vh] overflow-y-auto">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer & Volgorde Playlists</h3>
                    <button id="close-playlists-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <div id="beheer-playlists-list" class="space-y-2"></div>
            </div>
        </div>

        <div id="news-beheer-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl space-y-3 text-xs max-h-[80vh] overflow-y-auto border border-gray-200">
                <div class="flex justify-between items-center border-b pb-2">
                    <h3 class="text-sm font-bold text-indigo-950">⚙️ Beheer & Volgorde Nieuwsbronnen</h3>
                    <button id="close-news-beheer" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="add-news-source-form" class="space-y-2 pb-3 border-b bg-gray-50 p-3 rounded-xl">
                    <p class="font-bold text-indigo-900">Nieuwe bron toevoegen</p>
                    <input type="text" id="new-news-name" placeholder="Naam (bijv. mijn site)" class="w-full px-3 py-1.5 bg-white border rounded-lg" required>
                    <input type="url" id="new-news-url" placeholder="RSS Feed URL (.xml of .rss)" class="w-full px-3 py-1.5 bg-white border rounded-lg" required>
                    <button type="submit" class="w-full py-1.5 bg-indigo-600 text-white rounded-lg font-semibold">Bron Toevoegen ✨</button>
                </form>
                <div id="beheer-news-list" class="space-y-2 max-h-48 overflow-y-auto pr-1"></div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalsHTML);

    const modal = document.getElementById('playlist-modal');
    document.getElementById('open-playlist-modal').onclick = () => modal.classList.remove('hidden');
    document.getElementById('close-playlist-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('cancel-playlist-modal').onclick = () => modal.classList.add('hidden');

    document.getElementById('playlist-form').onsubmit = (e) => {
        e.preventDefault();
        const title = document.getElementById('modal-pl-title').value.trim();
        const desc = document.getElementById('modal-pl-desc').value.trim();
        const link = document.getElementById('modal-pl-link').value.trim();

        if (title && link) {
            if (!appData.luchtig.customPlaylists) appData.luchtig.customPlaylists = [...DEFAULT_PLAYLISTS];
            appData.luchtig.customPlaylists.push({ id: Date.now(), title, desc: desc || 'Persoonlijke afspeellijst', link });
            saveAppData(appData);
            modal.classList.add('hidden');
            e.target.reset();
            renderPlaylists(appData);
            showToast("Toegevoegd aan volDaan Draait! 🎧");
        }
    };

    const beheerModal = document.getElementById('playlists-beheer-modal');
    document.getElementById('open-playlists-beheer').onclick = () => {
        beheerModal.classList.remove('hidden');
        renderBeheerModalList(appData);
    };
    document.getElementById('close-playlists-beheer').onclick = () => beheerModal.classList.add('hidden');

    const newsBeheerModal = document.getElementById('news-beheer-modal');
    document.getElementById('open-news-beheer').onclick = () => {
        newsBeheerModal.classList.remove('hidden');
        renderNewsBeheerList(appData);
    };
    document.getElementById('close-news-beheer').onclick = () => newsBeheerModal.classList.add('hidden');

    document.getElementById('add-news-source-form').onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('new-news-name').value.trim();
        const url = document.getElementById('new-news-url').value.trim();
        if (name && url) {
            if (!appData.luchtig.newsSources) appData.luchtig.newsSources = [...DEFAULT_NEWS_SOURCES];
            appData.luchtig.newsSources.push({ name, url });
            saveAppData(appData);
            e.target.reset();
            renderNewsBeheerList(appData);
            initLuchtigModule(appData);
            showToast(`Bron '${name}' toegevoegd! 🎸`);
        }
    };
}

function renderBeheerModalList(appData) {
    const container = document.getElementById('beheer-playlists-list');
    const playlists = appData.luchtig?.customPlaylists || DEFAULT_PLAYLISTS;

    container.innerHTML = playlists.map((p, index) => `
        <div class="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
            <div>
                <span class="font-bold text-indigo-950">🎵 ${p.title}</span>
                <p class="text-[10px] text-gray-500">${p.desc}</p>
            </div>
            <div class="flex items-center gap-1">
                <button onclick="window.movePlaylist(${index}, -1)" class="px-2 py-1 bg-white border rounded font-bold text-gray-700 hover:bg-gray-100" ${index === 0 ? 'disabled opacity-40' : ''}>▲</button>
                <button onclick="window.movePlaylist(${index}, 1)" class="px-2 py-1 bg-white border rounded font-bold text-gray-700 hover:bg-gray-100" ${index === playlists.length - 1 ? 'disabled opacity-40' : ''}>▼</button>
                <button onclick="window.deletePlaylist(${p.id})" class="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded font-bold">Wis</button>
            </div>
        </div>
    `).join('');

    window.movePlaylist = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= playlists.length) return;
        const temp = playlists[index];
        playlists[index] = playlists[targetIndex];
        playlists[targetIndex] = temp;
        saveAppData(appData);
        renderBeheerModalList(appData);
        renderPlaylists(appData);
    };

    window.deletePlaylist = (id) => {
        appData.luchtig.customPlaylists = appData.luchtig.customPlaylists.filter(x => x.id !== id);
        saveAppData(appData);
        renderBeheerModalList(appData);
        renderPlaylists(appData);
        showToast("Playlist verwijderd.");
    };
}

function renderNewsBeheerList(appData) {
    const container = document.getElementById('beheer-news-list');
    const sources = appData.luchtig?.newsSources || DEFAULT_NEWS_SOURCES;

    container.innerHTML = sources.map((s, index) => `
        <div class="p-2.5 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center">
            <div class="overflow-hidden pr-2">
                <span class="font-bold text-indigo-950 truncate block">📰 ${s.name}</span>
                <p class="text-[10px] text-gray-400 truncate">${s.url}</p>
            </div>
            <div class="flex items-center gap-1 shrink-0">
                <button onclick="window.moveNewsSource(${index}, -1)" class="px-2 py-1 bg-white border rounded font-bold text-gray-700 hover:bg-gray-100" ${index === 0 ? 'disabled opacity-40' : ''}>▲</button>
                <button onclick="window.moveNewsSource(${index}, 1)" class="px-2 py-1 bg-white border rounded font-bold text-gray-700 hover:bg-gray-100" ${index === sources.length - 1 ? 'disabled opacity-40' : ''}>▼</button>
                ${s.name !== 'Alles' ? `<button onclick="window.deleteNewsSource(${index})" class="px-2.5 py-1 bg-red-50 text-red-600 border border-red-200 rounded font-bold">Wis</button>` : ''}
            </div>
        </div>
    `).join('');

    window.moveNewsSource = (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= sources.length) return;
        const temp = sources[index];
        sources[index] = sources[targetIndex];
        sources[targetIndex] = temp;
        saveAppData(appData);
        renderNewsBeheerList(appData);
        initLuchtigModule(appData);
    };

    window.deleteNewsSource = (index) => {
        sources.splice(index, 1);
        saveAppData(appData);
        renderNewsBeheerList(appData);
        initLuchtigModule(appData);
        showToast("Nieuwsbron verwijderd.");
    };
}

let fullDiscogsCatalog = [];
let fullDiscogsWantlist = [];

function initLuchtigLogic(appData) {
    renderPlaylists(appData);

    loadMusicNews(appData, appData.luchtig.activeNewsSource || 'Alles');

    document.querySelectorAll('.news-tab-btn').forEach(btn => {
        btn.onclick = (e) => {
            const sourceName = e.target.getAttribute('data-source');
            appData.luchtig.activeNewsSource = sourceName;
            saveAppData(appData);

            document.querySelectorAll('.news-tab-btn').forEach(b => {
                b.className = "news-tab-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100";
            });
            e.target.className = "news-tab-btn px-2.5 py-1 rounded-lg text-xs font-semibold border transition bg-indigo-600 text-white border-indigo-600 shadow-xs";

            loadMusicNews(appData, sourceName);
        };
    });

    document.getElementById('refresh-news-btn').onclick = () => {
        loadMusicNews(appData, appData.luchtig.activeNewsSource || 'Alles');
        showToast("Nieuws ververst! 🎸");
    };

    document.getElementById('discogs-tab-coll').onclick = () => {
        appData.luchtig.discogsTab = 'collection';
        saveAppData(appData);
        updateDiscogsTabsUI(appData);
    };
    document.getElementById('discogs-tab-want').onclick = () => {
        appData.luchtig.discogsTab = 'wantlist';
        saveAppData(appData);
        updateDiscogsTabsUI(appData);
    };

    const toggleBtn = document.getElementById('toggle-discogs-edit');
    const inputBox = document.getElementById('discogs-input-box');
    
    toggleBtn.onclick = () => {
        inputBox.classList.toggle('hidden');
        toggleBtn.textContent = inputBox.classList.contains('hidden') ? 'Wijzigen ⚙️' : 'Sluiten ✕';
    };

    document.getElementById('fetch-discogs-btn').onclick = () => {
        const username = document.getElementById('discogs-username-input').value.trim();
        if (username) {
            appData.luchtig.discogsUser = username;
            saveAppData(appData);
            inputBox.classList.add('hidden');
            toggleBtn.textContent = 'Wijzigen ⚙️';
            document.getElementById('discogs-content-section').classList.remove('hidden');
            fetchDiscogsData(username);
            showToast("Discogs gegevens worden geladen... 🞊");
        } else {
            showToast("Vul een gebruikersnaam in.");
        }
    };

    const searchInput = document.getElementById('discogs-search-input');
    if (searchInput) {
        searchInput.oninput = (e) => {
            const term = e.target.value.toLowerCase();
            const activeTab = appData.luchtig.discogsTab || 'collection';
            const dataset = activeTab === 'collection' ? fullDiscogsCatalog : fullDiscogsWantlist;
            
            const filtered = dataset.filter(item => {
                const basic = item.basic_information || item.release;
                const title = (basic?.title || '').toLowerCase();
                const artist = (basic?.artists ? basic.artists.map(a => a.name).join(' ') : '').toLowerCase();
                return title.includes(term) || artist.includes(term);
            });
            renderDiscogsList(filtered);
        };
    }

    if (appData.luchtig.discogsUser) {
        fetchDiscogsData(appData.luchtig.discogsUser);
    }

    initSudokuGame(appData);
}

function updateDiscogsTabsUI(appData) {
    const activeTab = appData.luchtig.discogsTab || 'collection';
    const btnColl = document.getElementById('discogs-tab-coll');
    const btnWant = document.getElementById('discogs-tab-want');

    if (activeTab === 'collection') {
        btnColl.className = "py-1.5 rounded-lg text-xs font-bold transition bg-white text-indigo-950 shadow-xs";
        btnWant.className = "py-1.5 rounded-lg text-xs font-bold transition text-gray-500 hover:text-gray-900";
        renderDiscogsList(fullDiscogsCatalog);
    } else {
        btnWant.className = "py-1.5 rounded-lg text-xs font-bold transition bg-white text-indigo-950 shadow-xs";
        btnColl.className = "py-1.5 rounded-lg text-xs font-bold transition text-gray-500 hover:text-gray-900";
        renderDiscogsList(fullDiscogsWantlist);
    }
}

async function fetchDiscogsData(username) {
    const container = document.getElementById('discogs-catalog-container');
    container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-2">Collectie en wantlist ophalen van Discogs...</p>`;

    try {
        let page = 1;
        let allReleases = [];
        let totalPages = 1;
        while (page <= totalPages && page <= 5) {
            const res = await fetch(`https://api.discogs.com/users/${username}/collection/folders/0/releases?per_page=100&page=${page}`);
            if (res.ok) {
                const data = await res.json();
                if (data.pagination) totalPages = data.pagination.pages;
                if (data.releases) allReleases = allReleases.concat(data.releases);
            }
            page++;
        }
        fullDiscogsCatalog = allReleases;

        let wantPage = 1;
        let allWants = [];
        let totalWantPages = 1;
        while (wantPage <= totalWantPages && wantPage <= 5) {
            const resWant = await fetch(`https://api.discogs.com/users/${username}/wants?per_page=100&page=${wantPage}`);
            if (resWant.ok) {
                const dataWant = await resWant.json();
                if (dataWant.pagination) totalWantPages = dataWant.pagination.pages;
                if (dataWant.wants) allWants = allWants.concat(dataWant.wants);
            }
            wantPage++;
        }
        fullDiscogsWantlist = allWants;

        document.getElementById('discogs-content-section').classList.remove('hidden');
        updateDiscogsTabsUI(appData);
        showToast(`Geladen: ${fullDiscogsCatalog.length} platen, ${fullDiscogsWantlist.length} wantlist items! 🎵`);

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-xs text-red-500 text-center py-2">Kon Discogs gegevens niet laden. Controleer de gebruikersnaam.</p>`;
    }
}

function renderDiscogsList(items) {
    const container = document.getElementById('discogs-catalog-container');
    if (!items || items.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-2">Geen items gevonden.</p>`;
        return;
    }

    container.innerHTML = `<p class="text-[10px] text-gray-400 mb-1">Totaal weergegeven: ${items.length}</p>` + items.map(item => {
        const basic = item.basic_information || item.release;
        const title = basic?.title || 'Onbekend album';
        const artist = basic?.artists ? basic.artists.map(a => a.name).join(', ') : 'Onbekende artiest';
        const year = basic?.year ? `(${basic.year})` : '';
        const cover = basic?.cover_image || '';

        return `
            <div class="flex items-center gap-3 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <img src="${cover}" alt="cover" class="w-10 h-10 object-cover rounded-lg border shadow-xs">
                <div class="flex-1 overflow-hidden">
                    <p class="font-bold text-indigo-950 truncate">${artist} - ${title}</p>
                    <p class="text-[10px] text-gray-500">Release jaar: ${year}</p>
                </div>
            </div>
        `;
    }).join('');
}

async function loadMusicNews(appData, sourceName) {
    const container = document.getElementById('music-news-container');
    container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-4">Laatste nieuws ophalen...</p>`;

    const sources = appData.luchtig?.newsSources || DEFAULT_NEWS_SOURCES;

    try {
        if (sourceName === 'Alles') {
            let allItems = [];
            for (const src of sources.filter(s => s.url !== 'ALL')) {
                try {
                    const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(src.url)}`;
                    const res = await fetch(proxyUrl);
                    const json = await res.json();
                    if (json.status === 'ok' && json.items) {
                        const itemsWithSource = json.items.slice(0, 3).map(i => ({ ...i, sourceName: src.name }));
                        allItems = allItems.concat(itemsWithSource);
                    }
                } catch (e) {
                    console.warn(`Kon feed ${src.name} niet laden`, e);
                }
            }

            allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

            if (allItems.length > 0) {
                container.innerHTML = allItems.slice(0, 15).map(item => {
                    const pubDate = new Date(item.pubDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
                    return `
                        <a href="${item.link}" target="_blank" class="block p-3 bg-gray-50 hover:bg-indigo-50/50 border border-gray-200 rounded-xl transition text-xs space-y-1">
                            <div class="flex justify-between items-center text-[10px] text-gray-400">
                                <span class="font-bold text-indigo-700">${item.sourceName}</span>
                                <span>📅 ${pubDate}</span>
                            </div>
                            <p class="font-bold text-indigo-950 leading-snug">${item.title}</p>
                        </a>
                    `;
                }).join('');
            } else {
                container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-4">Geen artikelen gevonden.</p>`;
            }
        } else {
            const sourceObj = sources.find(s => s.name === sourceName);
            if (!sourceObj) return;

            const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(sourceObj.url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.status === 'ok' && data.items && data.items.length > 0) {
                container.innerHTML = data.items.slice(0, 8).map(item => {
                    const pubDate = new Date(item.pubDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
                    return `
                        <a href="${item.link}" target="_blank" class="block p-3 bg-gray-50 hover:bg-indigo-50/50 border border-gray-200 rounded-xl transition text-xs space-y-1">
                            <div class="flex justify-between items-center text-[10px] text-gray-400">
                                <span class="font-bold text-indigo-700">${sourceName}</span>
                                <span>📅 ${pubDate}</span>
                            </div>
                            <p class="font-bold text-indigo-950 leading-snug">${item.title}</p>
                        </a>
                    `;
                }).join('');
            } else {
                container.innerHTML = `<p class="text-xs text-gray-400 italic text-center py-4">Geen artikelen gevonden voor ${sourceName}.</p>`;
            }
        }
    } catch (err) {
        console.error(err);
        container.innerHTML = `<p class="text-xs text-red-500 text-center py-4">Kon nieuws niet laden. Controleer je internetverbinding.</p>`;
    }
}

function renderPlaylists(appData) {
    const container = document.getElementById('playlists-container');
    const featuredBox = document.getElementById('featured-player-box');
    const playlists = appData.luchtig?.customPlaylists || DEFAULT_PLAYLISTS;

    const activePlaylist = playlists[0] || DEFAULT_PLAYLISTS[0];
    const otherPlaylists = playlists.slice(1);

    featuredBox.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <p class="font-bold text-indigo-950 text-sm">🎵 ${activePlaylist.title}</p>
                <p class="text-[11px] text-gray-500">${activePlaylist.desc}</p>
            </div>
            <a href="${activePlaylist.link}" target="_blank" class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition shadow-xs">Luister</a>
        </div>
    `;

    container.innerHTML = otherPlaylists.length === 0 ? '' : otherPlaylists.map((p) => `
        <div class="p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
            <div>
                <span class="font-bold text-indigo-950">🎵 ${p.title}</span>
                <p class="text-gray-500 text-[10px]">${p.desc}</p>
            </div>
            <a href="${p.link}" target="_blank" class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Luister</a>
        </div>
    `).join('');
}

// Sudoku
function initSudokuGame(appData) {
    if (!appData.luchtig.sudokuGame || !appData.luchtig.sudokuGame.puzzle) {
        generateNewSudoku(appData);
    } else {
        renderSudokuBoard(appData);
    }

    document.getElementById('new-sudoku-btn').onclick = () => {
        generateNewSudoku(appData);
        document.getElementById('sudoku-message').textContent = "";
        showToast("Nieuwe Sudoku geladen! 🧩");
    };

    document.getElementById('check-sudoku-btn').onclick = () => {
        const inputs = document.querySelectorAll('.sudoku-cell');
        let correct = true;
        let filledCount = 0;
        const solution = appData.luchtig.sudokuGame.solution;

        inputs.forEach((input, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const val = parseInt(input.value) || 0;
            if (val > 0) filledCount++;
            if (val !== solution[row][col]) {
                correct = false;
            }
        });

        const msgEl = document.getElementById('sudoku-message');
        if (filledCount < 81) {
            msgEl.textContent = "Vul de puzzel helemaal in! ✍️";
            msgEl.className = "text-center text-xs font-bold text-amber-600 mt-2";
        } else if (correct) {
            msgEl.textContent = "Gefeliciteerd! Puzzel correct opgelost! 🎉✨";
            msgEl.className = "text-center text-xs font-bold text-emerald-600 mt-2";
            showToast("Geweldig gedaan! 🧩");
        } else {
            msgEl.textContent = "Er zit ergens een foutje in. Probeer het nog eens! 🔍";
            msgEl.className = "text-center text-xs font-bold text-red-500 mt-2";
        }
    };
}

function generateNewSudoku(appData) {
    const base = [
        [5,3,4, 6,7,8, 9,1,2],
        [6,7,2, 1,9,5, 3,4,8],
        [1,9,8, 3,4,2, 5,6,7],
        [8,5,9, 7,6,1, 4,2,3],
        [4,2,6, 8,5,3, 7,9,1],
        [7,1,3, 9,2,4, 8,5,6],
        [9,6,1, 5,3,7, 2,8,4],
        [2,8,7, 4,1,9, 6,3,5],
        [3,4,5, 2,8,6, 1,7,9]
    ];

    let solution = JSON.parse(JSON.stringify(base));
    let puzzle = JSON.parse(JSON.stringify(base));

    let removed = 0;
    while (removed < 42) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (puzzle[r][c] !== 0) {
            puzzle[r][c] = 0;
            removed++;
        }
    }

    let userValues = Array(9).fill(0).map(() => Array(9).fill(0));

    appData.luchtig.sudokuGame = {
        puzzle: puzzle,
        solution: solution,
        userValues: userValues
    };
    saveAppData(appData);

    renderSudokuBoard(appData);
}

function renderSudokuBoard(appData) {
    const boardEl = document.getElementById('sudoku-board');
    if (!boardEl) return;

    const gameData = appData.luchtig.sudokuGame;
    boardEl.innerHTML = '';

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const initialVal = gameData.puzzle[r][c];
            const userVal = gameData.userValues[r][c];
            const isInitial = initialVal !== 0;

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '9';
            
            let borderStyle = 'border: 1px solid #c7d2fe;';
            if (c === 2 || c === 5) borderStyle += ' border-right: 3px solid #030712 !important;';
            if (r === 2 || r === 5) borderStyle += ' border-bottom: 3px solid #030712 !important;';

            input.style.cssText = borderStyle;
            input.className = `sudoku-cell w-8 h-8 text-center text-xs font-bold rounded-none focus:outline-none focus:ring-1 focus:ring-emerald-500 ${
                isInitial ? 'bg-indigo-100 text-indigo-950 font-extrabold' : 'bg-white text-emerald-800'
            }`;

            if (isInitial) {
                input.value = initialVal;
                input.readOnly = true;
            } else {
                input.value = userVal !== 0 ? userVal : '';
                input.oninput = (e) => {
                    let v = e.target.value;
                    if (v.length > 1) v = v.slice(-1);
                    e.target.value = v;
                    
                    gameData.userValues[r][c] = v !== '' ? parseInt(v) : 0;
                    saveAppData(appData);
                };
            }
            boardEl.appendChild(input);
        }
    }
}