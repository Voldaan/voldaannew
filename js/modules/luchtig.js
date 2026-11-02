// js/modules/luchtig.js
import { saveAppData, showToast } from './storage.js';

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
        appData.luchtig = { customPlaylists: [...DEFAULT_PLAYLISTS], userLink: '', sudokuGame: null };
    }
    if (!appData.luchtig.customPlaylists) {
        appData.luchtig.customPlaylists = [...DEFAULT_PLAYLISTS];
    }

    container.innerHTML = `
        <!-- 1. Prominente "volDaan Draait" Luisteromgeving -->
        <div class="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-5 rounded-2xl shadow-sm border border-emerald-200/80 mb-4">
            <div class="flex justify-between items-center mb-1.5">
                <div class="flex items-center gap-2">
                    <span class="text-xl">🎧</span>
                    <h2 class="text-base font-bold text-emerald-950">volDaan Draait</h2>
                </div>
                <button id="open-playlist-modal" class="text-xs text-emerald-700 hover:underline font-semibold">+ Toevoegen</button>
            </div>
            <p class="text-xs text-gray-600 mb-3">Jouw persoonlijke luisteromgeving en laatst toegevoegde favorieten.</p>
            
            <!-- Uitgelichte Laatste / Gekoppelde Luisteromgeving -->
            <div id="featured-player-box" class="p-3.5 bg-white border border-emerald-200 rounded-xl mb-3 shadow-xs space-y-2">
                <!-- Wordt dynamisch gevuld met de laatst toegevoegde of gekoppelde stream -->
            </div>

            <!-- Overige Playlists -->
            <div id="playlists-container" class="space-y-2 mb-3"></div>

            <div class="flex justify-between items-center text-[11px] text-gray-500 pt-2 border-t border-emerald-100">
                <span>💡 Tip: Verbind je Sonos via de officiële Spotify-app</span>
                <button id="toggle-delete-mode" class="text-red-500 hover:underline font-medium">- Beheer / Wis</button>
            </div>
        </div>

        <!-- 2. Evert Kwok / Droge Humor -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">😄 Droge Humor & Glimlach</h2>
            <p class="text-xs text-gray-500 mb-3">Even relativeren in de stijl van Evert Kwok.</p>
            
            <div id="humor-card" class="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl mb-3 text-xs text-emerald-950 font-medium leading-relaxed italic text-center"></div>
            <button id="next-humor-btn" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition shadow-sm">Nieuwe droge humor ✨</button>
        </div>

        <!-- 3. Oneindige Sudoku Puzzel met gecorrigeerde 3x3 rasterlijnen -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-indigo-200/80">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🧩 Oneindige Sudoku</h2>
                <button id="new-sudoku-btn" class="text-xs text-indigo-600 hover:underline font-semibold">Nieuwe Puzzel 🔄</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Zet je gedachten op pauze. Je voortgang wordt automatisch bewaard!</p>
            
            <div id="sudoku-board" class="grid grid-cols-9 gap-0 bg-indigo-950 p-2 rounded-xl max-w-[310px] mx-auto mb-3 shadow-inner"></div>
            
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
                    <h3 class="text-sm font-bold text-indigo-950">🎧 volDaan Draait - Toevoegen</h3>
                    <button id="close-playlist-modal" class="text-gray-400 hover:text-gray-600 text-base font-bold">✕</button>
                </div>
                <form id="playlist-form" class="space-y-3">
                    <div>
                        <label class="block font-semibold text-gray-600 mb-1">Titel</label>
                        <input type="text" id="modal-pl-title" placeholder="Bijv. Ochtend Focus of volDaan Mix" class="w-full px-3 py-2 border rounded-xl" required>
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
                        <button type="submit" class="flex-1 py-2 bg-emerald-600 text-white rounded-xl font-semibold">Toevoegen & Direct Actief ✨</button>
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
            // Voeg toe als nieuwste item
            appData.luchtig.customPlaylists.push({ id: Date.now(), title, desc: desc || 'Persoonlijke afspeellijst', link });
            appData.luchtig.userLink = link; // Stel direct in als actieve luisteromgeving
            saveAppData(appData);
            modal.classList.add('hidden');
            e.target.reset();
            renderPlaylists(appData);
            showToast("Toegevoegd aan volDaan Draait! 🎧");
        }
    };
}

let deleteModeActive = false;

function initLuchtigLogic(appData) {
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

    renderPlaylists(appData);

    document.getElementById('toggle-delete-mode').onclick = () => {
        deleteModeActive = !deleteModeActive;
        const btn = document.getElementById('toggle-delete-mode');
        btn.textContent = deleteModeActive ? "Klaar met wissen" : "- Beheer / Wis";
        renderPlaylists(appData);
    };

    initSudokuGame(appData);
}

function renderPlaylists(appData) {
    const container = document.getElementById('playlists-container');
    const featuredBox = document.getElementById('featured-player-box');
    const playlists = appData.luchtig?.customPlaylists || DEFAULT_PLAYLISTS;

    // De laatst toegevoegde playlist is de actieve "volDaan Draait" stream
    const latestPlaylist = playlists[playlists.length - 1] || playlists[0];
    const otherPlaylists = playlists.slice(0, playlists.length - 1);

    // Render de uitgelichte speler bovenaan
    featuredBox.innerHTML = `
        <div class="flex justify-between items-center">
            <div>
                <span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md uppercase tracking-wider">Laatst toegevoegd / Actief</span>
                <p class="font-bold text-indigo-950 text-sm mt-1">🎵 ${latestPlaylist.title}</p>
                <p class="text-[11px] text-gray-500">${latestPlaylist.desc}</p>
            </div>
            <a href="${latestPlaylist.link}" target="_blank" class="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5">
                <span>Start luisteren</span>
                <span>▶</span>
            </a>
        </div>
    `;

    // Render de overige playlists
    container.innerHTML = otherPlaylists.length === 0 ? '<p class="text-[11px] text-gray-400 italic">Geen extra afspeellijsten.</p>' : otherPlaylists.map((p) => `
        <div class="p-2.5 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
            <div>
                <span class="font-bold text-indigo-950">🎵 ${p.title}</span>
                <p class="text-gray-500 text-[10px]">${p.desc}</p>
            </div>
            <div class="flex items-center gap-2">
                <a href="${p.link}" target="_blank" class="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition">Luister</a>
                ${deleteModeActive ? `<button onclick="window.deleteCustomPlaylist(${p.id})" class="px-2 py-1 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200">Wis</button>` : ''}
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

// Sudoku Generator & Spel Logica met gecorrigeerde 3x3 rasterlijnen
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
            
            // Exacte 3x3 blokranden voor zowel horizontaal als verticaal
            let borderClasses = 'border border-indigo-200';
            if (c === 2 || c === 5) borderClasses += ' border-r-2 border-r-indigo-950';
            if (r === 2 || r === 5) borderClasses += ' border-b-2 border-b-indigo-950';

            input.className = `sudoku-cell w-8 h-8 text-center text-xs font-bold rounded-none focus:outline-none focus:ring-1 focus:ring-emerald-500 ${borderClasses} ${
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