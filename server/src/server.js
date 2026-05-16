const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const http = require("http"); // 👈 Requis pour coupler Express et Socket.io
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const annonceRoutes = require("./routes/annonceRoutes");
const favoriRoutes = require("./routes/favoriRoutes");
const messageRoutes = require('./routes/messageRoutes');

const { init } = require("./socket"); // 👈 Importation de votre configurateur Socket

const app = express();

// 1. Connexion à la base de données
connectDB();

// 2. Middlewares de configuration (TOUJOURS EN PREMIER)
app.use(cors());

// IMPORTANT : On définit la limite de taille ICI, avant toute route
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Définition des routes (Strictement identiques à votre fichier)
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/annonces", annonceRoutes);
app.use("/api/favoris", favoriRoutes);
app.use('/api/messages', messageRoutes);

// 4. Encapsulation de l'application Express dans un serveur HTTP
const server = http.createServer(app);

// 5. Initialisation du tunnel en temps réel Socket.IO
init(server);

// 6. Lancement du serveur (On écoute maintenant le 'server' au lieu de 'app')
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});