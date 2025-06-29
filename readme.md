LAN Chat Application
🚀 A peer-to-peer chat app built with Electron.js that works over local Wi-Fi networks without requiring a central server.

✨ Features
✅ Direct WebSocket connection - No backend server required
✅ Simple IP-based connection - Connect via local IP address

📦 Installation
1. Prerequisites
Node.js (v16+)

npm / Yarn

2. Clone & Install
git clone https://github.com/Vishal-py-js/LAN-chat.git

cd LAN-chat

npm install

4. Run in Development
npm start

6. Build for Production
npm run dist

built exe file location: dist/some .exe file

🚀 How It Works
Start a Server

On PC 1, click "Start Server" (default port: 8080).

Note the displayed IP address (e.g., 192.168.1.100).

Connect from Another PC

On PC 2, enter the server's IP and port (default: 8080).

Click "Connect".

Messages are sent directly between devices via WebSockets.
