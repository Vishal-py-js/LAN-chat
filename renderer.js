const { ipcRenderer } = require('electron');
const { v4: uuidv4 } = require('uuid');

// Get DOM elements for UI interaction
const peersEl = document.getElementById('peers');
const chatEl = document.getElementById('chat');
const messageEl = document.getElementById('message');
const sendBtn = document.getElementById('send');
const statusEl = document.getElementById('status');
const peerIdEl = document.getElementById('peerId');
const remotePeerIdEl = document.getElementById('remotePeerId');
const connectBtn = document.getElementById('connect');

// Variables to manage PeerJS and connections
let peer;
let connections = {};
let selectedPeer = null;

// Initialize PeerJS and set up event listeners
function setupPeer() {
  // Generate a unique Peer ID using uuid
  const peerId = uuidv4();
  // Create a new PeerJS instance, connecting to the public signaling server
  peer = new Peer(peerId, {
    host: '0.peerjs.com',
    port: 443,
    path: '/',
    secure: true,
  });

  // When PeerJS connection is established
  peer.on('open', () => {
    peerIdEl.value = peerId;
    statusEl.textContent = 'Connected to PeerJS server. Share your Peer ID.';
  });

  // Handle incoming connections from other peers
  peer.on('connection', (conn) => {
    const peerId = conn.peer;
    connections[peerId] = conn;
    addPeerToUI(peerId);

    conn.on('data', (data) => {
      const { message, timestamp } = JSON.parse(data);
      displayMessage(peerId, message, timestamp);
    });

    conn.on('close', () => {
      removePeerFromUI(peerId); // Remove peer from UI and connections
    });

    conn.on('error', (err) => {
      statusEl.textContent = `Error with peer ${peerId}: ${err.message}`;
    });
  });

  peer.on('error', (err) => {
    statusEl.textContent = `PeerJS error: ${err.message}`;
  });
}

// Add a peer to the sidebar UI
function addPeerToUI(peerId) {
  const button = document.createElement('button');
  button.className = 'w-full text-left p-2 rounded-lg hover:bg-gray-200';
  button.textContent = peerId;
  button.onclick = () => {
    selectedPeer = peerId;
    document.querySelectorAll('#peers button').forEach(btn => btn.className = 'w-full text-left p-2 rounded-lg hover:bg-gray-200');
    button.className = 'w-full text-left p-2 bg-gray-300 rounded-lg';
    statusEl.textContent = `Chatting with ${peerId}`;
    messageEl.disabled = false;
    sendBtn.disabled = false;
  };
  peersEl.appendChild(button);
}

// Remove a peer from the sidebar UI
function removePeerFromUI(peerId) {
  const buttons = peersEl.querySelectorAll('button');
  buttons.forEach(btn => {
    if (btn.textContent === peerId) btn.remove();
  });
  if (selectedPeer === peerId) {
    selectedPeer = null;
    statusEl.textContent = 'Peer disconnected. Select or connect to another peer.';
    messageEl.disabled = true;
    sendBtn.disabled = true;
  }
  delete connections[peerId];
}

// Display a message in the chat area
function displayMessage(from, message, timestamp) {
  const div = document.createElement('div');
  div.className = `p-2 my-1 rounded-lg max-w-[80%] ${from === selectedPeer ? 'bg-blue-100' : 'bg-green-100 ml-auto'}`;
  div.innerHTML = `<span class="text-xs text-gray-500">${timestamp} (${from.slice(0, 8)}...)</span><br>${message}`;
  chatEl.appendChild(div);
  chatEl.scrollTop = chatEl.scrollHeight; // Auto-scroll to latest message
}

// Handle connect button click to initiate connection to a remote peer
connectBtn.onclick = () => {
  const remotePeerId = remotePeerIdEl.value.trim();
  if (remotePeerId) {
    const conn = peer.connect(remotePeerId);
    connections[remotePeerId] = conn;
    //When connection is established
    conn.on('open', () => {
      addPeerToUI(remotePeerId);
      statusEl.textContent = `Connected to ${remotePeerId}`;
    });

    conn.on('data', (data) => {
      const { message, timestamp } = JSON.parse(data);
      displayMessage(remotePeerId, message, timestamp);
    });

    conn.on('close', () => {
      removePeerFromUI(remotePeerId);
    });

    conn.on('error', (err) => {
      statusEl.textContent = `Error connecting to ${remotePeerId}: ${err.message}`;
    });

    remotePeerIdEl.value = '';
  }
};

//Handle send button click to send a message
sendBtn.onclick = () => {
  if (selectedPeer && messageEl.value) {
    const message = messageEl.value;
    const timestamp = new Date().toLocaleTimeString();
    const conn = connections[selectedPeer];
    if (conn && conn.open) {
      // Send message with timestamp
      conn.send(JSON.stringify({ message, timestamp }));
      displayMessage(selectedPeer, message, timestamp);
    }
    messageEl.value = '';
  }
};

//Allow sending messages with Enter key
messageEl.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !sendBtn.disabled) {
    sendBtn.click();
  }
});

setupPeer();