const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startServer: (port) => ipcRenderer.invoke('start-server', port),
  connectToServer: (ip, port) => ipcRenderer.invoke('connect-to-server', { ip, port }),
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  onMessageReceived: (callback) => ipcRenderer.on('message-received', (event, message) => callback(message)),
  onConnectionStatus: (callback) => ipcRenderer.on('connection-status', (event, status) => callback(status))
});