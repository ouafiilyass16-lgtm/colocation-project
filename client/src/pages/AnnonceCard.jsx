import { useAuth } from "../App";

const typeLabels = {
  appartement: "Appartement",
  chambre: "Chambre",
  studio: "Studio",
  maison: "Maison",
  autre: "Autre",
};

const typeColors = {
  appartement: "#4A90D9",
  chambre: "#9B59B6",
  studio: "#27AE60",
  maison: "#E67E22",
  autre: "#95A5A6",
};

export default function AnnonceCard({ annonce, onFavori, isFavori, compact }) {
  const { navigate, user } = useAuth();

  return (
    <div
      onClick={() => navigate("annonce-detail", annonce._id)}
      className="listing-card"
    >
      {/* Image */}
      <div className="listing-card__img-wrap">
        {annonce.photos?.[0]?.url ? (
          <img src={annonce.photos[0].url} alt={annonce.titre} />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: "linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexDirection: "column", gap: 8,
          }}>
            <div style={{ fontSize: compact ? 32 : 42, opacity: 0.3 }}>🏠</div>
            <div style={{ fontSize: 12, color: "#B0B0B0", fontWeight: 500 }}>Aucune photo</div>
          </div>
        )}

        {/* Favori heart */}
        {user?.role === "etudiant" && onFavori && (
          <button
            onClick={(e) => { e.stopPropagation(); onFavori(annonce._id); }}
            style={{
              position: "absolute", top: 12, right: 12,
              background: "transparent", border: "none",
              cursor: "pointer", padding: 4,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.15s ease",
            }}
            onMouseOver={e => e.currentTarget.style.transform = "scale(1.1)"}
            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="24" height="24" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 28C16 28 3 19.5 3 10.5C3 6.91 5.91 4 9.5 4C11.74 4 13.73 5.14 15 6.87C16.27 5.14 18.26 4 20.5 4C24.09 4 27 6.91 27 10.5C27 19.5 16 28 16 28Z"
                fill={isFavori ? "#FF385C" : "rgba(255,255,255,0.85)"}
                stroke={isFavori ? "none" : "rgba(0,0,0,0.35)"}
                strokeWidth="1.5"
              />
            </svg>
          </button>
        )}

        {/* Status badge */}
        {annonce.statut && annonce.statut !== "active" && (
          <div style={{ position: "absolute", bottom: 12, left: 12 }}>
            <span className={`badge badge-${annonce.statut === "en_attente" ? "pending" : annonce.statut === "rejetee" ? "rejected" : "archived"}`}>
              {annonce.statut === "en_attente" ? "En attente" : annonce.statut === "rejetee" ? "Rejeté" : "Archivé"}
            </span>
          </div>
        )}

        {/* Type pill */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          borderRadius: 100,
          padding: "4px 10px",
          fontSize: 11, fontWeight: 700,
          color: typeColors[annonce.typeLogement] || "#484848",
          letterSpacing: "0.03em",
          display: annonce.photos?.[0]?.url ? "block" : "none",
        }}>
          {typeLabels[annonce.typeLogement] || "Logement"}
        </div>
      </div>

      {/* Body */}
      <div className="listing-card__body">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 4 }}>
          <div className="listing-card__title">{annonce.titre}</div>
          {/* Star rating placeholder */}
          <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#222">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>Nouveau</span>
          </div>
        </div>

        <div className="listing-card__sub">
          {annonce.ville} · {annonce.surface && `${annonce.surface} m²`}
        </div>

        <div className="listing-card__price">
          {annonce.prix?.toLocaleString()} MAD <span>/ mois</span>
        </div>
      </div>
    </div>
  );
}
