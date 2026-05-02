import { useAuth } from "../App";
import { useState } from "react";

export default function Navbar() {
  const { user, logout, navigate } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Annonces", page: "home", icon: "🏠" },
    ...(user
      ? [
          user.role === "proprietaire" && { label: "Mes Annonces", page: "mes-annonces", icon: "📋" },
          user.role === "etudiant" && { label: "Favoris", page: "favoris", icon: "❤️" },
          { label: "Messages", page: "messages", icon: "💬" },
          user.role === "admin" && { label: "Admin", page: "admin", icon: "⚙️" },
        ].filter(Boolean)
      : []),
  ];

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "rgba(11,15,26,0.85)",
      backdropFilter: "blur(20px)",
      borderBottom: "1px solid var(--border)",
    }}>
      <div className="container" style={{ height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <div onClick={() => navigate("home")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32,
            background: "linear-gradient(135deg, var(--accent), var(--accent2))",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🏡</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, letterSpacing: "-0.02em" }}>
            Loca<span style={{ color: "var(--accent)" }}>Study</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
          {navLinks.map((link) => (
            <button key={link.page} onClick={() => navigate(link.page)} className="btn btn-secondary"
              style={{ fontSize: 13, padding: "8px 14px", background: "transparent", border: "none" }}>
              {link.icon} {link.label}
            </button>
          ))}
        </div>

        {/* Auth */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {user ? (
            <>
              <div onClick={() => navigate("profile")} style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 12px", borderRadius: "var(--radius2)",
                cursor: "pointer", transition: "var(--transition)",
                border: "1px solid var(--border)",
                background: "var(--glass)",
              }}
                onMouseOver={e => e.currentTarget.style.borderColor = "var(--border2)"}
                onMouseOut={e => e.currentTarget.style.borderColor = "var(--border)"}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "white",
                }}>
                  {user.nom?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>{user.nom}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", textTransform: "capitalize" }}>{user.role}</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={logout}>Déconnexion</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("login")}>Connexion</button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("register")}>Inscription</button>
            </>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .desktop-nav { display: none !important; } }
      `}</style>
    </nav>
  );
}
