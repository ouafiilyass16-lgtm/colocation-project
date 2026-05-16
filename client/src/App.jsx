import { socket } from "./socket"; // 👈 Pris depuis la racine de src
import {
  useState,
  createContext,
  useContext,
  useEffect, // 👈 Ajouté pour gérer le cycle de vie du socket
} from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AnnonceDetail from "./pages/AnnonceDetail";
import CreateAnnonce from "./pages/CreateAnnonce";
import ModifierAnnonce from "./pages/ModifierAnnonce";
import MesAnnonces from "./pages/MesAnnonces";
import Favoris from "./pages/Favoris";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";

import Navbar from "./components/Navbar";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API = "http://localhost:5000/api";

// ── API helper — toutes les méthodes HTTP ──────────────────────
export const api = {
  get: (path, token) =>
    fetch(`${API}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.json()),

  post: (path, body, token) =>
    fetch(`${API}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  put: (path, body, token) =>
    fetch(`${API}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  patch: (path, body, token) =>
    fetch(`${API}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),

  delete: (path, token) =>
    fetch(`${API}${path}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then((r) => r.json()),
};

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [page, setPage] = useState("home");
  const [pageParams, setPageParams] = useState(null);

  // ── SYNCHRONISATION AUTOMATIQUE SOCKET.IO ──
  useEffect(() => {
    if (user && token) {
      // Connexion au serveur
      socket.connect();
      // Enregistrement de l'utilisateur connecté dans la Map globale du serveur
      socket.emit("register", user._id);
    }

    return () => {
      // Déconnexion propre si l'utilisateur quitte ou ferme l'application
      socket.disconnect();
    };
  }, [user, token]);

  const login = (u, t) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
    setPage("home");
  };

  const logout = () => {
    socket.disconnect(); // 👈 Coupe le tunnel réseau immédiatement
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setPage("login");
  };

  const navigate = (p, params = null) => {
    setPage(p);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
      case "home":            return <Home />;
      case "login":           return <Login />;
      case "register":        return <Register />;
      case "annonce-detail":  return <AnnonceDetail id={pageParams} />;;
      case "create-annonce":  return <CreateAnnonce />;;
      case "modifier-annonce":return <ModifierAnnonce id={pageParams} />;;
      case "mes-annonces":    return <MesAnnonces />;;
      case "favoris":         return <Favoris />;;
      case "messages":        return <Messages />;;
      case "profile":         return <Profile />;;
      case "admin":           return <AdminPanel />;;
      default:                return <Home />;;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, navigate, api, page }}>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        {renderPage()}
      </div>
    </AuthContext.Provider>
  );
}