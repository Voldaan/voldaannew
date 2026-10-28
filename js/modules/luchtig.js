// js/modules/luchtig.js
import { saveAppData } from './storage.js';

const JOKES = [
    "Wat doet een gek op een stoep? Lopen... tot hij van de zenuwen trilt van het lachen!",
    "Waarom dragen duikers altijd een pak? Omdat ze niet in hun blootje willen zwemmen met de vissen!",
    "Vraag: Wat is het verschil tussen een kalende man en een legpuzzel? Antwoord: Bij een puzzel mis je nooit je eigen haren!",
    "De dokter zegt tegen de patiënt: 'Ik heb goed nieuws en slecht nieuws.' 'Geef eerst het goede nieuws maar,' zegt de patiënt. 'Nou,' zegt de dokter, 'je hebt nog maar twee dagen te leven.' 'Twee dagen?! Wat is in vredesnaam het slechte nieuws dan?!' 'Dat ik je gisteren al probeerde te bereiken!'",
    "Waarom lopen mieren zo zachtjes over olifanten? Omdat ze de olifant niet wakker willen maken!"
];

const DEFAULT_PLAYLISTS = [
    { title: "Lofi Beats & Focus", desc: "Rustige beats om zachtjes door te werken of te ontprikkelen.", link: "https://open.spotify.com" },
    { title: "Podcast: Rust in je Hoofd", desc: "Inspirerende verhalen en handige handvatten voor meer structuur.", link: "https://open.spotify.com" },
    { title: "Vrolijke Vibe & Klassiekers", desc: "Goede energie zonder dat het te hard binnenkomt.", link: "https://open.spotify.com" }
];

export function initLuchtigModule(appData) {
    const container = document.getElementById('luchtig');
    if (!container) return;

    if (!appData.luchtig) {
        appData.luchtig = { customPlaylists: [...DEFAULT_PLAYLISTS] };
    }

    container.innerHTML = `
        <!-- 1. Mop / Lach van de Dag -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <h2 class="text-base font-bold text-indigo-900 mb-1">😄 Mop & Glimlach van de Dag</h2>
            <p class="text-xs text-gray-500 mb-3">Even relativeren en lachen om de dag te breken.</p>
            
            <div id="joke-card" class="p-4 bg-amber-50/70 border border-amber-200 rounded-xl mb-3 text-xs text-amber-950 font-medium leading-relaxed">
                <!-- Wordt dynamisch gevuld -->
            </div>
            <button id="next-joke-btn" class="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition">Nog een mop ✨</button>
        </div>

        <!-- 2. Muziek, Spotify & Podcasts -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
            <div class="flex justify-between items-center mb-1">
                <h2 class="text-base font-bold text-indigo-900">🎧 Muziek & Podcast Vibe</h2>
                <button id="add-playlist-btn" class="text-xs text-indigo-600 hover:underline">+ Playlist Toevoegen</button>
            </div>
            <p class="text-xs text-gray-500 mb-3">Jouw favoriete afspeellijsten om bij op te laden of te ontprikkelen.</p>
            
            <div id="playlists-container" class="space-y-2.5">
                <!-- Wordt dynamisch gevuld -->
            </div>
        </div>

        <!-- 3. Account & Koppeling -->
        <div class="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h2 class="text-base font-bold text-indigo-950 mb-1">🔗 Account & Luister-koppeling</h2>
            <p class="text-xs text-gray-500 mb-3">Koppel je persoonlijke Spotify- of accountlink voor snelle toegang.</p>
            
            <form id="account-link-form" class="space-y-2">
                <input type="url" id="user-spotify-link" placeholder="Plak hier je favoriete Spotify/Podcast link..." class="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-xs">
                <button type="submit" class="w-full py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition">Koppeling Opslaan 🔗</button>
            </form>
            <div id="saved-account-link-box" class="mt-3 text-xs text-gray-600"></div>
        </div>
    `;

    initLuchtigLogic(appData);
}

// ---------------------------------------------------------
// Luchtig Logica
// ---------------------------------------------------------

function initLuchtigLogic(appData) {
    // 1. Mop logica
    let jokeIndex = 0;
    const jokeCard = document.getElementById('joke-card');
    
    function displayJoke() {
        jokeCard.textContent = JOKES[jokeIndex];
    }

    document.getElementById('next-joke-btn').onclick = () => {
        jokeIndex = (jokeIndex + 1) % JOKES.length;
        displayJoke();
    };
    displayJoke();

    // 2. Playlists logica
    renderPlaylists(appData);

    document.getElementById('add-playlist-btn').onclick = () => {
        const title = prompt("Naam van de afspeellijst of podcast:");
        const desc = prompt("Korte omschrijving:");
        const link = prompt("Luisterlink (bijv. Spotify URL):", "https://open.spotify.com");
        if (title) {
            if (!appData.luchtig.customPlaylists) appData.luchtig.customPlaylists = [...DEFAULT_PLAYLISTS];
            appData.luchtig.customPlaylists.push({ id: Date.now(), title, desc: desc || 'Favoriete afspeellijst', link: link || 'https://open.spotify.com' });
            saveAppData(appData);
            renderPlaylists(appData);
            showToast("Playlist toegevoegd! 🎧");
        }
    };

    // 3. Account link logica
    if (!appData.luchtig.userLink) appData.luchtig.userLink = '';
    const linkInput = document.getElementById('user-spotify-link');
    const linkBox = document.getElementById('saved-account-link-box');

    linkInput.value = appData.luchtig.userLink;
    renderUserLinkBox();

    document.getElementById('account-link-form').onsubmit = (e) => {
        e.preventDefault();
        appData.luchtig.userLink = linkInput.value.trim();
        saveAppData(appData);
        renderUserLinkBox();
        showToast("Luisterlink succesvol opgeslagen! 🔗");
    };

    function renderUserLinkBox() {
        if (appData.luchtig.userLink) {
            linkBox.innerHTML = `Gekoppelde link: <a href="${appData.luchtig.userLink}" target="_blank" class="text-indigo-600 font-bold underline">Open jouw luister-omgeving 🎧</a>`;
        } else {
            linkBox.innerHTML = `<span class="italic text-gray-400">Nog geen persoonlijke link gekoppeld.</span>`;
        }
    }
}

function renderPlaylists(appData) {
    const container = document.getElementById('playlists-container');
    const playlists = appData.luchtig?.customPlaylists || DEFAULT_PLAYLISTS;

    container.innerHTML = playlists.map((p, idx) => `
        <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs">
            <div>
                <span class="font-bold text-indigo-950">🎵 ${p.title}</span>
                <p class="text-gray-500 mt-0.5">${p.desc}</p>
            </div>
            <div class="flex items-center gap-2">
                <a href="${p.link}" target="_blank" class="px-3 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition">Luister</a>
                ${idx >= DEFAULT_PLAYLISTS.length ? `<button onclick="window.deleteCustomPlaylist(${p.id})" class="text-gray-300 hover:text-red-500">✕</button>` : ''}
            </div>
        </div>
    `).join('');

    window.deleteCustomPlaylist = (id) => {
        appData.luchtig.customPlaylists = appData.luchtig.customPlaylists.filter(x => x.id !== id);
        saveAppData(appData);
        renderPlaylists(appData);
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
