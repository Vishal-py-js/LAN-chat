LAN Chat Application
🚀 A peer-to-peer chat app built with Electron.js that works over local Wi-Fi networks without requiring a central server.

✨ Features
✅ Direct WebSocket connection - No backend server required
✅ Simple IP-based connection - Connect via local IP address
✅ Modern UI - Built with Tailwind CSS
✅ Cross-platform - Works on Windows, macOS, and Linux
✅ Lightweight & Fast - Minimal dependencies

📦 Installation
1. Prerequisites
Node.js (v16+)

npm / Yarn

2. Clone & Install
bash
git clone https://github.com/your-repo/electron-lan-chat.git
cd electron-lan-chat
npm install
3. Run in Development
bash
npm start
4. Build for Production
bash
npm run dist
Windows: dist/LANChatSetup.exe

macOS: dist/LANChat.dmg

Linux: dist/LANChat.AppImage

🚀 How It Works
Start a Server

On PC 1, click "Start Server" (default port: 8080).

Note the displayed IP address (e.g., 192.168.1.100).

Connect from Another PC

On PC 2, enter the server's IP and port (default: 8080).

Click "Connect".

Messages are sent directly between devices via WebSockets.