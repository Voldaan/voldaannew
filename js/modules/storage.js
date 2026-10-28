// js/modules/storage.js

const STORAGE_KEY = 'voldaan_app_data_v2';

export function loadAppData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    let parsedData = {};
    if (raw) {
        try { parsedData = JSON.parse(raw); } catch (e) { console.error(e); }
    }
    return migrateDataStructure(parsedData);
}

export function saveAppData(appData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function migrateDataStructure(data) {
    if (!data) return getInitialAppData();
    return {
        settings: data.settings || { darkMode: false },
        moods: data.moods || [],
        marbles: data.marbles || [],
        tasks: data.tasks || [],
        eveningPacts: data.eveningPacts || [],
        goals: data.goals || [],
        vitality: data.vitality || { sleep: [], steps: [], sport: [], sportTypes: ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'], nutrition: [], snackWaits: [] },
        money: data.money || { balance: 37.70, transactions: [], expectedExpenses: [], impulseWants: [], savingsPots: [], financialProjects: [], studyDebt: { total: 41939, paid: 477.35, monthly: 477.35 } },
        ideasModule: data.ideasModule || { ideas: [], projects: [], categories: ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'], archivedIdeas: [], archivedProjects: [] },
        knowledge: data.knowledge || { savedTips: [] },
        luchtig: data.luchtig || { customPlaylists: [], userLink: '' },
        plans: data.plans || { eveningPacts: [], tasks: [], goals: [], categories: ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'], archivedTasks: [], archivedPacts: [], archivedGoals: [] }
    };
}

export function getInitialAppData() {
    return migrateDataStructure({});
}

// Uitgebreide datumfilter logica voor de hele app
export function checkDateFilter(dateString, filterType, customValue = null) {
    if (!dateString) return true;
    const itemDate = new Date(dateString);
    const now = new Date();

    if (filterType === 'all') return true;
    if (filterType === 'today') {
        return itemDate.toDateString() === now.toDateString();
    }
    if (filterType === 'specific-day' && customValue) {
        return itemDate.toDateString() === new Date(customValue).toDateString();
    }
    if (filterType === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
        startOfWeek.setHours(0,0,0,0);
        return itemDate >= startOfWeek;
    }
    if (filterType === 'specific-week' && customValue) {
        const targetDate = new Date(customValue);
        return itemDate >= targetDate && itemDate <= new Date(targetDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
    if (filterType === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    if (filterType === 'specific-month' && customValue) {
        const [year, month] = customValue.split('-');
        return itemDate.getFullYear() === parseInt(year) && (itemDate.getMonth() + 1) === parseInt(month);
    }
    if (filterType === 'year' || filterType === 'specific-year') {
        const targetYear = customValue ? parseInt(customValue) : now.getFullYear();
        return itemDate.getFullYear() === targetYear;
    }
    return true;
}

// Niet-overlappende Toast meldingen manager
export function showToast(msg) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed bottom-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none items-center w-full max-w-xs px-4';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'bg-indigo-950 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg transition transform duration-300 pointer-events-auto opacity-0 translate-y-2 w-full text-center';
    toast.textContent = msg;
    container.appendChild(toast);

    setTimeout(() => toast.classList.remove('opacity-0', 'translate-y-2'), 20);
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

export function voegTrotsKnikkerToe(appData, tekst, categorie = 'Algemeen') {
    if (!appData.marbles) appData.marbles = [];
    appData.marbles.push({ id: Date.now(), text: tekst, category: categorie, date: new Date().toISOString() });
    saveAppData(appData);
    showToast(`🏺 +1 Knikker in je Trots-Kluis! (${tekst})`);
}
