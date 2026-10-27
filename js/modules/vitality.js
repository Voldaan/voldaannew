// js/modules/vitality.js
import { saveAppData } from './storage.js';

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

// Simuleer de 15-minuten wachttijd logica
function snackTimerRunning = false;
function startSnackTimer(appData) {
    if (snackTimerRunning) return;
    snackTimerRunning = true;
    
    const timerDisplay = document.getElementById('snack-timer-display');
    if (timerDisplay) {
        timerDisplay.textContent = "Wachtkamer actief (15 min)...";
    }

    // Voor testdoeleinden of echte werking kun je hier een interval zetten
    setTimeout(() => {
        appData.vitality.snackWaitCount = (appData.vitality.snackWaitCount || 0) + 1;
        saveAppData(appData);
        renderVitalityStats(appData);
        
        if (timerDisplay) {
            timerDisplay.textContent = "Wachttijd voltooid! Voel je het nog steeds?";
        }
        snackTimerRunning = false;
    }, 5000); // Tijdelijk op 5 seconden gezet voor snelle test, pas aan naar wens (bijv. 900000 voor 15 min)
}
