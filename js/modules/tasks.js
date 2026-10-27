// js/modules/tasks.js
import { saveAppData } from './storage.js';

export function initTasksModule(appData) {
    renderTasks(appData);
    renderEveningPact(appData);

    // Event listener voor het toevoegen van een taak / actie
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const taskInput = document.getElementById('task-input');
            const taskText = taskInput ? taskInput.value.trim() : '';

            if (taskText) {
                // Zorg dat appData.tasks een array is
                if (!appData.tasks) appData.tasks = [];

                appData.tasks.push({
                    id: Date.now(),
                    text: taskText,
                    completed: false,
                    date: new Date().toISOString()
                });

                saveAppData(appData);
                renderTasks(appData);
                taskForm.reset();
            }
        });
    }

    // Event listener voor het Avond-pact
    const pactForm = document.getElementById('evening-pact-form');
    if (pactForm) {
        pactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const pactInput = document.getElementById('evening-pact-input');
            const pactText = pactInput ? pactInput.value.trim() : '';

            if (pactText) {
                if (!appData.eveningPact) appData.eveningPact = [];

                appData.eveningPact.push({
                    id: Date.now(),
                    text: pactText,
                    achieved: false,
                    date: new Date().toISOString()
                });

                saveAppData(appData);
                renderEveningPact(appData);
                pactForm.reset();
            }
        });
    }
}

// Render de takenlijst / actie-hub met Tailwind styling
function renderTasks(appData) {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    taskList.innerHTML = '';
    const tasks = appData.tasks || [];

    if (tasks.length === 0) {
        taskList.innerHTML = `<p class="text-xs text-gray-400 italic">Nog geen taken toegevoegd voor vandaag.</p>`;
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `flex items-center justify-between p-3 rounded-xl border transition ${
            task.completed ? 'bg-gray-50 line-through text-gray-400 border-gray-100' : 'bg-white text-gray-700 border-gray-200 shadow-sm'
        }`;
        
        li.innerHTML = `
            <span class="text-sm">${task.text}</span>
            <button data-id="${task.id}" class="toggle-task text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                task.completed ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            }">
                ${task.completed ? 'Herstel' : 'Klaar ✨'}
            </button>
        `;

        // Klik-actie om taak af te vinken
        li.querySelector('.toggle-task').addEventListener('click', () => {
            task.completed = !task.completed;
            saveAppData(appData);
            renderTasks(appData);
        });

        taskList.appendChild(li);
    });
}

// Render het Avond-pact
function renderEveningPact(appData) {
    const pactList = document.getElementById('evening-pact-list');
    if (!pactList) return;

    pactList.innerHTML = '';
    const eveningPacts = appData.eveningPact || [];

    if (eveningPacts.length === 0) {
        pactList.innerHTML = `<p class="text-xs text-gray-400 italic">Geen avond-pact vastgelegd voor vandaag.</p>`;
        return;
    }

    eveningPacts.forEach(pact => {
        const li = document.createElement('li');
        li.className = `p-3 rounded-xl border bg-indigo-50/50 border-indigo-100 text-indigo-900 text-sm flex justify-between items-center`;
        li.innerHTML = `
            <span>🌙 ${pact.text}</span>
            <button data-id="${pact.id}" class="delete-pact text-xs text-gray-400 hover:text-red-500">✕</button>
        `;

        li.querySelector('.delete-pact').addEventListener('click', () => {
            appData.eveningPact = appData.eveningPact.filter(p => p.id !== pact.id);
            saveAppData(appData);
            renderEveningPact(appData);
        });

        pactList.appendChild(li);
    });
}
