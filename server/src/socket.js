// server/socket.js
// ─────────────────────────────────────────────────────────────
// Singleton Socket.IO — importé dans server.js ET messageController.js
// ─────────────────────────────────────────────────────────────

let _io = null;

// Map userId (string) → socketId
const onlineUsers = new Map();

const init = (server) => {
  const { Server } = require("socket.io");

  _io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // port Vite — adapte si besoin
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  _io.on("connection", (socket) => {
    console.log(`🔌 Socket connecté : ${socket.id}`);

    // ── L'utilisateur s'identifie dès la connexion ──────────
    socket.on("register", (userId) => {
      if (!userId) return;
      onlineUsers.set(String(userId), socket.id);
      console.log(`👤 User ${userId} enregistré → socket ${socket.id}`);
    });

    // ── Marquer un message comme lu (via socket) ────────────
    socket.on("mark_read", ({ messageId, senderId }) => {
      const senderSocketId = onlineUsers.get(String(senderId));
      if (senderSocketId) {
        _io.to(senderSocketId).emit("message_read", { messageId });
      }
    });

    // ── Déconnexion ─────────────────────────────────────────
    socket.on("disconnect", () => {
      for (const [userId, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          onlineUsers.delete(userId);
          console.log(`❌ User ${userId} déconnecté`);
          break;
        }
      }
    });
  });

  return _io;
};

// Retourne l'instance io (utilisée dans le controller)
const getIO = () => {
  if (!_io) throw new Error("Socket.IO non initialisé — appelez init(server) d'abord");
  return _io;
};

const getSocketId = (userId) => onlineUsers.get(String(userId));

module.exports = { init, getIO, getSocketId };
