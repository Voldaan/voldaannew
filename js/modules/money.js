// js/modules/money.js
import { saveAppData } from './storage.js';

// Functie om de geld-sectie te initialiseren en up-to-date te houden
export function initMoneyModule(appData) {
    renderBalance(appData);
    renderTransactions(appData);

    // Event listener voor het toevoegen van een transactie
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const descInput = document.getElementById('transaction-desc');
            const amountInput = document.getElementById('transaction-amount');

            const description = descInput ? descInput.value.trim() : '';
            const amount = amountInput ? parseFloat(amountInput.value) : NaN;

            if (description && !isNaN(amount)) {
                // Zorg dat appData.transactions een array is
                if (!appData.transactions) appData.transactions = [];

                // Voeg toe aan transacties
                appData.transactions.push({
                    id: Date.now(),
                    description,
                    amount,
                    date: new Date().toISOString()
                });

                // Pas het totale saldo aan
                appData.balance = (appData.balance || 0) + amount;

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
        const balance = appData.balance || 0;
        balanceElement.textContent = `€ ${balance.toFixed(2)}`;
        
        // Kleine visuele kleuraanpassing op basis van saldo
        if (balance < 0) {
            balanceElement.className = "text-3xl font-bold text-red-600";
        } else {
            balanceElement.className = "text-3xl font-bold text-indigo-900";
        }
    }
}

// Toon de lijst met transacties
function renderTransactions(appData) {
    const listElement = document.getElementById('transaction-list');
    if (!listElement) return;

    listElement.innerHTML = '';
    const transactions = appData.transactions || [];

    if (transactions.length === 0) {
        listElement.innerHTML = `<p class="text-xs text-gray-400 italic">Nog geen transacties geregistreerd.</p>`;
        return;
    }

    // Toon de laatste 10 transacties (nieuwste bovenaan)
    transactions.slice(-10).reverse().forEach(tx => {
        const li = document.createElement('li');
        const isPositive = tx.amount >= 0;
        
        li.className = `flex justify-between items-center p-2.5 my-1 rounded-xl border ${
            isPositive ? 'bg-green-50/50 border-green-100 text-green-900' : 'bg-red-50/50 border-red-100 text-red-900'
        }`;
        
        li.innerHTML = `
            <span class="text-sm font-medium">${tx.description}</span>
            <span class="text-sm font-bold">${isPositive ? '+' : ''} € ${tx.amount.toFixed(2)}</span>
        `;
        
        listElement.appendChild(li);
    });
}
