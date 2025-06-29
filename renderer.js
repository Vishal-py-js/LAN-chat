document.addEventListener('DOMContentLoaded', () => {
  const startServerBtn = document.getElementById('start-server');
  const connectBtn = document.getElementById('connect-button');
  const sendBtn = document.getElementById('send-button');
  const messageInput = document.getElementById('message-input');
  const messagesDiv = document.getElementById('messages');
  const serverIpInput = document.getElementById('server-ip-input');
  const serverPortInput = document.getElementById('server-port-input');
  const serverIpDisplay = document.getElementById('server-ip');
  const connectionStatus = document.getElementById('connection-status');

  // Handle starting the server
  startServerBtn.addEventListener('click', async () => {
    try {
      const ip = await window.electronAPI.startServer(8080);
      serverIpDisplay.textContent = `Server running at ${ip}:8080`;
      connectionStatus.textContent = 'Waiting for connection...';
      connectionStatus.className = 'status';
    } catch (error) {
      console.error('Failed to start server:', error);
    }
  });

  // Handle connecting to a server
  connectBtn.addEventListener('click', async () => {
    const ip = serverIpInput.value.trim();
    const port = parseInt(serverPortInput.value.trim());
    
    if (!ip || isNaN(port)) {
      alert('Please enter valid IP and port');
      return;
    }
    
    try {
      await window.electronAPI.connectToServer(ip, port);
    } catch (error) {
      console.error('Connection failed:', error);
      alert('Connection failed: ' + error.message);
    }
  });

  // Handle sending messages
  function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
      window.electronAPI.sendMessage(message);
      addMessage('You', message);
      messageInput.value = '';
    }
  }

  sendBtn.addEventListener('click', sendMessage);
  messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });

  // Handle received messages
  window.electronAPI.onMessageReceived((message) => {
    addMessage('Peer', message);
  });

  // Update connection status
  window.electronAPI.onConnectionStatus((status) => {
    connectionStatus.textContent = status === 'connected' ? 'Connected' : 
                                 status === 'disconnected' ? 'Disconnected' : 'Error';
    connectionStatus.className = `status ${status === 'connected' ? 'connected' : 'disconnected'}`;
  });

  // Helper function to add messages to the chat
  function addMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.innerHTML = `<strong>${sender}:</strong> ${text}`;
    messagesDiv.appendChild(messageElement);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
});

// document.addEventListener('DOMContentLoaded', () => {
//   const startServerBtn = document.getElementById('start-server');
//   const discoverBtn = document.getElementById('discover-button');
//   const sendBtn = document.getElementById('send-button');
//   const messageInput = document.getElementById('message-input');
//   const messagesDiv = document.getElementById('messages');
//   const serverIpDisplay = document.getElementById('server-ip');
//   const connectionStatus = document.getElementById('connection-status');
//   const serverList = document.getElementById('server-list');

//   // Start server
//   startServerBtn.addEventListener('click', async () => {
//     const ip = await window.electronAPI.startServer();
//     serverIpDisplay.textContent = `Server running at ${ip}:8080`;
//     updateStatus('waiting');
//   });

//   // Discover servers
//   discoverBtn.addEventListener('click', async () => {
//     serverList.innerHTML = '<p class="text-gray-500">Searching...</p>';
//     const servers = await window.electronAPI.findServers();
    
//     if (servers.length === 0) {
//       serverList.innerHTML = '<p class="text-gray-500">No servers found</p>';
//       return;
//     }
    
//     serverList.innerHTML = '';
//     servers.forEach(ip => {
//       const btn = document.createElement('button');
//       btn.textContent = ip;
//       btn.className = 'w-full text-left px-2 py-1 hover:bg-gray-100 rounded';
//       btn.onclick = () => {
//         updateStatus('connecting');
//         //window.electronAPI.connectToServer(ip);
//         window.electronAPI.connectToServer('127.0.0.1', 8081);
//       };
//       serverList.appendChild(btn);
//     });
//   });

//   // Send message
//   sendBtn.addEventListener('click', () => {
//     const message = messageInput.value.trim();
//     if (message) {
//       window.electronAPI.sendMessage(message);
//       addMessage('You', message);
//       messageInput.value = '';
//     }
//   });

//   // Handle incoming messages
//   window.electronAPI.onMessageReceived((message) => {
//     addMessage('Friend', message);
//   });

//   // Update connection status
//   window.electronAPI.onConnectionStatus((status) => {
//     updateStatus(status);
//   });

//   // Helper: Add message to chat
//   function addMessage(sender, text) {
//     const msgEl = document.createElement('div');
//     msgEl.className = `mb-2 p-2 rounded ${sender === 'You' ? 'bg-blue-100' : 'bg-gray-200'}`;
//     msgEl.textContent = `${sender}: ${text}`;
//     messagesDiv.appendChild(msgEl);
//     messagesDiv.scrollTop = messagesDiv.scrollHeight;
//   }

//   // Helper: Update status
//   function updateStatus(status) {
//     const statusMap = {
//       'connected': { bg: 'bg-green-100', text: 'text-green-800', msg: 'Connected' },
//       'disconnected': { bg: 'bg-red-100', text: 'text-red-800', msg: 'Disconnected' },
//       'waiting': { bg: 'bg-blue-100', text: 'text-blue-800', msg: 'Waiting for connection...' },
//       'connecting': { bg: 'bg-yellow-100', text: 'text-yellow-800', msg: 'Connecting...' }
//     };
    
//     const { bg, text, msg } = statusMap[status] || statusMap.disconnected;
//     connectionStatus.className = `p-2 rounded ${bg} ${text}`;
//     connectionStatus.textContent = msg;
//   }
// });