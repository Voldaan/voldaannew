// js/app.js
import { loadAppData } from './modules/storage.js';
import { initVandaagModule } from './modules/vandaag.js';
import { initPlannenModule } from './modules/plannen.js';
import { initMoneyModule } from './modules/money.js';
import { initVitalityModule } from './modules/vitality.js';
import { initIdeasModule } from './modules/ideas.js';
import { initKnowledgeModule } from './modules/knowledge.js';
import { initLuchtigModule } from './modules/luchtig.js';
import { initInsightsModule } from './modules/insights.js';

// Globale Ticker Functie (Laat wedstrijden deze week zien)
export function updateGlobalTicker(appData) {
    const wrapper = document.getElementById('global-ticker-container');
    const track = document.getElementById('global-ticker-track');
    if (!wrapper || !track) return;

    const matches = appData.plans?.matches || [];
    const now = new Date();
    
    // Einde van deze week (komende zondag 23:59:59)
    const endOfWeek = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = dayOfWeek === 0 ? 0 : (7 - dayOfWeek);
    endOfWeek.setDate(now.getDate() + daysUntilSunday);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter wedstrijden deze week die vanaf nu tot einde week spelen
    const upcomingThisWeek = matches.filter(m => {
        const matchDate = new Date(m.date);
        return matchDate >= now && matchDate <= endOfWeek;
    });

    upcomingThisWeek.sort((a, b) => new Date(a.date) - new Date(b.date));

    if (upcomingThisWeek.length === 0) {
        wrapper.classList.add('hidden');
        return;
    }

    wrapper.classList.remove('hidden');

    const itemsHTML = upcomingThisWeek.map(m => {
        const isThuis = m.location === 'Thuis';
        const displayTeams = isThuis ? `${m.club} - ${m.opponent}` : `${m.opponent} - ${m.club}`;
        const dateFormatted = new Date(m.date).toLocaleString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="ticker-pill">
                <span class="text-emerald-800">⚽ ${displayTeams}</span>
                <span class="text-emerald-300">|</span>
                <span class="text-gray-500 font-normal">📅 ${dateFormatted}</span>
                <span class="px-1 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">${m.location}</span>
            </div>
        `;
    }).join('');

    // Verdubbel de items zodat de oneindige loop naadloos doorloopt
    track.innerHTML = itemsHTML + `<span class="mx-3 text-emerald-300">•</span>` + itemsHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    let appData = loadAppData();

    // Maak updateGlobalTicker globaal beschikbaar zodat plannen.js deze ook direct kan aanroepen bij wijzigingen
    window.updateGlobalTicker = () => updateGlobalTicker(appData);

    // Initialiseer de ticker direct bij opstarten
    window.updateGlobalTicker();

    // Initialiseer alle modules direct bij opstarten zodat de DOM-elementen bestaan
    try { initVandaagModule(appData); } catch (e) { console.error("Fout Vandaag:", e); }
    try { initPlannenModule(appData); } catch (e) { console.error("Fout Plannen:", e); }
    try { initMoneyModule(appData); } catch (e) { console.error("Fout Geld:", e); }
    try { initVitalityModule(appData); } catch (e) { console.error("Fout Vitaliteit:", e); }
    try { initIdeasModule(appData); } catch (e) { console.error("Fout Ideeën:", e); }
    try { initKnowledgeModule(appData); } catch (e) { console.error("Fout Kennis:", e); }
    try { initLuchtigModule(appData); } catch (e) { console.error("Fout Luchtig:", e); }
    try { initInsightsModule(appData); } catch (e) { console.error("Fout Inzichten:", e); }

    // Globale switchTab functie
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

        // Sla het actieve tabblad op zodat het onthouden wordt bij verversen
        localStorage.setItem('activeTab', tabId);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Klik-listeners koppelen aan alle navigatieknoppen onderaan
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            if (tabId) {
                window.switchTab(tabId);
            }
        });
    });

    // Herstel het laatst bezochte tabblad bij opstarten of verversen
    const savedTab = localStorage.getItem('activeTab') || 'vandaag';
    window.switchTab(savedTab);
});
