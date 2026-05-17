import { socket } from "./socket";
import {
  useState,
  createContext,
  useContext,
  useEffect,
} from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

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
import Footer from "./components/Footer";
import FloatingThemeToggle from "./components/FloatingThemeToggle";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const API = "http://localhost:5000/api";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (user && token) {
      socket.connect();
      socket.emit("register", user._id);
    }

    return () => {
      socket.disconnect();
    };
  }, [user, token]);

  const login = (u, t) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("token", t);
    navigate("/");
  };

  const logout = () => {
    socket.disconnect();
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, navigate, api }}>
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/annonce/:id" element={<AnnonceDetail />} />
            <Route path="/create-annonce" element={<CreateAnnonce />} />
            <Route path="/modifier-annonce/:id" element={<ModifierAnnonce />} />
            <Route path="/mes-annonces" element={<MesAnnonces />} />
            <Route path="/favoris" element={<Favoris />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </div>
        <Footer />
        <FloatingThemeToggle />
      </div>
    </AuthContext.Provider>
  );
}