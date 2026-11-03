// js/app.js
import { loadAppData, saveAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';
import { initPlannenModule } from './modules/plannen.js';
import { initMoneyModule } from './modules/money.js';
import { initVitalityModule } from './modules/vitality.js';
import { initIdeasModule } from './modules/ideas.js';
import { initKnowledgeModule } from './modules/knowledge.js';
import { initLuchtigModule } from './modules/luchtig.js';
import { initInsightsModule } from './modules/insights.js';

let cachedWeather = null;
let cachedNewsVenlo = null;
let cachedNewsNuNl = null;

async function fetchTegelenWeather() {
    if (cachedWeather) return cachedWeather;
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=51.36&longitude=6.16¤t=temperature_2m');
        const data = await res.json();
        if (data && data.current) {
            const temp = Math.round(data.current.temperature_2m);
            cachedWeather = `🌤️ Tegelen: ${temp}°C`;
            return cachedWeather;
        }
    } catch (e) {
        console.error("Kon weer niet ophalen", e);
    }
    return "🌤️ Tegelen: 14°C";
}

async function fetchOmroepVenloNews() {
    if (cachedNewsVenlo) return cachedNewsVenlo;
    try {
        const timestamp = new Date().getTime();
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.omroepvenlo.nl%2Fnieuws%2Frss&_t=${timestamp}`);
        const data = await res.json();
        if (data && data.items && data.items.length > 0) {
            cachedNewsVenlo = data.items.slice(0, 3).map(item => `📰 Omroep Venlo: ${item.title}`);
            return cachedNewsVenlo;
        }
    } catch (e) {
        console.error("Kon Omroep Venlo nieuws niet ophalen", e);
    }
    return ["📰 Omroep Venlo: Laatste lokaal nieuws"];
}

async function fetchNuNlNews() {
    if (cachedNewsNuNl) return cachedNewsNuNl;
    try {
        const timestamp = new Date().getTime();
        const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.nu.nl%2Frss%2FAlgemeen&_t=${timestamp}`);
        const data = await res.json();
        if (data && data.items && data.items.length > 0) {
            cachedNewsNuNl = data.items.slice(0, 4).map(item => `📰 NU.nl: ${item.title}`);
            return cachedNewsNuNl;
        }
    } catch (e) {
        console.error("Kon NU.nl nieuws niet ophalen", e);
    }
    return ["📰 NU.nl: Het laatste algemene nieuws"];
}

export async function updateGlobalTicker(appData) {
    const wrapper = document.getElementById('global-ticker-container');
    const track = document.getElementById('global-ticker-track');
    if (!wrapper || !track) return;

    if (!appData.tickerSettings) {
        appData.tickerSettings = {
            enabled: true,
            speed: '50',
            showMatches: true,
            showTasks: true,
            showMoney: true,
            showWeather: true,
            showNews: true,
            showNuNl: true
        };
    }

    const settings = appData.tickerSettings;

    if (settings.enabled === false) {
        wrapper.classList.add('hidden');
        return;
    }

    track.style.setProperty('--ticker-speed', `${settings.speed}s`);

    let items = [];

    // 1. Voetbalwedstrijden deze week
    if (settings.showMatches) {
        const matches = appData.plans?.matches || [];
        const now = new Date();
        const endOfWeek = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
        endOfWeek.setDate(now.getDate() + daysUntilSunday);
        endOfWeek.setHours(23, 59, 59, 999);

        const upcomingThisWeek = matches.filter(m => {
            const matchDate = new Date(m.date);
            return matchDate >= now && matchDate <= endOfWeek;
        });

        upcomingThisWeek.forEach(m => {
            const isThuis = m.location === 'Thuis';
            const displayTeams = isThuis ? `${m.club} - ${m.opponent}` : `${m.opponent} - ${m.club}`;
            const dateStr = new Date(m.date).toLocaleString('nl-NL', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
            items.push(`<div class="ticker-pill"><span class="text-emerald-800">⚽ ${displayTeams}</span><span class="text-emerald-300">|</span><span class="text-gray-500">${dateStr}</span></div>`);
        });
    }

    // 2. Focus taken uit het zachte planbord
    if (settings.showTasks) {
        const tasks = (appData.plans?.tasks || []).filter(t => !t.archived && !t.completed && !t.done);
        tasks.slice(0, 5).forEach(t => {
            items.push(`<div class="ticker-pill"><span class="text-indigo-800">🎯 Focus: ${t.text}</span><span class="px-1 py-0.2 bg-indigo-100 text-indigo-800 rounded text-[9px]">${t.category || 'Taken'}</span></div>`);
        });
    }

    // 3. Openstaande verwachte uitgaven vanaf vandaag tot einde van de week
    if (settings.showMoney) {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        const endOfWeek = new Date();
        const dayOfWeek = now.getDay();
        const daysUntilSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
        endOfWeek.setDate(now.getDate() + daysUntilSunday);
        endOfWeek.setHours(23, 59, 59, 999);

        const transactions = (appData.money?.transactions || []).filter(tx => {
            const isUitgave = tx.type === 'uitgave' || tx.amount < 0 || tx.bedrag < 0;
            const isNietAfgevinkt = !tx.completed && !tx.done && !tx.afgevinkt;
            
            const txDateStr = tx.date || tx.datum;
            if (!isUitgave || !isNietAfgevinkt || !txDateStr) return false;

            const txDate = new Date(txDateStr);
            return txDate >= now && txDate <= endOfWeek;
        });

        transactions.forEach(tx => {
            const amount = Math.abs(tx.amount || tx.bedrag || 0);
            items.push(`<div class="ticker-pill"><span class="text-amber-800">💰 Uitgave: ${tx.description || tx.titel || 'Kosten'} (€${amount})</span></div>`);
        });
    }

    // 4. Weer in Tegelen
    if (settings.showWeather) {
        const weatherText = await fetchTegelenWeather();
        items.push(`<div class="ticker-pill"><span>${weatherText}</span></div>`);
    }

    // 5. Omroep Venlo News
    if (settings.showNews) {
        const newsItems = await fetchOmroepVenloNews();
        newsItems.forEach(news => {
            items.push(`<div class="ticker-pill"><span>${news}</span></div>`);
        });
    }

    // 6. NU.nl News
    if (settings.showNuNl) {
        const nuItems = await fetchNuNlNews();
        nuItems.forEach(news => {
            items.push(`<div class="ticker-pill"><span>${news}</span></div>`);
        });
    }

    if (items.length === 0) {
        wrapper.classList.add('hidden');
        return;
    }

    wrapper.classList.remove('hidden');
    const combinedHTML = items.join(`<span class="mx-3 text-emerald-300">•</span>`);
    track.innerHTML = combinedHTML + `<span class="mx-3 text-emerald-300">•</span>` + combinedHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    let appData = loadAppData();

    window.updateGlobalTicker = () => updateGlobalTicker(appData);
    window.updateGlobalTicker();

    // Klik op ticker om te pauzeren / hervatten
    const tickerTrack = document.getElementById('global-ticker-track');
    if (tickerTrack) {
        tickerTrack.onclick = () => {
            tickerTrack.classList.toggle('ticker-paused');
        };
    }

    // Modal logica voor Live Ticker instellingen
    const tickerModal = document.getElementById('ticker-settings-modal');
    const openTickerBtn = document.getElementById('open-ticker-settings');
    const closeTickerBtn = document.getElementById('close-ticker-settings');
    const saveTickerBtn = document.getElementById('save-ticker-settings');

    if (openTickerBtn && tickerModal) {
        openTickerBtn.onclick = () => {
            tickerModal.classList.remove('hidden');
            const settings = appData.tickerSettings || {};
            document.getElementById('ticker-enabled-checkbox').checked = settings.enabled ?? true;
            document.getElementById('ticker-speed-select').value = settings.speed || '50';
            document.getElementById('show-ticker-matches').checked = settings.showMatches ?? true;
            document.getElementById('show-ticker-tasks').checked = settings.showTasks ?? true;
            document.getElementById('show-ticker-money').checked = settings.showMoney ?? true;
            document.getElementById('show-ticker-weather').checked = settings.showWeather ?? true;
            document.getElementById('show-ticker-news').checked = settings.showNews ?? true;
            document.getElementById('show-ticker-nu-nl').checked = settings.showNuNl ?? true;
        };
    }

    if (closeTickerBtn && tickerModal) {
        closeTickerBtn.onclick = () => tickerModal.classList.add('hidden');
    }

    if (saveTickerBtn && tickerModal) {
        saveTickerBtn.onclick = () => {
            appData.tickerSettings = {
                enabled: document.getElementById('ticker-enabled-checkbox').checked,
                speed: document.getElementById('ticker-speed-select').value,
                showMatches: document.getElementById('show-ticker-matches').checked,
                showTasks: document.getElementById('show-ticker-tasks').checked,
                showMoney: document.getElementById('show-ticker-money').checked,
                showWeather: document.getElementById('show-ticker-weather').checked,
                showNews: document.getElementById('show-ticker-news').checked,
                showNuNl: document.getElementById('show-ticker-nu-nl').checked
            };
            saveAppData(appData);
            tickerModal.classList.add('hidden');
            window.updateGlobalTicker();
        };
    }

    // Initialiseer modules
    try { initVandaagModule(appData); } catch (e) { console.error("Fout Vandaag:", e); }
    try { initPlannenModule(appData); } catch (e) { console.error("Fout Plannen:", e); }
    try { initMoneyModule(appData); } catch (e) { console.error("Fout Geld:", e); }
    try { initVitalityModule(appData); } catch (e) { console.error("Fout Vitaliteit:", e); }
    try { initIdeasModule(appData); } catch (e) { console.error("Fout Ideeën:", e); }
    try { initKnowledgeModule(appData); } catch (e) { console.error("Fout Kennis:", e); }
    try { initLuchtigModule(appData); } catch (e) { console.error("Fout Luchtig:", e); }
    try { initInsightsModule(appData); } catch (e) { console.error("Fout Inzichten:", e); }

    window.switchTab = function(tabId) {
        document.querySelectorAll('.tab-content').forEach(el => {
            el.classList.add('hidden');
        });

        const target = document.getElementById(tabId);
        if (target) {
            target.classList.remove('hidden');
        } else {
            tabId = 'vandaag';
            const fallback = document.getElementById('vandaag');
            if (fallback) fallback.classList.remove('hidden');
        }

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('text-indigo-600', 'font-bold');
            btn.classList.add('text-gray-500');
            
            if (btn.getAttribute('data-tab') === tabId) {
                btn.classList.add('text-indigo-600', 'font-bold');
                btn.classList.remove('text-gray-500');
            }
        });

        localStorage.setItem('activeTab', tabId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId) {
                window.switchTab(tabId);
            }
        });
    });

    const savedTab = localStorage.getItem('activeTab') || 'vandaag';
    window.switchTab(savedTab);
});
