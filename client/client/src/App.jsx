import { useState, createContext, useContext, useEffect } from "react";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import AnnonceDetail from "./pages/AnnonceDetail";
import CreateAnnonce from "./pages/CreateAnnonce";
import MesAnnonces from "./pages/MesAnnonces";
import Favoris from "./pages/Favoris";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import AdminPanel from "./pages/AdminPanel";
import Navbar from "./components/Navbar";

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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  patch: (path, body, token) =>
    fetch(`${API}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }).then((r) => r.json()),
  delete: (path, token) =>
    fetch(`${API}${path}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => r.json()),
};

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [page, setPage] = useState("home");
  const [pageParams, setPageParams] = useState(null);

  const login = (userData, tok) => {
    setUser(userData);
    setToken(tok);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tok);
    navigate("home");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    navigate("home");
  };

  const navigate = (p, params = null) => {
    setPage(p);
    setPageParams(params);
    window.scrollTo(0, 0);
  };

  const renderPage = () => {
    switch (page) {
      case "home": return <Home />;
      case "login": return <Login />;
      case "register": return <Register />;
      case "annonce-detail": return <AnnonceDetail id={pageParams} />;
      case "create-annonce": return <CreateAnnonce />;
      case "mes-annonces": return <MesAnnonces />;
      case "favoris": return <Favoris />;
      case "messages": return <Messages />;
      case "profile": return <Profile />;
      case "admin": return <AdminPanel />;
      default: return <Home />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, navigate, api }}>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <main>{renderPage()}</main>
      </div>
    </AuthContext.Provider>
  );
}
