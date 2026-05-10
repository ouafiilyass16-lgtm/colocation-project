import { useState, createContext, useContext, useEffect, useCallback } from "react";
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

// ── URL ↔ page mapping ──────────────────────────────────────────────────────
const PAGE_TO_URL = {
  home:           "/",
  login:          "/connexion",
  register:       "/inscription",
  "mes-annonces": "/mes-annonces",
  "create-annonce": "/publier",
  favoris:        "/favoris",
  messages:       "/messages",
  profile:        "/profil",
  admin:          "/admin",
  "annonce-detail": "/annonces", // will append /:id
};

const URL_TO_PAGE = {
  "/":             "home",
  "/connexion":    "login",
  "/inscription":  "register",
  "/mes-annonces": "mes-annonces",
  "/publier":      "create-annonce",
  "/favoris":      "favoris",
  "/messages":     "messages",
  "/profil":       "profile",
  "/admin":        "admin",
};

/** Parse the current browser URL → { page, params } */
function parseLocation() {
  const path = window.location.pathname;

  // /annonces/:id
  const detailMatch = path.match(/^\/annonces\/(.+)$/);
  if (detailMatch) return { page: "annonce-detail", params: detailMatch[1] };

  return { page: URL_TO_PAGE[path] || "home", params: null };
}

// ────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);

  const [{ page, pageParams }, setRoute] = useState(parseLocation);

  // Keep browser URL in sync when state changes
  const navigate = useCallback((p, params = null) => {
    let url = PAGE_TO_URL[p] || "/";
    if (p === "annonce-detail" && params) url = `/annonces/${params}`;

    // Push new history entry (avoids duplicate on same page)
    if (window.location.pathname !== url) {
      window.history.pushState({ page: p, params }, "", url);
    }

    setRoute({ page: p, pageParams: params });
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Handle browser back / forward
  useEffect(() => {
    const onPop = (e) => {
      const loc = e.state || parseLocation();
      setRoute({ page: loc.page || "home", pageParams: loc.params || null });
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // On first load: set the correct history state so popstate works after navigation
  useEffect(() => {
    window.history.replaceState({ page, params: pageParams }, "", window.location.href);
  }, []); // eslint-disable-line

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

  const renderPage = () => {
    switch (page) {
      case "home":           return <Home />;
      case "login":          return <Login />;
      case "register":       return <Register />;
      case "annonce-detail": return <AnnonceDetail id={pageParams} />;
      case "create-annonce": return <CreateAnnonce />;
      case "mes-annonces":   return <MesAnnonces />;
      case "favoris":        return <Favoris />;
      case "messages":       return <Messages />;
      case "profile":        return <Profile />;
      case "admin":          return <AdminPanel />;
      default:               return <Home />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, navigate, api, page }}>
      <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
        <Navbar />
        <main>{renderPage()}</main>
      </div>
    </AuthContext.Provider>
  );
}
