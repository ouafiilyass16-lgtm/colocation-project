import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import mainLogo from "../styles/ChatGPT Image 14 mai 2026, 19_19_52.png";
import "../styles/Navbar.css";

export default function Navbar() {
  const { user, logout, api, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [annonceCount, setAnnonceCount] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || "");
  const dropRef = useRef(null);

  useEffect(() => {
    setPhotoUrl(user?.photoUrl || "");
    if (token) {
      api.get("/profile", token).then(data => {
        if (data?.photoUrl) setPhotoUrl(data.photoUrl);
      }).catch(() => {});
    }
  }, [user, token]);

  useEffect(() => {
    if (user?.role === "proprietaire" && token) {
      api.get("/annonces/mes/annonces", token)
        .then(data => setAnnonceCount(Array.isArray(data) ? data.length : 0))
        .catch(() => setAnnonceCount(0));
    } else {
      setAnnonceCount(null);
    }
  }, [user, token]);

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
    { label: "Annonces", path: "/" },
    ...(user ? [
      { label: "Messages", path: "/messages" },
      ...(user.role === "admin" ? [{ label: "Panel Admin", path: "/admin" }] : []),
      user.role === "proprietaire" && { label: "Mes annonces", path: "/mes-annonces" },
      user.role === "etudiant" && { label: "Favoris", path: "/favoris" },
    ].filter(Boolean) : [])
  ];

  const isActive = (path) => location.pathname === path;

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <nav className={`navbar-container ${scrolled ? "scrolled" : ""}`}>
        <div className="navbar-content">
          
          <button className="nav-logo" onClick={() => navigate("/")}>
            <img src={mainLogo} alt="LocaStudy Logo" className="nav-logo-img" />
            <span className="nav-logo-text">
              Loca<span className="logo-udy-accent">Study</span>
            </span>
          </button>

          {/* ── NAVIGATION DESKTOP ── */}
          <div className="nav-links-desktop">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`nav-link-item ${isActive(link.path) ? "active" : ""}`}
              >
                {link.label}
                {isActive(link.path) && <span className="nav-link-dot" />}
              </button>
            ))}
          </div>

          {/* ── ACTIONS DROITE ── */}
          <div className="nav-actions">
            {user?.role === "proprietaire" && annonceCount === 0 && (
              <button className="btn-publish" onClick={() => navigate("/create-annonce")}>
                + Publier
              </button>
            )}

            <ThemeToggle />

            <button className="nav-hamburger" onClick={() => setMobileOpen(true)} aria-label="Menu">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {user ? (
              <div ref={dropRef} style={{ position: "relative" }}>
                {/* LE BOUTON DÉCLENCHEUR */}
                <button className="user-drop-btn" onClick={() => setDropOpen(!dropOpen)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2.5">
                    <line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/>
                  </svg>
                  <div className="avatar-circle">
                    {photoUrl ? (
                      <img src={photoUrl} alt="" className="avatar-circle-img" />
                    ) : (
                      user.nom?.[0]?.toUpperCase()
                    )}
                  </div>
                </button>

                {/* LE MENU DÉROULANT STYLE PRESTIGE */}
                {dropOpen && (
                  <div className="dropdown-menu-custom">
                    <div className="dropdown-header">
                      {photoUrl && <img src={photoUrl} alt="" className="dropdown-photo" />}
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
                          onClick={() => {navigate("/admin"); setDropOpen(false);}} 
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
                        onClick={() => {navigate("/profile"); setDropOpen(false);}} 
                      />
                      <DropItem 
                        icon={
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        }
                        label="Messages" 
                        onClick={() => {navigate("/messages"); setDropOpen(false);}} 
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
                <button className="nav-link-item" onClick={() => navigate("/login")}>Connexion</button>
                <button className="btn-auth-nav" onClick={() => navigate("/register")}>S'inscrire</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ── OVERLAY MOBILE ── */}
      {mobileOpen && <div className="mobile-overlay" onClick={closeMobile} />}

      {/* ── MENU MOBILE ── */}
      <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
        <div className="mobile-menu-header">
          <span className="mobile-menu-title">Menu</span>
          <button className="mobile-menu-close" onClick={closeMobile} aria-label="Fermer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div className="mobile-menu-links">
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); closeMobile(); }}
              className={`mobile-link-item ${isActive(link.path) ? "active" : ""}`}
            >
              {link.label}
            </button>
          ))}
        </div>
        {user ? (
          <div className="mobile-menu-auth">
            <div className="mobile-menu-user">
              <div className="avatar-circle" style={{ width: 36, height: 36, fontSize: 15 }}>
                {photoUrl ? (
                  <img src={photoUrl} alt="" className="avatar-circle-img" />
                ) : (
                  user.nom?.[0]?.toUpperCase()
                )}
              </div>
              <div>
                <strong style={{ fontSize: 14, color: "var(--text)" }}>{user.nom}</strong>
                <span className="user-role-badge" style={{ fontSize: 10 }}>
                  {user.role === "admin" ? "Administrateur" : 
                   user.role === "etudiant" ? "Étudiant" : "Propriétaire"}
                </span>
              </div>
            </div>
            <button className="mobile-link-item" onClick={() => { navigate("/profile"); closeMobile(); }}>
              Mon profil
            </button>
            <button className="mobile-link-item mobile-link-logout" onClick={() => { logout(); closeMobile(); }}>
              Déconnexion
            </button>
          </div>
        ) : (
          <div className="mobile-menu-auth">
            <button className="mobile-link-item" onClick={() => { navigate("/login"); closeMobile(); }}>
              Connexion
            </button>
            <button className="mobile-link-item mobile-link-register" onClick={() => { navigate("/register"); closeMobile(); }}>
              S'inscrire
            </button>
          </div>
        )}
      </div>
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