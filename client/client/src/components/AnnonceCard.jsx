import { useAuth } from "../App";

const typeIcons = {
  appartement: "🏢",
  chambre: "🛏️",
  studio: "🏠",
  maison: "🏡",
  autre: "📦",
};

export default function AnnonceCard({ annonce, onFavori, isFavori, compact }) {
  const { navigate, user } = useAuth();

  const statusBadge = {
    active: <span className="badge badge-active">● Actif</span>,
    en_attente: <span className="badge badge-pending">⏳ En attente</span>,
    rejetee: <span className="badge badge-rejected">✕ Rejeté</span>,
    archivee: <span className="badge badge-archived">📦 Archivé</span>,
  };

  return (
    <div
      onClick={() => navigate("annonce-detail", annonce._id)}
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "var(--transition)",
        position: "relative",
        backdropFilter: "blur(20px)",
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = "var(--border2)";
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Image placeholder */}
      <div style={{
        height: compact ? 120 : 180,
        background: `linear-gradient(135deg, var(--bg3) 0%, #1e2d45 100%)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: compact ? 36 : 48,
        position: "relative",
      }}>
        {annonce.photos?.[0]?.url ? (
          <img src={annonce.photos[0].url} alt={annonce.titre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span style={{ opacity: 0.4 }}>{typeIcons[annonce.typeLogement] || "🏠"}</span>
        )}

        {/* Favori button */}
        {user?.role === "etudiant" && onFavori && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavori(annonce._id); }}
            style={{
              position: "absolute", top: 10, right: 10,
              background: isFavori ? "rgba(248,113,113,0.9)" : "rgba(0,0,0,0.5)",
              border: "none", borderRadius: "50%",
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", fontSize: 14,
              transition: "var(--transition)",
              backdropFilter: "blur(10px)",
            }}
          >
            {isFavori ? "❤️" : "🤍"}
          </button>
        )}

        {/* Status */}
        <div style={{ position: "absolute", bottom: 10, left: 10 }}>
          {statusBadge[annonce.statut]}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: compact ? "14px" : "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
          <h3 style={{
            fontFamily: "var(--font-display)",
            fontSize: compact ? 14 : 16,
            fontWeight: 700,
            lineHeight: 1.3,
            color: "var(--text)",
          }}>
            {annonce.titre}
          </h3>
          <div style={{
            fontSize: compact ? 15 : 18,
            fontWeight: 700,
            color: "var(--accent)",
            fontFamily: "var(--font-display)",
            whiteSpace: "nowrap",
          }}>
            {annonce.prix?.toLocaleString()} <span style={{ fontSize: 11, color: "var(--text3)" }}>MAD/mois</span>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 12, color: "var(--text2)" }}>
          <span>📍 {annonce.ville}</span>
          <span>·</span>
          <span>{typeIcons[annonce.typeLogement]} {annonce.typeLogement}</span>
          {annonce.surface && (<><span>·</span><span>📐 {annonce.surface} m²</span></>)}
        </div>

        {!compact && annonce.description && (
          <p style={{
            marginTop: 10,
            fontSize: 13, color: "var(--text3)",
            lineHeight: 1.5,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {annonce.description}
          </p>
        )}
      </div>
    </div>
  );
}
