// js/modules/storage.js

const STORAGE_KEY = 'voldaan_app_data_v2';

export function loadAppData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        return getInitialAppData();
    }
    try {
        const parsed = JSON.parse(raw);
        return migrateDataStructure(parsed);
    } catch (e) {
        console.error("Fout bij laden app data:", e);
        return getInitialAppData();
    }
}

export function saveAppData(appData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

// Zorgt ervoor dat oude en nieuwe back-ups naadloos passen en geen lege schermen geven
function migrateDataStructure(data) {
    if (!data) return getInitialAppData();

    // Als de backup losse tabblad-objecten mist, vullen we ze veilig aan
    if (!data.moods) data.moods = [];
    if (!data.marbles) data.marbles = [];
    if (!data.tasks) data.tasks = [];
    if (!data.eveningPacts) data.eveningPacts = [];
    
    if (!data.money) {
        data.money = { balance: 0, transactions: [], expectedExpenses: [], impulseWants: [], savingsPots: [], financialProjects: [], studyDebt: { total: 0, paid: 0, monthly: 50 } };
    }
    if (!data.vitality) {
        data.vitality = { sleep: [], steps: [], sport: [], sportTypes: ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'], nutrition: [], snackWaits: [] };
    }
    if (!data.plans) {
        data.plans = { eveningPacts: [], tasks: data.tasks || [], goals: [], categories: ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'], archivedTasks: [], archivedPacts: [], archivedGoals: [] };
    }
    if (!data.ideasModule) {
        data.ideasModule = { ideas: data.ideas || [], projects: [], categories: ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'], archivedIdeas: [], archivedProjects: [] };
    }
    if (!data.knowledge) {
        data.knowledge = { savedTips: [] };
    }
    if (!data.luchtig) {
        data.luchtig = { customPlaylists: [], userLink: '' };
    }

    return data;
}

export function getInitialAppData() {
    return migrateDataStructure({});
}

// Universele datumfilter helper voor alle tabbladen
export function checkDateFilter(dateString, filterType) {
    if (!dateString) return true;
    const itemDate = new Date(dateString);
    const now = new Date();

    if (filterType === 'all') return true;
    
    if (filterType === 'today') {
        return itemDate.toDateString() === now.toDateString();
    }
    
    if (filterType === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1)); // Maandag start
        startOfWeek.setHours(0,0,0,0);
        return itemDate >= startOfWeek;
    }
    
    if (filterType === 'month') {
        return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }

    if (filterType === 'year') {
        return itemDate.getFullYear() === now.getFullYear();
    }

    return true;
}
