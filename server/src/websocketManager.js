const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');

const userConnections = new Map();
const HEARTBEAT_INTERVAL = 30000;

function initWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    let userId = null;
    ws.isAlive = true;

    ws.on('pong', () => {
      ws.isAlive = true;
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data);

        if (msg.type === 'auth') {
          const decoded = jwt.verify(msg.token, process.env.JWT_SECRET);
          userId = decoded.id;

          if (!userConnections.has(userId)) {
            userConnections.set(userId, new Set());
          }
          userConnections.get(userId).add(ws);

          ws.send(JSON.stringify({ type: 'auth_ok' }));
        }
      } catch (err) {
        ws.send(JSON.stringify({ type: 'error', message: 'Authentication failed' }));
      }
    });

    ws.on('close', () => {
      if (userId && userConnections.has(userId)) {
        userConnections.get(userId).delete(ws);
        if (userConnections.get(userId).size === 0) {
          userConnections.delete(userId);
        }
      }
    });
  });

  const heartbeatTimer = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) {
        userConnections.forEach((connections, uid) => {
          if (connections.has(ws)) {
            connections.delete(ws);
            if (connections.size === 0) userConnections.delete(uid);
          }
        });
        return ws.terminate();
      }
      ws.isAlive = false;
      ws.ping();
    });
  }, HEARTBEAT_INTERVAL);

  wss.on('close', () => clearInterval(heartbeatTimer));

  return wss;
}

function notifyUser(userId, event, data) {
  if (!userConnections.has(userId)) return;

  const message = JSON.stringify({ type: event, ...data });
  for (const ws of userConnections.get(userId)) {
    if (ws.readyState === 1) {
      ws.send(message);
    }
  }
}

module.exports = { initWebSocket, notifyUser };
