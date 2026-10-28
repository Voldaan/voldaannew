// js/modules/storage.js

const STORAGE_KEY = 'voldaan_app_data_v2';

export function loadAppData() {
    let parsedData = {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            parsedData = JSON.parse(raw);
        }
    } catch (e) {
        console.error("Fout bij laden app data:", e);
    }
    return migrateDataStructure(parsedData);
}

export function saveAppData(appData) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
    } catch (e) {
        console.error("Fout bij opslaan app data:", e);
    }
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
        buddySettings: data.buddySettings || { buttons: [] },
        vitality: data.vitality || { sleep: [], steps: [], sport: [], sportTypes: ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Hardlopen', 'Rekken / Yoga'], nutrition: [], snackWaits: [] },
        money: data.money || { balance: 37.70, transactions: [], expectedExpenses: [], impulseWants: [], savingsPots: [], financialProjects: [], studyDebt: { total: 41939, paid: 477.35, monthly: 477.35 } },
        ideasModule: data.ideasModule || { ideas: [], projects: [], categories: ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'], archivedIdeas: [], archivedProjects: [] },
        knowledge: data.knowledge || { savedTips: [] },
        luchtig: data.luchtig || { customPlaylists: [], userLink: '' },
        plans: data.plans || { eveningPacts: [], tasks: [], goals: [], categories: ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'], archivedTasks: [], archivedPacts: [], archivedGoals: [] }
    };
}

export function getInitialAppData() {
    return {
        settings: { darkMode: false },
        moods: [],
        marbles: [],
        tasks: [],
        eveningPacts: [],
        goals: [],
        buddySettings: { buttons: [] },
        vitality: { sleep: [], steps: [], sport: [], sportTypes: ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Hardlopen', 'Rekken / Yoga'], nutrition: [], snackWaits: [] },
        money: { balance: 37.70, transactions: [], expectedExpenses: [], impulseWants: [], savingsPots: [], financialProjects: [], studyDebt: { total: 41939, paid: 477.35, monthly: 477.35 } },
        ideasModule: { ideas: [], projects: [], categories: ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'], archivedIdeas: [], archivedProjects: [] },
        knowledge: { savedTips: [] },
        luchtig: { customPlaylists: [], userLink: '' },
        plans: { eveningPacts: [], tasks: [], goals: [], categories: ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'], archivedTasks: [], archivedPacts: [], archivedGoals: [] }
    };
}

/**
 * Centrale datumfilter logica voor alle onderwerpen op de site
 * Ondersteunt: 'all', 'today', 'specific-day', 'week', 'specific-week', 'month', 'specific-month', 'year', 'specific-year'
 */
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
        startOfWeek.setHours(0, 0, 0, 0);
        return itemDate >= startOfWeek;
    }

    if (filterType === 'specific-week' && customValue) {
        // customValue verwacht bijv. een datum binnen die week of een week-string
        const targetDate = new Date(customValue);
        const targetWeekStart = new Date(targetDate);
        targetWeekStart.setDate(targetDate.getDate() - targetDate.getDay() + (targetDate.getDay() === 0 ? -6 : 1));
        targetWeekStart.setHours(0, 0, 0, 0);
        
        const targetWeekEnd = new Date(targetWeekStart);
        targetWeekEnd.setDate(targetWeekStart.getDate() + 7);

        return itemDate >= targetWeekStart && itemDate < targetWeekEnd;
    }

    if (filterType === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }

    if (filterType === 'specific-month' && customValue) {
        // customValue in formaat 'YYYY-MM'
        const [targetYear, targetMonth] = customValue.split('-').map(Number);
        return itemDate.getMonth() === (targetMonth - 1) && itemDate.getFullYear() === targetYear;
    }

    if (filterType === 'year') {
        return itemDate.getFullYear() === now.getFullYear();
    }

    if (filterType === 'specific-year' && customValue) {
        return itemDate.getFullYear() === parseInt(customValue);
    }

    return true;
}

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
