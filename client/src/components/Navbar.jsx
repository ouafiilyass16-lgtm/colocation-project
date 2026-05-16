import { useAuth } from "../App";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import mainLogo from "../styles/ChatGPT Image 14 mai 2026, 19_19_52.png";
import "../styles/Navbar.css";

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
            <img src={mainLogo} alt="LocaStudy Logo" className="nav-logo-img" />
            <span className="nav-logo-text">
              Loca<span className="logo-udy-accent">Study</span>
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

                {/* LE MENU DÉROULANT STYLE PRESTIGE */}
                {dropOpen && (
                  <div className="dropdown-menu-custom">
                    <div className="dropdown-header">
                      <strong>{user.nom}</strong>
                      <span className="user-role-badge">
                        {user.role === "admin" ? "Administrateur" : 
                         user.role === "etudiant" ? " Étudiant" : " Propriétaire"}
                      </span>
                    </div>
                    <div style={{ padding: "8px 0" }}>
                      {user.role === "admin" && (
                        <DropItem 
                          icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="3"/>
                              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                          }
                          label="Gestion Admin" 
                          onClick={() => {navigate("admin"); setDropOpen(false);}} 
                        />
                      )}
                      <DropItem 
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        }
                        label="Mon profil" 
                        onClick={() => {navigate("profile"); setDropOpen(false);}} 
                      />
                      <DropItem 
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        }
                        label="Messages" 
                        onClick={() => {navigate("messages"); setDropOpen(false);}} 
                      />
                      <div style={{ height: "1px", background: "rgba(15, 23, 42, 0.05)", margin: "8px 0" }}></div>
                      <DropItem 
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF385C" strokeWidth="2.5">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
                          </svg>
                        }
                        label="Déconnexion" 
                        onClick={logout} 
                        accent 
                      />
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

function DropItem({ icon, label, onClick, accent }) {
  return (
    <button className={`drop-item ${accent ? 'accent' : ''}`} onClick={onClick}>
      <span className="drop-item-icon" style={{ display: "flex", alignItems: "center" }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}