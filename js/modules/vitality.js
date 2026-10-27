// Zet deze variabele BOVEN de functie:
let snackTimerRunning = false;

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
