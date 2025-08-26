const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  loadTodos: (type) => ipcRenderer.invoke('load-todos', type),
  saveTodos: (todos, type) => ipcRenderer.invoke('save-todos', todos, type),
  toggleAutostart: (enable) => ipcRenderer.invoke('toggle-autostart', enable),
  getAutostartStatus: () => ipcRenderer.invoke('get-autostart-status'),
  clearDailyTodos: () => ipcRenderer.invoke('clear-daily-todos'),
  updateDailyCompletion: (todoId, completed) => ipcRenderer.invoke('update-daily-completion', todoId, completed),
  exportData: () => ipcRenderer.invoke('export-data'),
  importData: () => ipcRenderer.invoke('import-data'),
  createBackup: () => ipcRenderer.invoke('create-backup')
});