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

// Slimme migratie die jouw oude backup-formaat (met losse voldaan_ sleutels) feilloos omzet
function migrateDataStructure(data) {
    if (!data) return getInitialAppData();

    // Als het een platte export is van jouw oude app, converteren we hem hier direct:
    let parsedTasks = [];
    let parsedMarbles = [];
    let parsedMoods = [];
    let parsedIdeas = [];

    try {
        if (data.voldaan_tasks) parsedTasks = JSON.parse(data.voldaan_tasks);
        if (data.voldaan_marbles) parsedMarbles = JSON.parse(data.voldaan_marbles);
        if (data.voldaan_energy_logs) {
            parsedMoods = JSON.parse(data.voldaan_energy_logs).map(e => ({
                id: e.id || Date.now(),
                mood: e.energy || 'Oké',
                icon: e.energy === 'Gefocust' ? '🚀' : e.energy === 'Wazig / Moe' ? '🌫️' : '🪨',
                date: e.displayTime ? new Date().toISOString() : new Date(e.timestamp).toISOString()
            }));
        }
        if (data.voldaan_ideas) parsedIdeas = JSON.parse(data.voldaan_ideas);
    } catch (err) {
        console.error("Kon oude tabellendata niet parsen:", err);
    }

    return {
        settings: data.settings || { darkMode: false },
        moods: data.moods && data.moods.length > 0 ? data.moods : parsedMoods,
        marbles: data.marbles && data.marbles.length > 0 ? data.marbles : parsedMarbles,
        tasks: data.tasks && data.tasks.length > 0 ? data.tasks : parsedTasks.map(t => ({
            id: t.id,
            text: t.text,
            category: t.category || 'Algemeen',
            priority: 'Normaal',
            completed: t.done || false,
            archived: t.archived || false,
            date: t.created ? new Date().toISOString() : new Date().toISOString()
        })),
        eveningPacts: data.eveningPacts || [],
        goals: data.goals || [],
        vitality: data.vitality || { sleep: [], steps: [], sport: [], nutrition: [], snackWaits: [] },
        money: data.money || { balance: parseFloat(data.voldaan_bank_balance) || 0, transactions: [], expectedExpenses: [], impulseWants: [], savingsPots: [], financialProjects: [], studyDebt: { total: 41939, paid: 477.35, monthly: 477.35 } },
        ideasModule: data.ideasModule || {
            ideas: parsedIdeas.map(i => ({ id: i.id, text: i.text, category: i.category || 'Algemeen', archived: i.archived || false, date: new Date().toISOString() })),
            projects: [],
            categories: ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'],
            archivedIdeas: [],
            archivedProjects: []
        },
        knowledge: data.knowledge || { savedTips: [] },
        luchtig: data.luchtig || { customPlaylists: [], userLink: '' },
        plans: data.plans || {
            eveningPacts: [],
            tasks: parsedTasks.map(t => ({ id: t.id, text: t.text, category: t.category || 'Algemeen', priority: 'Normaal', completed: t.done || false, date: new Date().toISOString() })),
            goals: [],
            categories: ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'],
            archivedTasks: [], archivedPacts: [], archivedGoals: []
        }
    };
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

// Belonings-helper: voegt knikker toe + visuele beloning
export function voegTrotsKnikkerToe(appData, tekst, categorie = 'Algemeen') {
    if (!appData.marbles) appData.marbles = [];
    appData.marbles.push({
        id: Date.now(),
        text: tekst,
        category: categorie,
        date: new Date().toISOString()
    });
    saveAppData(appData);
    
    const flash = document.createElement('div');
    flash.className = 'fixed inset-0 bg-indigo-500/15 z-50 pointer-events-none transition duration-300';
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 400);

    const toast = document.createElement('div');
    toast.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-indigo-950 text-white px-4 py-2.5 rounded-xl text-xs font-medium shadow-lg z-50 transition transform duration-300';
    toast.textContent = `🏺 +1 Knikker in je Trots-Kluis! (${tekst})`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
