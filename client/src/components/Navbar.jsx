import { useAuth } from "../App";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { user, logout, navigate, page } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => setMobileOpen(false), [page]);

  const navLinks = [
    { label: "Annonces", page: "home" },
    ...(user
      ? [
          user.role === "proprietaire" && { label: "Mes annonces", page: "mes-annonces" },
          user.role === "etudiant" && { label: "Favoris", page: "favoris" },
          { label: "Messages", page: "messages" },
          user.role === "admin" && { label: "Admin", page: "admin" },
        ].filter(Boolean)
      : []),
  ];

  const isActive = (p) => page === p;

  return (
    <>
      <nav style={{
        position: "sticky", top: 0, zIndex: 200,
        background: scrolled ? "rgba(var(--navbar-rgb, 255,255,255),0.97)" : "var(--color-navbar-bg, #fff)",
        borderBottom: `1px solid ${scrolled ? "rgba(221,221,221,0.8)" : "var(--color-border, #DDDDDD)"}`,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.25s ease",
        boxShadow: scrolled ? "var(--color-navbar-shadow, 0 2px 20px rgba(0,0,0,0.06))" : "none",
      }}>
        <div style={{
          maxWidth: 1280, margin: "0 auto", padding: "0 24px",
          height: 72, display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 16,
        }}>

          {/* ── Logo ── */}
          <button
            onClick={() => navigate("home")}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 8,
              padding: 0, flexShrink: 0,
            }}
          >
            <div style={{
              width: 34, height: 34,
              background: "linear-gradient(135deg, #FF385C 0%, #E31C5F 100%)",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17,
              boxShadow: "0 2px 8px rgba(255,56,92,0.35)",
            }}>🏡</div>
            <span style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 21, fontWeight: 700,
              color: "var(--color-text, #222)", letterSpacing: "-0.03em",
              lineHeight: 1,
            }}>
              Loca<span style={{ color: "#FF385C" }}>Study</span>
            </span>
          </button>

          {/* ── Desktop Nav Links ── */}
          <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                style={{
                  background: "none", border: "none",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 14, fontWeight: isActive(link.page) ? 700 : 500,
                  color: isActive(link.page) ? "var(--color-text, #222)" : "var(--color-text-secondary, #484848)",
                  cursor: "pointer",
                  padding: "8px 14px",
                  borderRadius: 8,
                  position: "relative",
                  transition: "color 0.15s, background 0.15s",
                }}
                onMouseOver={e => { if (!isActive(link.page)) e.currentTarget.style.background = "var(--color-surface,#FF385C)"; }}
                onMouseOut={e => { if (!isActive(link.page)) e.currentTarget.style.background = "none"; }}
              >
                {link.label}
                {isActive(link.page) && (
                  <span style={{
                    position: "absolute", bottom: 2, left: "50%",
                    transform: "translateX(-50%)",
                    width: 4, height: 4, borderRadius: "50%",
                    background: "#FF385C", display: "block",
                  }} />
                )}
              </button>
            ))}
          </div>

          {/* ── Right Side ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>

            {/* Publish button for proprietaire */}
            {user?.role === "proprietaire" && (
              <button
                onClick={() => navigate("create-annonce")}
                className="desktop-nav"
                style={{
                  background: "none",
                  border: "1.5px solid var(--color-border, #DDDDDD)",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 13, fontWeight: 600,
                  color: "var(--color-text, #222)", cursor: "pointer",
                  padding: "8px 16px", borderRadius: 100,
                  transition: "all 0.15s",
                  display: "flex", alignItems: "center", gap: 5,
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "var(--color-text, #222)"; e.currentTarget.style.background = "var(--color-surface, #F7F7F7)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "var(--color-border, #DDDDDD)"; e.currentTarget.style.background = "none"; }}
              >
                <span style={{ fontSize: 14 }}>+</span> Publier
              </button>
            )}

            {/* ── ThemeToggle ── placé ici, avant le dropdown utilisateur */}
            <ThemeToggle />

            {user ? (
              /* ── User dropdown ── */
              <div ref={dropRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropOpen(o => !o)}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    border: `1.5px solid ${dropOpen ? "var(--color-text-muted, #B0B0B0)" : "var(--color-border, #DDDDDD)"}`,
                    borderRadius: 100, padding: "5px 6px 5px 12px",
                    cursor: "pointer",
                    background: "var(--color-bg-card, #fff)",
                    transition: "all 0.15s",
                    boxShadow: dropOpen ? "0 2px 12px rgba(0,0,0,0.12)" : "none",
                  }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.10)"}
                  onMouseOut={e => { if (!dropOpen) e.currentTarget.style.boxShadow = "none"; }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary, #484848)" strokeWidth="2.2" strokeLinecap="round">
                    <line x1="3" y1="7" x2="21" y2="7"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="17" x2="21" y2="17"/>
                  </svg>
                  <div style={{
                    width: 30, height: 30, borderRadius: "50%",
                    background: "linear-gradient(135deg, #FF385C, #E31C5F)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, color: "#fff",
                    flexShrink: 0,
                  }}>
                    {user.nom?.[0]?.toUpperCase() || "?"}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {dropOpen && (
                  <div style={{
                    position: "absolute", top: "calc(100% + 10px)", right: 0,
                    background: "var(--color-bg-card, #fff)",
                    border: "1px solid var(--color-border, #DDDDDD)",
                    borderRadius: 14, minWidth: 220,
                    boxShadow: "var(--color-card-shadow, 0 8px 28px rgba(0,0,0,0.12))",
                    overflow: "hidden",
                    animation: "dropIn 0.18s cubic-bezier(0.34,1.56,0.64,1)",
                    zIndex: 999,
                  }}>
                    <div style={{
                      padding: "14px 18px 12px",
                      borderBottom: "1px solid var(--color-border, #F0F0F0)",
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text, #222)" }}>{user.nom}</div>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#FF385C", textTransform: "capitalize", marginTop: 2 }}>
                        {user.role === "etudiant" ? "🎓 Étudiant" : user.role === "proprietaire" ? "🏠 Propriétaire" : "⚙️ Admin"}
                      </div>
                    </div>

                    <div style={{ padding: "6px 0" }}>
                      <DropItem label="Mon profil" onClick={() => { navigate("profile"); setDropOpen(false); }} />
                      {navLinks.filter(l => l.page !== "home").map(link => (
                        <DropItem key={link.page} label={link.label} onClick={() => { navigate(link.page); setDropOpen(false); }} active={isActive(link.page)} />
                      ))}
                      {user.role === "proprietaire" && (
                        <DropItem label="+ Publier une annonce" onClick={() => { navigate("create-annonce"); setDropOpen(false); }} accent />
                      )}
                    </div>

                    <div style={{ padding: "6px 0", borderTop: "1px solid var(--color-border, #F0F0F0)" }}>
                      <button
                        onClick={() => { logout(); setDropOpen(false); }}
                        style={{
                          width: "100%", background: "none", border: "none",
                          padding: "11px 18px", textAlign: "left",
                          fontFamily: "'DM Sans', system-ui, sans-serif",
                          fontSize: 14, fontWeight: 500,
                          color: "#C13515", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 8,
                          transition: "background 0.12s",
                        }}
                        onMouseOver={e => e.currentTarget.style.background = "#FFF5F5"}
                        onMouseOut={e => e.currentTarget.style.background = "none"}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16,17 21,12 16,7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── Auth buttons ── */
              <div style={{
                display: "flex", alignItems: "center",
                border: "1.5px solid var(--color-border, #DDDDDD)",
                borderRadius: 100, overflow: "hidden",
                transition: "box-shadow 0.15s",
              }}
                onMouseOver={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"}
                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
              >
                <button
                  onClick={() => navigate("login")}
                  style={{
                    background: "none", border: "none",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: 14, fontWeight: 500,
                    color: "var(--color-text, #222222)",
                    padding: "9px 16px", cursor: "pointer",
                    transition: "background 0.12s",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "var(--color-surface, #F7F7F7)"}
                  onMouseOut={e => e.currentTarget.style.background = "none"}
                >
                  Connexion
                </button>
                <button
                  onClick={() => navigate("register")}
                  style={{
                    background: "#222", border: "none",
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                    fontSize: 14, fontWeight: 600, color: "#fff",
                    padding: "9px 18px", cursor: "pointer",
                    borderRadius: 100, transition: "background 0.15s",
                  }}
                  onMouseOver={e => e.currentTarget.style.background = "#111"}
                  onMouseOut={e => e.currentTarget.style.background = "#222"}
                >
                  Inscription
                </button>
              </div>
            )}

            {/* ── Mobile hamburger (non-logged) ── */}
            {!user && (
              <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(o => !o)}
                style={{
                  display: "none", background: "none",
                  border: "1.5px solid var(--color-border, #DDDDDD)",
                  borderRadius: 8, padding: "8px",
                  cursor: "pointer", alignItems: "center", justifyContent: "center",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary, #484848)" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="7" x2="21" y2="7"/>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="17" x2="21" y2="17"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* ── Mobile Nav ── */}
        {mobileOpen && (
          <div style={{
            borderTop: "1px solid var(--color-border, #EBEBEB)",
            padding: "12px 16px",
            display: "flex", flexDirection: "column", gap: 2,
            background: "var(--color-navbar-bg, #fff)",
          }}>
            {navLinks.map(link => (
              <button
                key={link.page}
                onClick={() => navigate(link.page)}
                style={{
                  background: isActive(link.page) ? "var(--color-surface, #F7F7F7)" : "none",
                  border: "none", textAlign: "left",
                  fontFamily: "'DM Sans', system-ui, sans-serif",
                  fontSize: 15, fontWeight: isActive(link.page) ? 700 : 500,
                  color: isActive(link.page) ? "var(--color-text, #222)" : "var(--color-text-secondary, #484848)",
                  padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                  width: "100%",
                }}
              >
                {link.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: none; }
        }
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function DropItem({ label, onClick, active, accent }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: "100%", background: active ? "var(--color-surface, #F7F7F7)" : "none",
        border: "none", padding: "11px 18px", textAlign: "left",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 14, fontWeight: active ? 700 : 500,
        color: accent ? "#FF385C" : active ? "var(--color-text, #222)" : "var(--color-text-secondary, #484848)",
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 8,
        transition: "background 0.12s",
      }}
      onMouseOver={e => { if (!active) e.currentTarget.style.background = "var(--color-surface, #F7F7F7)"; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.background = "none"; }}
    >
      {label}
    </button>
  );
}