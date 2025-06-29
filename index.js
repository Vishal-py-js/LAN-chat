const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WebSocket = require('ws');

let mainWindow;
let wsServer = null;
let wsClient = null;
let isServer = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Handle IPC communication
ipcMain.handle('start-server', async (event, port) => {
  isServer = true;
  startWebSocketServer(port);
  return getLocalIP();
});


ipcMain.handle('connect-to-server', async (event, { ip, port }) => {
  isServer = false;
  connectToWebSocketServer(ip, port);
});

ipcMain.handle('send-message', async (event, message) => {
  sendMessage(message);
});

//start a chat server
function startWebSocketServer(port) {
  if (wsServer) wsServer.close();
  
  wsServer = new WebSocket.Server({ port: port });
  
  wsServer.on('connection', (socket) => {
    console.log('Client connected');
    
    socket.on('message', (message) => {
      mainWindow.webContents.send('message-received', message.toString());
    });
    
    socket.on('close', () => {
      console.log('Client disconnected');
    });
  });
  
  console.log(`WebSocket server started on port ${port}`);
}

// connection handler(to connect to the chat server)
function connectToWebSocketServer(ip, port) {
  if (wsClient) wsClient.close();
  
  wsClient = new WebSocket(`ws://${ip}:${port}`);
  
  wsClient.on('open', () => {
    console.log('Connected to server');
    mainWindow.webContents.send('connection-status', 'connected');
  });
  
  wsClient.on('message', (message) => {
    mainWindow.webContents.send('message-received', message.toString());
  });
  
  wsClient.on('close', () => {
    console.log('Disconnected from server');
    mainWindow.webContents.send('connection-status', 'disconnected');
  });
  
  wsClient.on('error', (error) => {
    console.error('WebSocket error:', error);
    mainWindow.webContents.send('connection-status', 'error');
  });
}

function sendMessage(message) {
  if (isServer && wsServer) {
    // Broadcast to all clients if server
    wsServer.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  } else if (!isServer && wsClient && wsClient.readyState === WebSocket.OPEN) {
    // Send to server if client
    wsClient.send(message);
  }
}

function getLocalIP() {
  const interfaces = require('os').networkInterfaces();
  for (const interfaceName in interfaces) {
    const addresses = interfaces[interfaceName];
    for (const address of addresses) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return '127.0.0.1';
}