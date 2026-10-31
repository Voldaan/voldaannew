// js/modules/luchtig.js
import { saveAppData, showToast } from './storage.js';

// Droge humor / Evert Kwok-achtige taalgrapjes (oneindig te verversen)
const HUMOR_DB = [
    "“Ik geef niet op,” zei de boer, en hij gaf zijn koe een hand.",
    "Wat doet een vis op het droge? Die heeft het even helemaal gehad met de zee.",
    "Ik wilde een grap vertellen over geheugenverlies, maar ik ben vergeten waar het over ging.",
    "“Dokter, ik voel me zo hol als een bamboestok!” — “Geen zorgen, dat zit tussen de oren.”",
    "Waarom dragen overmatige optimisten altijd een ladder in de kroeg? Omdat ze de lat hoog leggen.",
    "De bakker werd ontslagen omdat hij er te eenzijdig brood op nahield.",
    "“Hé buurman, je hond blaft tegen de schutting!” — “Ja, hij wil doorbreken in de muziekwereld.”",
    "Twee tomaten lopen over straat. Zegt de ene tomaat tegen de andere: “Kijk uit, daar komt een auw-to… splats!”",
    "“Schat, vind je dat ik een olifantengeheugen heb?” — “Weet ik veel, wie ben jij eigenlijk?”",
    "Er zaten twee vliegen op een pak boter. Zegt de ene: “Zullen we naar Frankrijk vliegen?” Waarop de andere antwoordt: “Nee joh, veel te veel gesmeer.”"
];

const DEFAULT_PLAYLISTS = [
    { id: 1, title: "Lofi Beats & Focus", desc: "Rustige beats om zachtjes door te werken of te ontprikkelen.", link: "https://open.spotify.com" },
    { id: 2, title: "Podcast: Rust in je Hoofd", desc: "Inspirerende verhalen en handige handvatten voor meer structuur.", link: "https://open.spotify.com" },
    { id: 3, title: "Vrolijke Vibe & Klassiekers", desc: "Goede energie zonder dat het te hard binnenkomt.", link: "https://open.spotify.com" }
];

export function initLuchtigModule(appData) {
    const container = document.getElementById('luchtig');
    if (!container) return;

    if (!appData.luchtig) {
        appData.luchtig = { customPlaylists: [...DEFAULT_PLAYLISTS], userLink: '' };
    }
    if (!appData.luchtig.customPlaylists) {
        appData.luchtig.customPlaylists = [...DEFAULT_PLAYLISTS];
    }

    container.innerHTML = `
        <!-- 1. Muziek & Podcasts (Bovenaan met Spotify-groene glow) -->
        <div class="bg-white p-5 rounded-2xl shadow-[0_4px_20px_-4px_rgba(34,197,94,0.2)] border border-emerald-200/80 mb-4 transition-all">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🎧 Muziek & Podcast</h2>
                <div class="flex gap-2">
                    <button id="open-playlist-modal" class="text-xs text-emerald-700 hover:underline font-semibold">+ Toevoegen</button>
                    <button id="toggle-delete-mode" class="text-xs text-red-500 hover:underline">- Verwijderen</button>
                </div>
            </div>
            <p class="text-xs text-gray-500 mb-3">Jouw favoriete afspeellijsten om bij op te laden of te ontprikkelen.</p>
            
            <div id="playlists-container" class="space-y-2.5 mb-3"></div>

            <form id="account-link-form" class="space-y-2 pt-2 border-t border-gray-100">
                <label class="block text-[11px] font-semibold text-gray-600">Persoonlijke Luister-omgeving / Link</label>
                <div class="flex gap-2">
                    <input type="url" id="user-spotify-link" placeholder="Plak hier je favoriete Spotify/Podcast link..." class="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs">
                    <button type="submit" class="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition">Koppel 🔗</button>
                </div>
                <div id="saved-account-link-box" class="text-xs text-gray-600 pt-1"></div>
            </form>
        </div>

        <!-- 2. Evert Kwok / Droge Humor (Vervangt de moppen) -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">😄 Droge Humor & Glimlach</h2>
            <p class="text-xs text-gray-500 mb-3">Even relativeren in de stijl van Evert Kwok.</p>
            
            <div id="humor-card" class="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl mb-3 text-xs text-emerald-950 font-medium leading-relaxed italic text-center">
                <!-- Wordt dynamisch gevuld -->
            </div>
            <button id="next-humor-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">Nieuwe droge humor ✨</button>
        </div>

        <!-- 3. Oneindige Sudoku Puzzel -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🧩 Oneindige Sudoku</h2>
                <button id="new-sudoku-btn" class="text-xs text-indigo-600 hover:underline font-semibold">Nieuwe Puzzel 🔄</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Zet je gedachten op pauze met een ontspannende sudoku.</p>
            
            <div id="sudoku-board" class="grid grid-cols-9 gap-0.5 bg-indigo-900 p-1.5 rounded-xl max-w-[280px] mx-auto mb-3 shadow-inner">
                <!-- Sudoku cellen komen hier -->
            </div>
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

    const modalHTML = `
        <div id="playlist-modal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 hidden">
            <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4 text-xs">
                <div class="flex justify-between items-center">
                    <h3 class="text-sm font-bold text-indigo-950">🎧 Playlist of Podcast Toevoegen</h3>
                    <button id="close-playlist-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="playlist-form" class="space-y-3">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Naam</label>
                        <input type="text" id="modal-pl-title" placeholder="Bijv. Ochtend Focus" class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Omschrijving</label>
                        <input type="text" id="modal-pl-desc" placeholder="Bijv. Rustige achtergrondmuziek" class="w-full px-3 py-2 border rounded-xl">
                    </div>
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Luisterlink (Spotify/Podcast)</label>
                        <input type="url" id="modal-pl-link" placeholder="https://open.spotify.com/..." class="w-full px-3 py-2 border rounded-xl" required>
                    </div>
                    <div class="flex gap-2 pt-2">
                        <button type="button" id="cancel-playlist-modal" class="flex-1 py-2 bg-gray-100 rounded-xl font-semibold">Annuleren</button>
                        <button type="submit" class="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Toevoegen ✨</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

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
            appData.luchtig.customPlaylists.push({ id: Date.now(), title, desc: desc || 'Favoriete afspeellijst', link });
            saveAppData(appData);
            modal.classList.add('hidden');
            e.target.reset();
            renderPlaylists(appData);
            showToast("Playlist toegevoegd! 🎧");
        }
    };
}

let deleteModeActive = false;

function initLuchtigLogic(appData) {
    // 1. Humor logica
    let humorIndex = Math.floor(Math.random() * HUMOR_DB.length);
    const humorCard = document.getElementById('humor-card');
    
    function displayHumor() {
        humorCard.textContent = HUMOR_DB[humorIndex];
    }
    document.getElementById('next-humor-btn').onclick = () => {
        humorIndex = (humorIndex + 1) % HUMOR_DB.length;
        displayHumor();
    };
    displayHumor();

    // 2. Playlists & Link logica
    renderPlaylists(appData);

    document.getElementById('toggle-delete-mode').onclick = () => {
        deleteModeActive = !deleteModeActive;
        const btn = document.getElementById('toggle-delete-mode');
        btn.textContent = deleteModeActive ? "Klaar met wissen" : "- Verwijderen";
        btn.className = deleteModeActive ? "text-xs text-red-700 font-bold underline" : "text-xs text-red-500 hover:underline";
        renderPlaylists(appData);
    };

    const linkInput = document.getElementById('user-spotify-link');
    const linkBox = document.getElementById('saved-account-link-box');
    linkInput.value = appData.luchtig.userLink || '';
    renderUserLinkBox();

    document.getElementById('account-link-form').onsubmit = (e) => {
        e.preventDefault();
        appData.luchtig.userLink = linkInput.value.trim();
        saveAppData(appData);
        renderUserLinkBox();
        showToast("Luisterlink opgeslagen! 🔗");
    };

    function renderUserLinkBox() {
        if (appData.luchtig.userLink) {
            linkBox.innerHTML = `Gekoppeld: <a href="${appData.luchtig.userLink}" target="_blank" class="text-emerald-700 font-bold underline">Open jouw luister-omgeving 🎧</a>`;
        } else {
            linkBox.innerHTML = `<span class="italic text-gray-400">Geen persoonlijke link gekoppeld.</span>`;
        }
    }

    // 3. Oneindige Sudoku Logica
    initSudokuGame();
}

function renderPlaylists(appData) {
    const container = document.getElementById('playlists-container');
    const playlists = appData.luchtig?.customPlaylists || DEFAULT_PLAYLISTS;

    container.innerHTML = playlists.map((p) => `
        <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
            <div>
                <span class="font-bold text-indigo-950">🎵 ${p.title}</span>
                <p class="text-gray-500 mt-0.5">${p.desc}</p>
            </div>
            <div class="flex items-center gap-2">
                <a href="${p.link}" target="_blank" class="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Luister</a>
                ${deleteModeActive ? `<button onclick="window.deleteCustomPlaylist(${p.id})" class="px-2 py-1 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">Verwijder</button>` : ''}
            </div>
        </div>
    `).join('');

    window.deleteCustomPlaylist = (id) => {
        appData.luchtig.customPlaylists = appData.luchtig.customPlaylists.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlaylists(appData);
        showToast("Playlist verwijderd.");
    };
}

// Sudoku Generator & Spel Logica
let currentSudokuPuzzle = [];
let currentSudokuSolution = [];

function initSudokuGame() {
    generateNewSudoku();

    document.getElementById('new-sudoku-btn').onclick = () => {
        generateNewSudoku();
        document.getElementById('sudoku-message').textContent = "";
        showToast("Nieuwe Sudoku geladen! 🧩");
    };

    document.getElementById('check-sudoku-btn').onclick = () => {
        const inputs = document.querySelectorAll('.sudoku-cell');
        let correct = true;
        let filledCount = 0;

        inputs.forEach((input, index) => {
            const row = Math.floor(index / 9);
            const col = index % 9;
            const val = parseInt(input.value) || 0;
            if (val > 0) filledCount++;
            if (val !== currentSudokuSolution[row][col]) {
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

function generateNewSudoku() {
    // Eenvoudige, valide basisoplossing generator voor een oneindige stroom puzzels
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

    // Herschik rijen/kolommen licht om elke keer unieke variatie te krijgen
    currentSudokuSolution = JSON.parse(JSON.stringify(base));
    currentSudokuPuzzle = JSON.parse(JSON.stringify(base));

    // Verberg willekeurig getallen om een speelbare puzzel te maken (ca. 40 open plekken)
    let removed = 0;
    while (removed < 42) {
        let r = Math.floor(Math.random() * 9);
        let c = Math.floor(Math.random() * 9);
        if (currentSudokuPuzzle[r][c] !== 0) {
            currentSudokuPuzzle[r][c] = 0;
            removed++;
        }
    }

    renderSudokuBoard();
}

function renderSudokuBoard() {
    const boardEl = document.getElementById('sudoku-board');
    if (!boardEl) return;

    boardEl.innerHTML = '';
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const val = currentSudokuPuzzle[r][c];
            const isInitial = val !== 0;

            const input = document.createElement('input');
            input.type = 'number';
            input.min = '1';
            input.max = '9';
            input.className = `sudoku-cell w-7 h-7 text-center text-xs font-bold rounded border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isInitial ? 'bg-indigo-100 text-indigo-950 font-extrabold' : 'bg-white text-indigo-600'
            }`;
            
            // Subtiele dikkere randen om 3x3 blokken te markeren
            if (c === 2 || c === 5) input.style.borderRightWidth = '2px';
            if (r === 2 || r === 5) input.style.borderBottomWidth = '2px';

            if (isInitial) {
                input.value = val;
                input.readOnly = true;
            } else {
                input.value = '';
                input.oninput = (e) => {
                    const v = e.target.value;
                    if (v.length > 1) e.target.value = v.slice(-1);
                };
            }
            boardEl.appendChild(input);
        }
    }
}