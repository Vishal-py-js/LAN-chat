const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  startServer: (port) => ipcRenderer.invoke('start-server', port),
  connectToServer: (ip, port) => ipcRenderer.invoke('connect-to-server', { ip, port }),
  sendMessage: (message) => ipcRenderer.invoke('send-message', message),
  onMessageReceived: (callback) => ipcRenderer.on('message-received', (event, message) => callback(message)),
  onConnectionStatus: (callback) => ipcRenderer.on('connection-status', (event, status) => callback(status))
});


// const { contextBridge, ipcRenderer } = require('electron');

// contextBridge.exposeInMainWorld('electronAPI', {
//   startServer: () => ipcRenderer.invoke('start-server'),
//   connectToServer: (ip) => ipcRenderer.invoke('connect-to-server', ip),
//   sendMessage: (message) => ipcRenderer.invoke('send-message', message),
//   findServers: () => ipcRenderer.invoke('find-servers'),
//   onMessageReceived: (callback) => ipcRenderer.on('message-received', (_, msg) => callback(msg)),
//   onConnectionStatus: (callback) => ipcRenderer.on('connection-status', (_, status) => callback(status)),
// });