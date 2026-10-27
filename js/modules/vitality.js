// js/modules/vitality.js
import { saveAppData } from './storage.js';

// Juiste declaratie van de variabele (zonder 'function' ervoor)
let snackTimerRunning = false;

export function initVitalityModule(appData) {
    renderVitalityStats(appData);

    // Event listener voor de Snaai-wachtkamer timer / teller
    const snackButton = document.getElementById('start-snack-timer');
    if (snackButton) {
        snackButton.addEventListener('click', () => {
            startSnackTimer(appData);
        });
    }

    // Event listener voor slaap/stappen loggen
    const vitalityForm = document.getElementById('vitality-form');
    if (vitalityForm) {
        vitalityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const stepsInput = document.getElementById('steps-input');
            const steps = stepsInput ? parseInt(stepsInput.value) : 0;

            if (!isNaN(steps)) {
                appData.vitality.steps = steps;
                saveAppData(appData);
                renderVitalityStats(appData);
                vitalityForm.reset();
            }
        });
    }
}

// Toon vitaliteit statistieken
function renderVitalityStats(appData) {
    const stepsElement = document.getElementById('current-steps');
    if (stepsElement) {
        stepsElement.textContent = appData.vitality.steps || 0;
    }

    const snackCountElement = document.getElementById('snack-wait-count');
    if (snackCountElement) {
        snackCountElement.textContent = appData.vitality.snackWaitCount || 0;
    }
}

// Simuleer de wachttijd logica
function startSnackTimer(appData) {
    if (snackTimerRunning) return;
    snackTimerRunning = true;
    
    const timerDisplay = document.getElementById('snack-timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = "Wachtkamer actief (15 min)...";
    }

    setTimeout(() => {
        appData.vitality.snackWaitCount = (appData.vitality.snackWaitCount || 0) + 1;
        saveAppData(appData);
        renderVitalityStats(appData);
        
        if (timerDisplay) {
            timerDisplay.textContent = "Wachttijd voltooid! Voel je het nog steeds?";
        }
        snackTimerRunning = false;
    }, 5000); 
}
