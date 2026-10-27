// js/modules/tasks.js
import { saveAppData } from './storage.js';

// Functie om de taken- en avond-pact module te initialiseren
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
                appData.eveningPact.push({
                    id: Date.now(),
                    text: pactText,
                    achieved: false
                });

                saveAppData(appData);
                renderEveningPact(appData);
                pactForm.reset();
            }
        });
    }
}

// Render de takenlijst / actie-hub
function renderTasks(appData) {
    const taskList = document.getElementById('task-list');
    if (!taskList) return;

    taskList.innerHTML = '';
    appData.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `flex items-center justify-between p-2 my-1 rounded border ${task.completed ? 'bg-gray-100 line-through text-gray-500' : 'bg-white'}`;
        
        li.innerHTML = `
            <span>${task.text}</span>
            <button data-id="${task.id}" class="toggle-task text-xs px-2 py-1 bg-blue-500 text-white rounded">
                ${task.completed ? 'Herstel' : 'Klaar'}
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
    appData.eveningPact.forEach(pact => {
        const li = document.createElement('li');
        li.className = `p-2 my-1 rounded border ${pact.achieved ? 'bg-green-50 text-green-800' : 'bg-white'}`;
        li.textContent = pact.text;
        pactList.appendChild(li);
    });
}
