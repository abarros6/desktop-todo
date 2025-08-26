let todos = [];
let currentType = 'regular';
let saveTimeout = null;
let completionHistory = {};

const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todosList = document.getElementById('todos-list');
const totalCount = document.getElementById('total-count');
const completedCount = document.getElementById('completed-count');
const autostartToggle = document.getElementById('autostart-toggle');
const appTitle = document.getElementById('app-title');
const navTabs = document.querySelectorAll('.nav-tab');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const backupBtn = document.getElementById('backup-btn');

const todoElementsMap = new Map();

function debounce(func, delay) {
    return (...args) => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedSave = debounce(saveTodos, 300);

async function loadTodos(type = currentType) {
    try {
        let loadedTodos = await window.electronAPI.loadTodos(type);
        
        if (type === 'daily') {
            const dailyResult = await window.electronAPI.clearDailyTodos();
            loadedTodos = dailyResult.todos;
            completionHistory = dailyResult.completionHistory || {};
        }
        
        todos = loadedTodos;
        renderTodosOptimized();
        updateStats();
    } catch (error) {
        console.error('Error loading todos:', error);
    }
}

async function saveTodos() {
    try {
        await window.electronAPI.saveTodos(todos, currentType);
    } catch (error) {
        console.error('Error saving todos:', error);
    }
}

async function loadAutostartStatus() {
    try {
        const isEnabled = await window.electronAPI.getAutostartStatus();
        autostartToggle.checked = isEnabled;
    } catch (error) {
        console.error('Error loading autostart status:', error);
    }
}

function createTodoElement(todo, index) {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.expanded ? 'expanded' : ''}`;
    li.dataset.todoId = todo.id;
    
    const mainRow = document.createElement('div');
    mainRow.className = 'todo-main-row';
    
    const checkbox = document.createElement('div');
    checkbox.className = `todo-checkbox ${todo.completed ? 'checked' : ''}`;
    checkbox.innerHTML = todo.completed ? '✓' : '';
    checkbox.addEventListener('click', () => toggleTodo(index));
    
    const textContainer = document.createElement('div');
    textContainer.className = 'todo-text-container';
    
    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;
    text.addEventListener('dblclick', () => startEditing(index));
    
    const textInput = document.createElement('input');
    textInput.className = 'todo-text-input';
    textInput.type = 'text';
    textInput.value = todo.text;
    textInput.style.display = 'none';
    textInput.addEventListener('blur', () => finishEditing(index));
    textInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') finishEditing(index);
        if (e.key === 'Escape') cancelEditing(index);
    });
    
    // Add streak indicator for daily todos
    if (currentType === 'daily' && todo.streak > 0) {
        const streakBadge = document.createElement('span');
        streakBadge.className = 'streak-badge';
        streakBadge.innerHTML = `🔥${todo.streak}`;
        streakBadge.title = `${todo.streak} day streak!`;
        textContainer.appendChild(streakBadge);
    }
    
    textContainer.appendChild(text);
    textContainer.appendChild(textInput);
    
    const controls = document.createElement('div');
    controls.className = 'todo-controls';
    
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn';
    expandBtn.innerHTML = todo.notes && todo.notes.trim() ? '📝' : '📄';
    expandBtn.title = 'Add/view notes';
    expandBtn.addEventListener('click', () => toggleExpanded(index));
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteTodo(index));
    
    controls.appendChild(expandBtn);
    controls.appendChild(deleteBtn);
    
    mainRow.appendChild(checkbox);
    mainRow.appendChild(textContainer);
    mainRow.appendChild(controls);
    
    const notesSection = document.createElement('div');
    notesSection.className = 'todo-notes-section';
    notesSection.style.display = todo.expanded ? 'block' : 'none';
    
    const notesTextarea = document.createElement('textarea');
    notesTextarea.className = 'todo-notes';
    notesTextarea.placeholder = 'Add notes...';
    notesTextarea.value = todo.notes || '';
    notesTextarea.addEventListener('blur', () => updateNotes(index));
    notesTextarea.addEventListener('input', () => {
        expandBtn.innerHTML = notesTextarea.value.trim() ? '📝' : '📄';
    });
    
    notesSection.appendChild(notesTextarea);
    
    li.appendChild(mainRow);
    li.appendChild(notesSection);
    
    return li;
}

function renderTodosOptimized() {
    const existingTodos = new Set();
    const existingElements = todosList.querySelectorAll('.todo-item');
    
    existingElements.forEach(el => {
        const todoId = el.dataset.todoId;
        if (todoId) existingTodos.add(todoId);
    });
    
    const currentTodoIds = new Set(todos.map(todo => todo.id?.toString()));
    
    existingElements.forEach(el => {
        const todoId = el.dataset.todoId;
        if (!currentTodoIds.has(todoId)) {
            el.remove();
            todoElementsMap.delete(todoId);
        }
    });
    
    todos.forEach((todo, index) => {
        const todoId = todo.id?.toString();
        let element = todoElementsMap.get(todoId);
        
        if (!element) {
            element = createTodoElement(todo, index);
            todoElementsMap.set(todoId, element);
            todosList.appendChild(element);
        } else {
            const checkbox = element.querySelector('.todo-checkbox');
            const text = element.querySelector('.todo-text');
            const textInput = element.querySelector('.todo-text-input');
            const expandBtn = element.querySelector('.expand-btn');
            const notesSection = element.querySelector('.todo-notes-section');
            const notesTextarea = element.querySelector('.todo-notes');
            const textContainer = element.querySelector('.todo-text-container');
            
            element.className = `todo-item ${todo.completed ? 'completed' : ''} ${todo.expanded ? 'expanded' : ''}`;
            checkbox.className = `todo-checkbox ${todo.completed ? 'checked' : ''}`;
            checkbox.innerHTML = todo.completed ? '✓' : '';
            text.textContent = todo.text;
            textInput.value = todo.text;
            expandBtn.innerHTML = todo.notes && todo.notes.trim() ? '📝' : '📄';
            notesSection.style.display = todo.expanded ? 'block' : 'none';
            notesTextarea.value = todo.notes || '';
            
            // Update or add streak badge
            let streakBadge = textContainer.querySelector('.streak-badge');
            if (currentType === 'daily' && todo.streak > 0) {
                if (!streakBadge) {
                    streakBadge = document.createElement('span');
                    streakBadge.className = 'streak-badge';
                    textContainer.insertBefore(streakBadge, text);
                }
                streakBadge.innerHTML = `🔥${todo.streak}`;
                streakBadge.title = `${todo.streak} day streak!`;
            } else if (streakBadge) {
                streakBadge.remove();
            }
            
            checkbox.onclick = () => toggleTodo(index);
            text.ondblclick = () => startEditing(index);
            expandBtn.onclick = () => toggleExpanded(index);
            
            const deleteBtn = element.querySelector('.delete-btn');
            deleteBtn.onclick = () => deleteTodo(index);
        }
    });
    
    const elements = Array.from(todosList.children);
    const sortedElements = elements.sort((a, b) => {
        const aIndex = todos.findIndex(todo => todo.id?.toString() === a.dataset.todoId);
        const bIndex = todos.findIndex(todo => todo.id?.toString() === b.dataset.todoId);
        return aIndex - bIndex;
    });
    
    sortedElements.forEach(el => todosList.appendChild(el));
}

function updateStats() {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    
    totalCount.textContent = `${total} todo${total !== 1 ? 's' : ''}`;
    completedCount.textContent = `${completed} completed`;
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    
    const newTodo = {
        text,
        completed: false,
        id: Date.now(),
        createdAt: new Date().toISOString(),
        notes: '',
        expanded: false
    };
    
    if (currentType === 'daily') {
        newTodo.templateId = newTodo.id;
        newTodo.streak = 0;
        newTodo.completedToday = false;
    }
    
    todos.unshift(newTodo);
    todoInput.value = '';
    
    renderTodosOptimized();
    updateStats();
    debouncedSave();
}

function startEditing(index) {
    const todo = todos[index];
    if (!todo) return;
    
    const element = todoElementsMap.get(todo.id.toString());
    if (!element) return;
    
    const textSpan = element.querySelector('.todo-text');
    const textInput = element.querySelector('.todo-text-input');
    
    textSpan.style.display = 'none';
    textInput.style.display = 'block';
    textInput.focus();
    textInput.select();
}

function finishEditing(index) {
    const todo = todos[index];
    if (!todo) return;
    
    const element = todoElementsMap.get(todo.id.toString());
    if (!element) return;
    
    const textSpan = element.querySelector('.todo-text');
    const textInput = element.querySelector('.todo-text-input');
    
    const newText = textInput.value.trim();
    if (newText && newText !== todo.text) {
        todos[index].text = newText;
        textSpan.textContent = newText;
        debouncedSave();
    }
    
    textInput.style.display = 'none';
    textSpan.style.display = 'block';
}

function cancelEditing(index) {
    const todo = todos[index];
    if (!todo) return;
    
    const element = todoElementsMap.get(todo.id.toString());
    if (!element) return;
    
    const textSpan = element.querySelector('.todo-text');
    const textInput = element.querySelector('.todo-text-input');
    
    textInput.value = todo.text;
    textInput.style.display = 'none';
    textSpan.style.display = 'block';
}

function toggleExpanded(index) {
    const todo = todos[index];
    if (!todo) return;
    
    todos[index].expanded = !todo.expanded;
    
    const element = todoElementsMap.get(todo.id.toString());
    if (!element) return;
    
    const notesSection = element.querySelector('.todo-notes-section');
    const notesTextarea = element.querySelector('.todo-notes');
    
    if (todos[index].expanded) {
        element.classList.add('expanded');
        notesSection.style.display = 'block';
        setTimeout(() => notesTextarea.focus(), 100);
    } else {
        element.classList.remove('expanded');
        notesSection.style.display = 'none';
    }
    
    debouncedSave();
}

function updateNotes(index) {
    const todo = todos[index];
    if (!todo) return;
    
    const element = todoElementsMap.get(todo.id.toString());
    if (!element) return;
    
    const notesTextarea = element.querySelector('.todo-notes');
    const expandBtn = element.querySelector('.expand-btn');
    
    todos[index].notes = notesTextarea.value;
    expandBtn.innerHTML = notesTextarea.value.trim() ? '📝' : '📄';
    
    debouncedSave();
}

async function toggleTodo(index) {
    if (!todos[index]) return;
    
    const todo = todos[index];
    const newCompleted = !todo.completed;
    
    if (currentType === 'daily') {
        // Update via backend for streak tracking
        try {
            const result = await window.electronAPI.updateDailyCompletion(
                todo.templateId || todo.id, 
                newCompleted
            );
            
            if (result.success) {
                todos[index].completed = newCompleted;
                todos[index].completedToday = newCompleted;
                todos[index].streak = result.streak;
                
                renderTodosOptimized();
                updateStats();
                return;
            }
        } catch (error) {
            console.error('Error updating daily completion:', error);
        }
    }
    
    // Fallback for regular todos or if daily update fails
    todos[index].completed = newCompleted;
    renderTodosOptimized();
    updateStats();
    debouncedSave();
}

function deleteTodo(index) {
    if (todos[index]) {
        const todoId = todos[index].id?.toString();
        todos.splice(index, 1);
        
        if (todoId) {
            const element = todoElementsMap.get(todoId);
            if (element) {
                element.remove();
                todoElementsMap.delete(todoId);
            }
        }
        
        renderTodosOptimized();
        updateStats();
        debouncedSave();
    }
}

function switchType(type) {
    if (currentType === type) return;
    
    todoElementsMap.clear();
    todosList.innerHTML = '';
    
    currentType = type;
    appTitle.textContent = type === 'daily' ? 'Daily Todos' : 'Todo List';
    todoInput.placeholder = type === 'daily' ? 'Add a daily todo...' : 'Add a new todo...';
    
    navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.type === type);
    });
    
    loadTodos(type);
}

addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

autostartToggle.addEventListener('change', async (e) => {
    try {
        await window.electronAPI.toggleAutostart(e.target.checked);
    } catch (error) {
        console.error('Error toggling autostart:', error);
        e.target.checked = !e.target.checked;
    }
});

navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        switchType(tab.dataset.type);
    });
});

// Backup functionality
exportBtn.addEventListener('click', async () => {
    try {
        exportBtn.disabled = true;
        exportBtn.textContent = '⏳';
        
        const result = await window.electronAPI.exportData();
        
        if (result.canceled) {
            exportBtn.textContent = '💾';
            exportBtn.disabled = false;
            return;
        }
        
        if (result.success) {
            exportBtn.textContent = '✅';
            setTimeout(() => {
                exportBtn.textContent = '💾';
                exportBtn.disabled = false;
            }, 2000);
        } else {
            exportBtn.textContent = '❌';
            console.error('Export failed:', result.error);
            setTimeout(() => {
                exportBtn.textContent = '💾';
                exportBtn.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('Export error:', error);
        exportBtn.textContent = '❌';
        setTimeout(() => {
            exportBtn.textContent = '💾';
            exportBtn.disabled = false;
        }, 2000);
    }
});

importBtn.addEventListener('click', async () => {
    try {
        importBtn.disabled = true;
        importBtn.textContent = '⏳';
        
        const result = await window.electronAPI.importData();
        
        if (result.canceled) {
            importBtn.textContent = '📂';
            importBtn.disabled = false;
            return;
        }
        
        if (result.success) {
            importBtn.textContent = '✅';
            // Reload todos after import
            loadTodos(currentType);
            setTimeout(() => {
                importBtn.textContent = '📂';
                importBtn.disabled = false;
            }, 2000);
        } else {
            importBtn.textContent = '❌';
            console.error('Import failed:', result.error);
            setTimeout(() => {
                importBtn.textContent = '📂';
                importBtn.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('Import error:', error);
        importBtn.textContent = '❌';
        setTimeout(() => {
            importBtn.textContent = '📂';
            importBtn.disabled = false;
        }, 2000);
    }
});

backupBtn.addEventListener('click', async () => {
    try {
        backupBtn.disabled = true;
        backupBtn.textContent = '⏳';
        
        const result = await window.electronAPI.createBackup();
        
        if (result.success) {
            backupBtn.textContent = '✅';
            setTimeout(() => {
                backupBtn.textContent = '🔄';
                backupBtn.disabled = false;
            }, 2000);
        } else {
            backupBtn.textContent = '❌';
            console.error('Backup failed:', result.error);
            setTimeout(() => {
                backupBtn.textContent = '🔄';
                backupBtn.disabled = false;
            }, 2000);
        }
    } catch (error) {
        console.error('Backup error:', error);
        backupBtn.textContent = '❌';
        setTimeout(() => {
            backupBtn.textContent = '🔄';
            backupBtn.disabled = false;
        }, 2000);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    loadAutostartStatus();
});