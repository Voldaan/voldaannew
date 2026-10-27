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

// Feilloze migratie van jouw specifieke backup-structuur naar de nieuwe app-objecten
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
        // 1. Taken (Zacht Planbord)
        if (data.voldaan_tasks) {
            parsedTasks = JSON.parse(data.voldaan_tasks);
        }
        // 2. Knikkers (Trots-Kluis)
        if (data.voldaan_marbles) {
            parsedMarbles = JSON.parse(data.voldaan_marbles);
        }
        // 3. Moods (Mijn Dag Begint Nu)
        if (data.voldaan_energy_logs) {
            parsedMoods = JSON.parse(data.voldaan_energy_logs).map(e => ({
                id: e.id || Date.now(),
                mood: e.energy || 'Oké',
                icon: e.energy === 'Gefocust' ? '🚀' : e.energy === 'Wazig / Moe' ? '🌫️' : '🪨',
                date: e.displayTime ? new Date().toISOString() : new Date(e.timestamp || Date.now()).toISOString()
            }));
        }
        // 4. Ideeën (Ideeënkluis)
        if (data.voldaan_ideas) {
            parsedIdeas = JSON.parse(data.voldaan_ideas);
        }
        // 5. Geld / Ruimte-kompas projecten
        if (data.voldaan_ruimte_projects) {
            parsedProjects = JSON.parse(data.voldaan_ruimte_projects);
        }
        // 6. Transacties
        if (data.voldaan_transactions) {
            parsedTransactions = JSON.parse(data.voldaan_transactions);
        }
        // 7. Vaste lasten / Verwachte uitgaven
        if (data.voldaan_fixed_bills) {
            parsedExpected = JSON.parse(data.voldaan_fixed_bills);
        }
        // 8. Studieschuld
        if (data.voldaan_study_debt) {
            parsedStudyDebt = JSON.parse(data.voldaan_study_debt);
        }
    } catch (err) {
        console.error("Fout bij parsen backup tabellendata:", err);
    }

    // Mappen netjes vullen met zowel nieuwe app-data als je oude backup-data
    return {
        settings: data.settings || { darkMode: false },
        moods: (data.moods && data.moods.length > 0) ? data.moods : parsedMoods,
        marbles: (data.marbles && data.marbles.length > 0) ? data.marbles : parsedMarbles.map(m => ({
            id: m.id || Date.now(),
            text: m.reason || m.text || 'Knikker',
            category: m.category || 'Algemeen',
            date: m.date ? new Date().toISOString() : new Date().toISOString()
        })),
        tasks: (data.tasks && data.tasks.length > 0) ? data.tasks : parsedTasks.map(t => ({
            id: t.id,
            text: t.text,
            category: t.category || 'Algemeen',
            priority: 'Normaal',
            completed: t.done || t.completed || false,
            archived: t.archived || false,
            date: t.created ? new Date().toISOString() : new Date().toISOString()
        })),
        eveningPacts: data.eveningPacts || [],
        goals: data.goals || [],
        vitality: data.vitality || { sleep: [], steps: [], sport: [], sportTypes: ['Wandelen', 'Fietsen', 'Sport / Workout', 'Voetbal', 'Zaalvoetbal', 'Hardlopen', 'Rekken / Yoga'], nutrition: [], snackWaits: [] },
        money: data.money || {
            balance: parseFloat(data.voldaan_bank_balance) || 37.70,
            transactions: parsedTransactions.map(tx => ({
                id: tx.id,
                description: tx.title || tx.description || 'Transactie',
                amount: tx.type === 'EXPENSE' ? -Math.abs(tx.amount) : Math.abs(tx.amount),
                category: tx.category || 'Algemeen',
                label: tx.label || 'Geen bewustwordingslabel',
                date: tx.datetime || tx.created || new Date().toISOString()
            })),
            expectedExpenses: parsedExpected.map(ex => ({
                id: ex.id,
                description: ex.name || 'Verwachte uitgave',
                amount: ex.amount || 0,
                method: ex.type || 'Automatische Incasso',
                category: 'Geld & Aflossingen',
                date: ex.date || new Date().toISOString().slice(0,10),
                completed: ex.paid || false
            })),
            financialProjects: parsedProjects.map(p => ({
                id: p.id,
                title: p.title,
                target: p.totalAmount || 0,
                freed: p.repaidAmount || 0,
                history: p.history || []
            })),
            studyDebt: {
                total: parsedStudyDebt.total || 41939,
                paid: parsedStudyDebt.repaid || 477.35,
                monthly: parsedStudyDebt.monthly || 477.35
            },
            impulseWants: [],
            savingsPots: []
        },
        ideasModule: data.ideasModule || {
            ideas: parsedIdeas.map(i => ({
                id: i.id,
                text: i.text,
                category: i.category || 'Algemeen',
                archived: i.archived || false,
                date: i.created ? new Date().toISOString() : new Date().toISOString()
            })),
            projects: [],
            categories: ['Algemeen', 'Voldaan', 'Creatief', 'Werk / Studie', 'Privé / Thuis'],
            archivedIdeas: [],
            archivedProjects: []
        },
        knowledge: data.knowledge || { savedTips: [] },
        luchtig: data.luchtig || { customPlaylists: [], userLink: '' },
        plans: data.plans || {
            eveningPacts: [],
            tasks: parsedTasks.map(t => ({
                id: t.id,
                text: t.text,
                category: t.category || 'Algemeen',
                priority: 'Normaal',
                completed: t.done || t.completed || false,
                date: t.created ? new Date().toISOString() : new Date().toISOString()
            })),
            goals: [],
            categories: ['Privé', 'Gezin', 'Werk', 'Klussen', 'Vrije Tijd', 'Gezondheid', 'Financieel'],
            archivedTasks: [], archivedPacts: [], archivedGoals: []
        }
    };
}

export function getInitialAppData() {
    return migrateDataStructure({});
}

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
