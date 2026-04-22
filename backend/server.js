import dotenv from "dotenv";
import connectDB from "./src/config/db.js";
import express from "express";

dotenv.config();

const app = express();

connectDB();

app.get("/", (req, res) => {
  res.send("Serveur + MongoDB OK");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);
});