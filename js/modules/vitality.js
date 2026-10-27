// js/modules/vitality.js
import { saveAppData } from './storage.js';

let snackTimerRunning = false;
let timerInterval = null;

export function initVitalityModule(appData) {
    renderVitalityStats(appData);

    // Event listener voor de Snaai-wachtkamer timer
    const snackButton = document.getElementById('start-snack-timer');
    if (snackButton) {
        // Verwijder eventuele dubbele listeners door te klonen of direct te binden
        snackButton.replaceWith(snackButton.cloneNode(true));
        const newSnackButton = document.getElementById('start-snack-timer');
        
        newSnackButton.addEventListener('click', () => {
            startSnackTimer(appData);
        });
    }

    // Event listener voor stappen loggen
    const vitalityForm = document.getElementById('vitality-form');
    if (vitalityForm) {
        vitalityForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const stepsInput = document.getElementById('steps-input');
            const steps = stepsInput ? parseInt(stepsInput.value) : NaN;

            if (!isNaN(steps)) {
                if (!appData.vitality) appData.vitality = { steps: 0, snackWaitCount: 0 };
                
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
        stepsElement.textContent = appData.vitality?.steps || 0;
    }

    const snackCountElement = document.getElementById('snack-wait-count');
    if (snackCountElement) {
        snackCountElement.textContent = appData.vitality?.snackWaitCount || 0;
    }
}

// Wachtkamer timer logica (15 minuten = 900 seconden)
function startSnackTimer(appData) {
    if (snackTimerRunning) return;
    snackTimerRunning = true;

    const timerDisplay = document.getElementById('snack-timer-display');
    const snackButton = document.getElementById('start-snack-timer');
    if (snackButton) snackButton.disabled = true;

    let timeLeft = 15 * 60; // 15 minuten in seconden (pas aan naar wens, bijv. 10 voor een test)

    updateTimerDisplay(timerDisplay, timeLeft);

    timerInterval = setInterval(() => {
        timeLeft--;
        updateTimerDisplay(timerDisplay, timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            snackTimerRunning = false;
            
            if (!appData.vitality) appData.vitality = { steps: 0, snackWaitCount: 0 };
            appData.vitality.snackWaitCount = (appData.vitality.snackWaitCount || 0) + 1;
            saveAppData(appData);
            renderVitalityStats(appData);

            if (timerDisplay) {
                timerDisplay.textContent = "✨ Wachttijd voltooid! Voel je de trek nog steeds?";
            }
            if (snackButton) snackButton.disabled = false;
        }
    }, 1000);
}

function updateTimerDisplay(element, seconds) {
    if (!element) return;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    element.textContent = `Wachtkamer actief: ${mins}:${secs < 10 ? '0' : ''}${secs} rest`;
}
