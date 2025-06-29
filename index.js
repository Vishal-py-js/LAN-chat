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



// const { app, BrowserWindow, ipcMain } = require('electron');
// const path = require('path');
// const WebSocket = require('ws');
// const dgram = require('dgram');

// // Constants
// const DISCOVERY_PORT = 41234;
// const DISCOVERY_MSG = 'LAN_CHAT_DISCOVERY';
// const BROADCAST_INTERVAL = 5000;

// let mainWindow;
// let wsServer = null;
// let wsClient = null;
// let isServer = false;
// let discoverySocket = null;
// let broadcastInterval = null;

// // Create Electron window
// function createWindow() {
//   mainWindow = new BrowserWindow({
//     width: 1000,
//     height: 700,
//     webPreferences: {
//       nodeIntegration: false,
//       contextIsolation: true,
//       preload: path.join(__dirname, 'preload.js')
//     }
//   });

//   mainWindow.loadFile('index.html');
// }

// // Start WebSocket server
// function startWebSocketServer(port) {
//   if (wsServer) wsServer.close();
  
//   wsServer = new WebSocket.Server({ port });
  
//   wsServer.on('connection', (socket) => {
//     mainWindow.webContents.send('connection-status', 'connected');
    
//     socket.on('message', (message) => {
//       mainWindow.webContents.send('message-received', message.toString());
//     });
    
//     socket.on('close', () => {
//       mainWindow.webContents.send('connection-status', 'disconnected');
//     });
//   });
// }

// // Connect to a WebSocket server
// function connectToServer(ip, port) {
//   if (wsClient) wsClient.close();
  
//   wsClient = new WebSocket(`ws://${ip}:${port}`);
  
//   wsClient.on('open', () => {
//     mainWindow.webContents.send('connection-status', 'connected');
//   });
  
//   wsClient.on('message', (message) => {
//     mainWindow.webContents.send('message-received', message.toString());
//   });
  
//   wsClient.on('close', () => {
//     mainWindow.webContents.send('connection-status', 'disconnected');
//   });
  
//   wsClient.on('error', () => {
//     mainWindow.webContents.send('connection-status', 'error');
//   });
// }

// // Broadcast server presence (UDP)
// function startDiscovery() {
//   discoverySocket = dgram.createSocket('udp4');
  
//   discoverySocket.on('listening', () => {
//     discoverySocket.setBroadcast(true);
    
//     // Broadcast every 5 seconds
//     broadcastInterval = setInterval(() => {
//       const msg = Buffer.from(DISCOVERY_MSG);
//       discoverySocket.send(msg, 0, msg.length, DISCOVERY_PORT, '255.255.255.255');
//     }, BROADCAST_INTERVAL);
//   });
  
//   discoverySocket.bind(DISCOVERY_PORT);
// }

// // Scan for available servers
// function findServers() {
//   return new Promise((resolve) => {
//     const socket = dgram.createSocket('udp4');
//     const servers = [];
//     const timeout = 3000; // Wait 3 seconds for responses

//     socket.on('message', (msg, rinfo) => {
//       if (msg.toString() === DISCOVERY_MSG) {
//         servers.push(rinfo.address);
//       }
//     });

//     socket.bind(() => {
//       socket.setBroadcast(true);
//       const request = Buffer.from(DISCOVERY_MSG);
//       socket.send(request, 0, request.length, DISCOVERY_PORT, '255.255.255.255');
      
//       setTimeout(() => {
//         socket.close();
//         resolve(servers);
//       }, timeout);
//     });
//   });
// }

// // Get local IP
// function getLocalIP() {
//   const interfaces = require('os').networkInterfaces();
//   for (const iface of Object.values(interfaces)) {
//     for (const addr of iface) {
//       if (addr.family === 'IPv4' && !addr.internal) {
//         return addr.address;
//       }
//     }
//   }
//   return '127.0.0.1';
// }

// // IPC Communication
// ipcMain.handle('start-server', async () => {
//   isServer = true;
//   startWebSocketServer(8080);
//   startDiscovery();
//   return getLocalIP();
// });

// ipcMain.handle('connect-to-server', (_, ip) => {
//   isServer = false;
//   connectToServer(ip, 8080);
// });

// ipcMain.handle('send-message', (_, message) => {
//   if (isServer && wsServer) {
//     wsServer.clients.forEach(client => {
//       if (client.readyState === WebSocket.OPEN) client.send(message);
//     });
//   } else if (wsClient?.readyState === WebSocket.OPEN) {
//     wsClient.send(message);
//   }
// });

// ipcMain.handle('find-servers', findServers);

// // Start the app
// app.whenReady().then(createWindow);
// app.on('window-all-closed', () => app.quit());

// app.commandLine.appendSwitch('disable-http-cache');
// app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');