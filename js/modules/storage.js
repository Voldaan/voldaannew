// js/modules/storage.js

const STORAGE_KEY = 'voldaan_app_data_v2';

const defaultAppData = {
    settings: { darkMode: false },
    moods: [],
    marbles: [],
    tasks: [],
    eveningPacts: [],
    goals: [],
    vitality: { sleep: [], steps: [], sport: [], nutrition: [], snackWaits: [] },
    money: { balance: 0, transactions: [], impulseWants: [], savingsPots: [] },
    ideas: [],
    projects: [],
    knowledgeTips: []
};

export function loadAppData() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        saveAppData(defaultAppData);
        return JSON.parse(JSON.stringify(defaultAppData));
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Fout bij laden data:", e);
        return JSON.parse(JSON.stringify(defaultAppData));
    }
}

export function saveAppData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Universele datumfilter-checker
export function checkDateFilter(itemDateString, filterType) {
    if (!itemDateString) return false;
    const itemDate = new Date(itemDateString);
    const now = new Date();

    if (filterType === 'all') return true;
    if (filterType === 'today') {
        return itemDate.toDateString() === now.toDateString();
    }
    if (filterType === 'week') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
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

export function exportBackup(data) {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voldaan_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}
