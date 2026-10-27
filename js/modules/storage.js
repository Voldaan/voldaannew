// js/modules/storage.js

// Standaard waarden voor als er nog niets in localStorage staat
const defaultData = {
    balance: 0,
    transactions: [],
    expenses: [],
    tasks: [],
    eveningPact: [],
    ideas: [],
    marbles: 0, // <-- Voeg deze toe
    vitality: {
        sleep: [],
        steps: 0,
        snackWaitCount: 0
    }
};

// Data ophalen uit localStorage
export function loadAppData() {
    try {
        const savedData = localStorage.getItem('voldaan_app_data');
        if (savedData) {
            return JSON.parse(savedData);
        }
    } catch (error) {
        console.error("Fout bij het laden van data uit localStorage:", error);
    }
    return defaultData;
}

// Data opslaan in localStorage
export function saveAppData(data) {
    try {
        localStorage.setItem('voldaan_app_data', JSON.stringify(data));
    } catch (error) {
        console.error("Fout bij het opslaan van data in localStorage:", error);
    }
}
