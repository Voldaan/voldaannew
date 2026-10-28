// js/modules/storage.js

const STORAGE_KEY = 'voldaan_app_data_v2';

export function loadAppData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    
    // Controleer ook op losse oude backup-sleutels
    const legacyIdeas = localStorage.getItem('voldaan_ideas');
    const legacyTasks = localStorage.getItem('voldaan_tasks');
    const legacyMarbles = localStorage.getItem('voldaan_marbles');
    const legacyTransactions = localStorage.getItem('voldaan_transactions');
    const legacyBalance = localStorage.getItem('voldaan_bank_balance');
    const legacyBills = localStorage.getItem('voldaan_fixed_bills');
    const legacyProjects = localStorage.getItem('voldaan_ruimte_projects');
    const legacyStudy = localStorage.getItem('voldaan_study_debt');
    const legacyMoods = localStorage.getItem('voldaan_energy_logs');

    let parsedData = {};
    if (raw) {
        try { parsedData = JSON.parse(raw); } catch (e) { console.error(e); }
    }

    if (!parsedData.voldaan_ideas && legacyIdeas) parsedData.voldaan_ideas = legacyIdeas;
    if (!parsedData.voldaan_tasks && legacyTasks) parsedData.voldaan_tasks = legacyTasks;
    if (!parsedData.voldaan_marbles && legacyMarbles) parsedData.voldaan_marbles = legacyMarbles;
    if (!parsedData.voldaan_transactions && legacyTransactions) parsedData.voldaan_transactions = legacyTransactions;
    if (!parsedData.voldaan_bank_balance && legacyBalance) parsedData.voldaan_bank_balance = legacyBalance;
    if (!parsedData.voldaan_fixed_bills && legacyBills) parsedData.voldaan_fixed_bills = legacyBills;
    if (!parsedData.voldaan_ruimte_projects && legacyProjects) parsedData.voldaan_ruimte_projects = legacyProjects;
    if (!parsedData.voldaan_study_debt && legacyStudy) parsedData.voldaan_study_debt = legacyStudy;
    if (!parsedData.voldaan_energy_logs && legacyMoods) parsedData.voldaan_energy_logs = legacyMoods;

    return migrateDataStructure(parsedData);
}

export function saveAppData(appData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function migrateDataStructure(data) {
    if (!data) return getInitialAppData();

    let parsedTasks = [];
    let parsedMarbles = [];
    let parsedMoods = [];
    let parsedIdeas = [];
    let parsedProjects = [];
    let parsedTransactions = [];
    let parsedExpected = [];
    let parsedStudyDebt = { total: 41939, paid: 477.35, monthly: 477.35 };

    try {
        if (data.voldaan_tasks) parsedTasks = typeof data.voldaan_tasks === 'string' ? JSON.parse(data.voldaan_tasks) : data.voldaan_tasks;
        if (data.voldaan_marbles) parsedMarbles = typeof data.voldaan_marbles === 'string' ? JSON.parse(data.voldaan_marbles) : data.voldaan_marbles;
        if (data.voldaan_energy_logs) parsedMoods = typeof data.voldaan_energy_logs === 'string' ? JSON.parse(data.voldaan_energy_logs) : data.voldaan_energy_logs;
        if (data.voldaan_ideas) parsedIdeas = typeof data.voldaan_ideas === 'string' ? JSON.parse(data.voldaan_ideas) : data.voldaan_ideas;
        if (data.voldaan_ruimte_projects) parsedProjects = typeof data.voldaan_ruimte_projects === 'string' ? JSON.parse(data.voldaan_ruimte_projects) : data.voldaan_ruimte_projects;
        if (data.voldaan_transactions) parsedTransactions = typeof data.voldaan_transactions === 'string' ? JSON.parse(data.voldaan_transactions) : data.voldaan_transactions;
        if (data.voldaan_fixed_bills) parsedExpected = typeof data.voldaan_fixed_bills === 'string' ? JSON.parse(data.voldaan_fixed_bills) : data.voldaan_fixed_bills;
        if (data.voldaan_study_debt) parsedStudyDebt = typeof data.voldaan_study_debt === 'string' ? JSON.parse(data.voldaan_study_debt) : data.voldaan_study_debt;
    } catch (err) {
        console.error("Fout bij parsen backup datatabellen:", err);
    }

    const formattedMoods = parsedMoods.map(e => ({
        id: e.id || Date.now(),
        mood: e.energy || e.mood || 'Oké',
        icon: (e.energy === 'Gefocust' || e.mood === 'Gefocust') ? '🚀' : (e.energy === 'Wazig / Moe' || e.mood === 'Wazig / Moe') ? '🌫️' : '🪨',
        date: e.date || new Date().toISOString()
    }));

    const formattedMarbles = parsedMarbles.map(m => ({
        id: m.id || Date.now(),
        text: m.reason || m.text || 'Knikker',
        category: m.category || 'Algemeen',
        date: m.date || new Date().toISOString()
    }));

    const formattedTasks = parsedTasks.map(t => ({
        id: t.id || Date.now(),
        text: t.text,
        category: t.category || 'Algemeen',
        priority: 'Normaal',
        completed: t.done || t.completed || false,
        archived: t.archived || false,
        date: t.date || new Date().toISOString()
    }));

    const formattedIdeas = parsedIdeas.map(i => ({
        id: i.id || Date.now(),
        text: i.text,
        category: i.category || 'Algemeen',
        archived: i.archived || false,
        date: i.date || new Date().toISOString()
    }));

    return {
        settings: data.settings || { darkMode: false },
        moods: (data.moods && data.moods.length > 0) ? data.moods : formattedMoods,
        marbles: (data.marbles && data.marbles.length > 0) ? data.marbles : formattedMarbles,
        tasks: formattedTasks.filter(t => !t.archived && !t.completed),
        eveningPacts: data.eveningPacts || [],
        goals: data.goals || [],
        vitality: data.vitality || { sleep: [], steps: [], sport: [], sportTypes: ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'], nutrition: [], snackWaits: [] },
        money: data.money || {
            balance: parseFloat(data.voldaan_bank_balance) || 37.70,
            transactions: parsedTransactions.map(tx => ({
                id: tx.id || Date.now(),
                description: tx.title || tx.description || 'Transactie',
                amount: tx.type === 'EXPENSE' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
                category: tx.category || 'Algemeen',
                label: tx.label || 'Geen bewustwordingslabel',
                date: tx.datetime || tx.created || new Date().toISOString()
            })),
            expectedExpenses: parsedExpected.map(ex => ({
                id: ex.id || Date.now(),
                description: ex.name || 'Verwachte uitgave',
                amount: ex.amount || ex.rawAmount || 0,
                method: ex.type || 'Automatische Incasso',
                category: 'Geld & Aflossingen',
                date: ex.date || new Date().toISOString().slice(0,10),
                completed: ex.paid || false
            })),
            financialProjects: parsedProjects.map(p => ({
                id: p.id || Date.now(),
                title: p.title,
                target: p.totalAmount || 0,
                freed: p.repaidAmount || 0,
                history: p.history || []
            })),
            studyDebt: parsedStudyDebt,
            impulseWants: [],
            savingsPots: []
        },
        ideasModule: {
            ideas: formattedIdeas.filter(i => !i.archived),
            archivedIdeas: formattedIdeas.filter(i => i.archived),
            projects: data.voldaan_projects ? (typeof data.voldaan_projects === 'string' ? JSON.parse(data.voldaan_projects) : data.voldaan_projects) : [],
            categories: data.voldaan_categories ? (typeof data.voldaan_categories === 'string' ? JSON.parse(data.voldaan_categories) : data.voldaan_categories) : ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'],
            archivedProjects: []
        },
        knowledge: data.knowledge || { savedTips: [] },
        luchtig: data.luchtig || { customPlaylists: [], userLink: '' },
        plans: {
            eveningPacts: data.eveningPacts || [],
            tasks: formattedTasks,
            goals: data.goals || [],
            categories: ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'],
            archivedTasks: formattedTasks.filter(t => t.archived || t.completed),
            archivedPacts: [], archivedGoals: []
        }
    };
}

export function getInitialAppData() {
    return migrateDataStructure({});
}

// Uitgebreide datumfilter logica voor alle tabbladen
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

    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
    }, 20);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

export function voegTrotsKnikkerToe(appData, tekst, categorie = 'Algemeen') {
    if (!appData.marbles) appData.marbles = [];
    appData.marbles.push({
        id: Date.now(),
        text: tekst,
        category: categorie,
        date: new Date().toISOString()
    });
    saveAppData(appData);
    showToast(`🏺 +1 Knikker in je Trots-Kluis! (${tekst})`);
}
