import { useAuth } from "../App";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import mainLogo from "../styles/ChatGPT Image 14 mai 2026, 19_19_52.png";
import "../styles/Navbar.css"; // Importation du nouveau style

export default function Navbar() {
  const { user, logout, navigate, page } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
const navLinks = [
  { label: "Annonces", page: "home" },
  ...(user ? [
    { label: "Messages", page: "messages" },
    // Ajout du lien Panel Admin ici
    ...(user.role === "admin" ? [{ label: "Panel Admin", page: "admin" }] : []),
    
    user.role === "proprietaire" && { label: "Mes annonces", page: "mes-annonces" },
    user.role === "etudiant" && { label: "Favoris", page: "favoris" },
  ].filter(Boolean) : [])
];
  const isActive = (p) => page === p;

  return (
    <>
      <nav className={`navbar-container ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-content">
          
       <button className="nav-logo" onClick={() => navigate("home")}>
  {/* Logo sans aucun contour */}
  <img src={mainLogo} alt="LocaStudy Logo" className="nav-logo-img" />
  
  <span className="nav-logo-text">
    Loca
    <span className="logo-udy-accent">Study</span>
  </span>
</button>

          {/* ── NAVIGATION DESKTOP ── */}
          <div className="nav-links-desktop">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                className={`nav-link-item ${isActive(link.page) ? "active" : ""}`}
              >
                {link.label}
                {isActive(link.page) && <span className="nav-link-dot" />}
              </button>
            ))}
          </div>

          {/* ── ACTIONS DROITE ── */}
          <div className="nav-actions">
            {user?.role === "proprietaire" && (
              <button className="btn-publish" onClick={() => navigate("create-annonce")}>
                + Publier
              </button>
            )}

            <ThemeToggle />

           {user ? (
  <div ref={dropRef} style={{ position: "relative" }}>
    {/* LE BOUTON DÉCLENCHEUR */}
    <button className="user-drop-btn" onClick={() => setDropOpen(!dropOpen)}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5">
        <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
      </svg>
      <div className="avatar-circle">
        {user.nom?.[0]?.toUpperCase()}
      </div>
    </button>

    {/* LE MENU DÉROULANT */}
    {dropOpen && (
      <div className="dropdown-menu-custom">
        <div className="dropdown-header">
            <strong>{user.nom}</strong>
    <span className="user-role-badge">
        {user.role === "admin" ? "🛡️ Administrateur" : 
         user.role === "etudiant" ? "🎓 Étudiant" : "🏠 Propriétaire"}
    </span>
</div>
        <div style={{ padding: "8px 0" }}>
          {user.role === "admin" && (
      <DropItem label="⚙️ Gestion Admin" onClick={() => {navigate("admin"); setDropOpen(false);}} />
    )}
            <DropItem label="👤 Mon profil" onClick={() => {navigate("profile"); setDropOpen(false);}} />
            <DropItem label="📩 Messages" onClick={() => {navigate("messages"); setDropOpen(false);}} />
            <div style={{ height: "1px", background: "rgba(15, 23, 42, 0.05)", margin: "8px 0" }}></div>
            <DropItem label="🚪 Déconnexion" onClick={logout} accent />
        </div>
      </div>
    )}
  </div>
) : (
              <div className="auth-nav-group">
              <button className="nav-link-item" onClick={() => navigate("login")}>Connexion</button>
  <button className="btn-auth-nav" onClick={() => navigate("register")}>S'inscrire</button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

// Composant utilitaire pour les items du dropdown
function DropItem({ label, onClick, accent }) {
    return (
      <button className={`drop-item ${accent ? 'accent' : ''}`} onClick={onClick}>
        {label}
      </button>
    );
}