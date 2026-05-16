// server/server.js
// ─────────────────────────────────────────────────────────────
// REMPLACE ton server.js existant par celui-ci.
// Seul ajout : on crée un httpServer et on initialise socket.js
// ─────────────────────────────────────────────────────────────

const express    = require("express");
const http       = require("http");          // ← NOUVEAU
const mongoose   = require("mongoose");
const cors       = require("cors");
const dotenv     = require("dotenv");
const socketManager = require("./socket"); // ← NOUVEAU

dotenv.config();

const app    = express();
const server = http.createServer(app);      // ← NOUVEAU (wraps express)

// ── Middleware ───────────────────────────────────────────────
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json({ limit: "10mb" }));

// ── Socket.IO ────────────────────────────────────────────────
socketManager.init(server);                 // ← NOUVEAU

// ── Routes ───────────────────────────────────────────────────
// Adapte les chemins à ton projet
app.use("/api/auth",      require("./routes/authRoutes"));
app.use("/api/annonces",  require("./routes/annonceRoutes"));
app.use("/api/messages",  require("./routes/messageRoutes"));
app.use("/api/favoris",   require("./routes/favorisRoutes"));
app.use("/api/profile",   require("./routes/profileRoutes"));

// ── MongoDB ──────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connecté");
    // ── On écoute sur server (pas app) ──────────────────────
    server.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Serveur démarré sur le port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => console.error("❌ Erreur MongoDB :", err));