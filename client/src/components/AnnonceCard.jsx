import { useAuth } from "../App";
import "../styles/AnnonceCard.css";

export default function AnnonceCard({ annonce, onFavori, isFavori }) {
  const { navigate, user } = useAuth();

  // Icônes vectorielles modernes teintées en beige premium (#D4B996)
  const icons = {
    ville: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
    surface: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    ),
    type: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  };

  return (
    <div 
      className="modern-card" 
      onClick={() => navigate(`/annonce/${annonce._id}`)}
    >
      <div className="card-image-wrapper">
        {annonce.photos?.[0]?.url ? (
          <img src={annonce.photos[0].url} alt={annonce.titre} className="card-img" />
        ) : (
          <div className="card-img-placeholder">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                </svg>
          </div>
        )}

        {/* BOUTON FAVORI : e.stopPropagation() est CRUCIAL ici */}
        {user?.role === "etudiant" && (
          <button 
            className={`card-wishlist-btn ${isFavori ? 'active' : ''}`}
            onClick={(e) => { 
              e.stopPropagation(); // Empêche d'ouvrir l'annonce en cliquant sur le cœur
              onFavori(annonce._id); 
            }}
          >
            <svg width="20" height="20" viewBox="0 0 32 32" fill={isFavori ? "#FF385C" : "none"} stroke={isFavori ? "#FF385C" : "#FFFFFF"} strokeWidth="2.5">
              <path d="M16 28C16 28 3 19.5 3 10.5C3 6.91 5.91 4 9.5 4C11.74 4 13.73 5.14 15 6.87C16.27 5.14 18.26 4 20.5 4C24.09 4 27 6.91 27 10.5C27 19.5 16 28 16 28Z" />
            </svg>
          </button>
        )}

        <div className={`card-status-tag tag-${annonce.statut}`}>
          {annonce.statut === 'en_attente' ? 'En attente' : annonce.statut === 'active' ? 'Disponible' : annonce.statut}
        </div>
      </div>

      <div className="card-content">
        <div className="card-meta" style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {annonce.proprietaire?.photoUrl && (
            <img src={annonce.proprietaire.photoUrl} alt="" className="card-owner-photo" />
          )}
          {icons.ville} <span>{annonce.ville}</span>
        </div>
        <h3 className="card-title">{annonce.titre}</h3>

        <div className="card-info-row">
          <div className="info-item">
            {icons.type} <span>{annonce.typeLogement}</span>
          </div>
          {annonce.surface && (
            <div className="info-item">
              {icons.surface} <span>{annonce.surface} m²</span>
            </div>
          )}
        </div>

        <div className="card-footer">
          <div className="card-price">
            {annonce.prix?.toLocaleString()} <small>MAD/mois</small>
          </div>
          
          <button className="btn-detail-gold">
            Détails
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}