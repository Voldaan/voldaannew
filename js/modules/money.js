// js/modules/money.js
import { saveAppData } from './storage.js';

// Functie om de geld-sectie te renderen en up-to-date te houden
export function initMoneyModule(appData) {
    renderBalance(appData);
    renderTransactions(appData);
    renderExpenses(appData);

    // Event listener voor het toevoegen van een transactie (indien formulier aanwezig is)
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const description = document.getElementById('transaction-desc').value;
            const amount = parseFloat(document.getElementById('transaction-amount').value);

            if (description && !isNaN(amount)) {
                // Voeg toe aan transacties
                appData.transactions.push({
                    id: Date.now(),
                    description,
                    amount,
                    date: new Date().toISOString()
                });

                // Pas het totale saldo aan
                appData.balance += amount;

                // Sla op in localStorage
                saveAppData(appData);

                // Ververs de weergave
                renderBalance(appData);
                renderTransactions(appData);

                // Reset formulier
                transactionForm.reset();
            }
        });
    }
}

// Toon het actuele banksaldo
function renderBalance(appData) {
    const balanceElement = document.getElementById('current-balance');
    if (balanceElement) {
        balanceElement.textContent = `€ ${appData.balance.toFixed(2)}`;
    }
}

// Toon de lijst met transacties
function renderTransactions(appData) {
    const listElement = document.getElementById('transaction-list');
    if (!listElement) return;

    listElement.innerHTML = '';
    appData.transactions.slice(-10).reverse().forEach(tx => {
        const li = document.createElement('li');
        li.className = tx.amount >= 0 ? 'text-green-600' : 'text-red-600';
        li.textContent = `${tx.description}: € ${tx.amount.toFixed(2)}`;
        listElement.appendChild(li);
    });
}

// Toon verwachte uitgaven
function renderExpenses(appData) {
    const expenseList = document.getElementById('expense-list');
    if (!expenseList) return;

    expenseList.innerHTML = '';
    appData.expenses.forEach(exp => {
        const li = document.createElement('li');
        li.textContent = `${exp.title} - € ${exp.amount.toFixed(2)}`;
        expenseList.appendChild(li);
    });
}
