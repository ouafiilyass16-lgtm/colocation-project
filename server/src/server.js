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
const { initWebSocket } = require('./websocketManager');

const app = express();

connectDB();

app.use(cors());

app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/annonces", annonceRoutes);
app.use("/api/favoris", favoriRoutes);
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

initWebSocket(server);
