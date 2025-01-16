const express = require('express');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const port = 3010;
const wss = new WebSocket.Server({ port: 3002 });

app.use(cors());
app.use(express.json());

console.log('HTTP server running on http://localhost:3010');
console.log('WebSocket server running on ws://localhost:3002');


let clients = new Map();

wss.on('connection', (ws) => {
  let userId = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'register' && data.userId) {
        userId = data.userId;
        clients.set(userId, ws);
        console.log(`User ${userId} terhubung`);
      }


      console.log(data)

      if(data.type == 'send'){
        const targetId = data.target
        const msg = data.message
        const client = clients.get(targetId)

        client.send(JSON.stringify({ type: 'receive', message: msg }));

        console.log(`Send message to ${targetId}`)
      }

    } catch (err) {
      console.error('Invalid message format', err);
    }
  });

  ws.on('close', () => {
    if (userId && clients.get(userId) === ws) {
      clients.delete(userId);
      console.log(`User ${userId} terputus`);
    }
  });
});

// Endpoint POST untuk trigger notifikasi
app.post('/trigger', (req, res) => {
  const { userId, message } = req.body;
  const client = clients.get(userId);

  if (client && client.readyState === WebSocket.OPEN) {
    setTimeout(() => {
      client.send(JSON.stringify({ type: 'notification', message: `Notifikasi untuk ${userId}: ${message}` }));
      console.log(`Notifikasi dikirim ke user ${userId}`);
    }, 5000);

    res.status(200).json({ status: `Notifikasi akan dikirim ke user ${userId} dalam 5 detik` });
  } else {
    res.status(404).json({ status: `User ${userId} tidak terhubung` });
  }
});

app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
});