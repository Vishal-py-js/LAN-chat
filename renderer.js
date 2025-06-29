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