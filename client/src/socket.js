// client/src/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // L'adresse de votre serveur Node.js

export const socket = io(SOCKET_URL, {
  autoConnect: false, // On attend que l'utilisateur soit connecté pour ouvrir le tunnel
  withCredentials: true
});