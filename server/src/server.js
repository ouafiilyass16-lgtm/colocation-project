const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const annonceRoutes = require("./routes/annonceRoutes");
const favoriRoutes = require("./routes/favoriRoutes");
const messageRoutes = require('./routes/messageRoutes');

const app = express();

// 1. Connexion à la base de données
connectDB();

// 2. Middlewares de configuration (TOUJOURS EN PREMIER)
app.use(cors());

// IMPORTANT : On définit la limite de taille ICI, avant toute route
// On supprime l'ancien app.use(express.json()) qui n'avait pas de limite
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Définition des routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/annonces", annonceRoutes);
app.use("/api/favoris", favoriRoutes);
app.use('/api/messages', messageRoutes);

// 4. Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});