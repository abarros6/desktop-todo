const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const AutoLaunch = require('auto-launch');

const todosFile = path.join(os.homedir(), '.desktop-todos.json');
const dailyTodosFile = path.join(os.homedir(), '.desktop-daily-todos.json');

let mainWindow;

const autoLauncher = new AutoLaunch({
  name: 'Desktop Todo',
  path: process.execPath,
});

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 420,
    height: 650,
    minWidth: 380,
    minHeight: 500,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    resizable: true,
    minimizable: true,
    maximizable: true,
    vibrancy: 'under-window',
    transparent: false,
    frame: true,
    show: false
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

ipcMain.handle('load-todos', (event, type = 'regular') => {
  try {
    const file = type === 'daily' ? dailyTodosFile : todosFile;
    if (fs.existsSync(file)) {
      const data = fs.readFileSync(file, 'utf8');
      const parsed = JSON.parse(data);
      return type === 'daily' ? (parsed.todos || []) : parsed;
    }
    return [];
  } catch (error) {
    console.error('Error loading todos:', error);
    return [];
  }
});

ipcMain.handle('save-todos', (event, todos, type = 'regular') => {
  try {
    const file = type === 'daily' ? dailyTodosFile : todosFile;
    const data = type === 'daily' ? {
      todos,
      lastClear: new Date().toDateString()
    } : todos;
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving todos:', error);
    return false;
  }
});

ipcMain.handle('toggle-autostart', async (event, enable) => {
  try {
    if (enable) {
      await autoLauncher.enable();
    } else {
      await autoLauncher.disable();
    }
    return true;
  } catch (error) {
    console.error('Error toggling autostart:', error);
    return false;
  }
});

ipcMain.handle('get-autostart-status', async () => {
  try {
    return await autoLauncher.isEnabled();
  } catch (error) {
    console.error('Error checking autostart status:', error);
    return false;
  }
});

function calculateStreak(completionHistory, todoId) {
  if (!completionHistory || !completionHistory[todoId]) return 0;
  
  const history = completionHistory[todoId];
  const today = new Date();
  let streak = 0;
  let currentDate = new Date(today);
  
  // Check backwards from today
  while (true) {
    const dateStr = currentDate.toDateString();
    if (history[dateStr]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

function updateCompletionHistory(completionHistory, todoId, completed, date = new Date().toDateString()) {
  if (!completionHistory) completionHistory = {};
  if (!completionHistory[todoId]) completionHistory[todoId] = {};
  
  if (completed) {
    completionHistory[todoId][date] = true;
  } else {
    delete completionHistory[todoId][date];
  }
  
  return completionHistory;
}

ipcMain.handle('clear-daily-todos', () => {
  try {
    const today = new Date().toDateString();
    if (fs.existsSync(dailyTodosFile)) {
      const data = JSON.parse(fs.readFileSync(dailyTodosFile, 'utf8'));
      const lastClear = data.lastClear;
      
      if (lastClear !== today) {
        // Preserve completion history and template todos
        const templateTodos = (data.todos || []).map(todo => ({
          ...todo,
          completed: false,
          completedToday: false,
          streak: calculateStreak(data.completionHistory, todo.templateId || todo.id)
        }));
        
        const newData = {
          todos: templateTodos,
          lastClear: today,
          completionHistory: data.completionHistory || {}
        };
        
        fs.writeFileSync(dailyTodosFile, JSON.stringify(newData, null, 2));
        return { cleared: true, todos: templateTodos, completionHistory: data.completionHistory || {} };
      }
      
      // Same day, return existing
      const todos = (data.todos || []).map(todo => ({
        ...todo,
        streak: calculateStreak(data.completionHistory, todo.templateId || todo.id)
      }));
      
      return { cleared: false, todos, completionHistory: data.completionHistory || {} };
    }
    
    // New file
    const newData = {
      todos: [],
      lastClear: today,
      completionHistory: {}
    };
    
    fs.writeFileSync(dailyTodosFile, JSON.stringify(newData, null, 2));
    return { cleared: true, todos: [], completionHistory: {} };
  } catch (error) {
    console.error('Error clearing daily todos:', error);
    return { cleared: false, todos: [], completionHistory: {} };
  }
});

ipcMain.handle('update-daily-completion', (event, todoId, completed) => {
  try {
    if (!fs.existsSync(dailyTodosFile)) return false;
    
    const data = JSON.parse(fs.readFileSync(dailyTodosFile, 'utf8'));
    const today = new Date().toDateString();
    
    // Update completion history
    data.completionHistory = updateCompletionHistory(
      data.completionHistory, 
      todoId, 
      completed, 
      today
    );
    
    // Update the todo in the current list
    if (data.todos) {
      const todoIndex = data.todos.findIndex(t => (t.templateId || t.id) === todoId);
      if (todoIndex !== -1) {
        data.todos[todoIndex].completed = completed;
        data.todos[todoIndex].completedToday = completed;
        data.todos[todoIndex].streak = calculateStreak(data.completionHistory, todoId);
      }
    }
    
    fs.writeFileSync(dailyTodosFile, JSON.stringify(data, null, 2));
    return { success: true, streak: calculateStreak(data.completionHistory, todoId) };
  } catch (error) {
    console.error('Error updating daily completion:', error);
    return { success: false, streak: 0 };
  }
});

// Backup and Export functionality
ipcMain.handle('export-data', async () => {
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export Todo Data',
      defaultPath: `desktop-todo-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    
    if (result.canceled) return { success: false, canceled: true };
    
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      regularTodos: [],
      dailyTodos: {},
      completionHistory: {}
    };
    
    // Export regular todos
    if (fs.existsSync(todosFile)) {
      exportData.regularTodos = JSON.parse(fs.readFileSync(todosFile, 'utf8'));
    }
    
    // Export daily todos and history
    if (fs.existsSync(dailyTodosFile)) {
      const dailyData = JSON.parse(fs.readFileSync(dailyTodosFile, 'utf8'));
      exportData.dailyTodos = dailyData.todos || [];
      exportData.completionHistory = dailyData.completionHistory || {};
    }
    
    fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2));
    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('Error exporting data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('import-data', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import Todo Data',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });
    
    if (result.canceled) return { success: false, canceled: true };
    
    const importData = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf8'));
    
    // Validate import data structure
    if (!importData.version || !importData.exportDate) {
      return { success: false, error: 'Invalid backup file format' };
    }
    
    // Create backup of current data before importing
    const backupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      regularTodos: [],
      dailyTodos: {},
      completionHistory: {}
    };
    
    if (fs.existsSync(todosFile)) {
      backupData.regularTodos = JSON.parse(fs.readFileSync(todosFile, 'utf8'));
    }
    if (fs.existsSync(dailyTodosFile)) {
      const dailyData = JSON.parse(fs.readFileSync(dailyTodosFile, 'utf8'));
      backupData.dailyTodos = dailyData.todos || [];
      backupData.completionHistory = dailyData.completionHistory || {};
    }
    
    const backupPath = path.join(os.homedir(), `.desktop-todo-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    // Import regular todos
    if (importData.regularTodos) {
      fs.writeFileSync(todosFile, JSON.stringify(importData.regularTodos, null, 2));
    }
    
    // Import daily todos and history
    if (importData.dailyTodos || importData.completionHistory) {
      const dailyData = {
        todos: importData.dailyTodos || [],
        lastClear: new Date().toDateString(),
        completionHistory: importData.completionHistory || {}
      };
      fs.writeFileSync(dailyTodosFile, JSON.stringify(dailyData, null, 2));
    }
    
    return { success: true, backupPath };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-backup', () => {
  try {
    const backupData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      regularTodos: [],
      dailyTodos: {},
      completionHistory: {}
    };
    
    if (fs.existsSync(todosFile)) {
      backupData.regularTodos = JSON.parse(fs.readFileSync(todosFile, 'utf8'));
    }
    if (fs.existsSync(dailyTodosFile)) {
      const dailyData = JSON.parse(fs.readFileSync(dailyTodosFile, 'utf8'));
      backupData.dailyTodos = dailyData.todos || [];
      backupData.completionHistory = dailyData.completionHistory || {};
    }
    
    const backupPath = path.join(os.homedir(), `.desktop-todo-backup-${Date.now()}.json`);
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    
    return { success: true, backupPath };
  } catch (error) {
    console.error('Error creating backup:', error);
    return { success: false, error: error.message };
  }
});