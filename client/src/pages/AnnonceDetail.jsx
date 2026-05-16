import { useState, useEffect } from "react";
import { useAuth } from "../App";
import "../styles/AnnonceDetail.css";

export default function AnnonceDetail({ id }) {
  const { api, token, user, navigate } = useAuth();

  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgForm, setMsgForm] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    if (id && id !== "undefined") {
      loadAnnonce();
    }
  }, [id]);

  const loadAnnonce = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/annonces/${id}`);
      setAnnonce(data?._id ? data : null);
    } catch (err) {
      console.error("Erreur chargement annonce :", err);
      setAnnonce(null);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!msgForm.trim()) return;
    try {
      const res = await api.post(
        "/messages",
        {
          destinataireId: annonce.proprietaire._id || annonce.proprietaire,
          contenu: msgForm,
          annonceId: id,
        },
        token
      );
      if (res) {
        setMsgSent(true);
        setMsgForm("");
      }
    } catch (err) {
      console.error("Erreur envoi message");
    }
  };

  const handleArchive = async () => {
    if (window.confirm("Voulez-vous archiver cette annonce ?")) {
      try {
        await api.patch(`/annonces/${id}/archiver`, {}, token);
        loadAnnonce();
      } catch (err) {
        console.error("Erreur archivage");
      }
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!annonce) return (
    <div className="container empty-detail-state text-center py-5">
      <h3>Annonce introuvable</h3>
      <button onClick={() => navigate("home")} className="btn-send-premium">Retour</button>
    </div>
  );

  const currentUserId = user?._id || user?.id;
  const ownerId = annonce.proprietaire?._id || annonce.proprietaire;
  const isOwner = currentUserId && ownerId && String(currentUserId) === String(ownerId);

  const photos = annonce.photos?.length ? annonce.photos : [{ url: null }];

  return (
    <div className="detail-wrapper">
      {/* ZOOM PHOTO */}
      {isZoomed && photos[activePhoto]?.url && (
        <div className="photo-zoom-overlay" onClick={() => setIsZoomed(false)}>
          <img src={photos[activePhoto].url} alt="Zoom" className="zoomed-img" />
          <div className="close-zoom-btn">×</div>
        </div>
      )}

      <div className="container detail-container">
        <button onClick={() => navigate("home")} className="btn-back-premium">
          <span>← Revenir aux annonces</span>
        </button>

        <div className="detail-header-block">
          <h1 className="detail-main-title">{annonce.titre}</h1>
          <div className="detail-meta-row">
            <StatusBadge status={annonce.statut} />
            <span className="location-text">
              {/* Icône de localisation moderne en SVG */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5" style={{ marginRight: '5px', verticalAlign: 'middle' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {annonce.ville}
            </span>
          </div>
        </div>

        <div className="gallery-grid" style={{ gridTemplateColumns: photos.length > 1 ? "3fr 2fr" : "1fr" }}>
          <div className="main-photo-wrap" onClick={() => photos[activePhoto]?.url && setIsZoomed(true)}>
            {photos[activePhoto]?.url ? (
              <img src={photos[activePhoto].url} alt="Principale" />
            ) : (
              <div className="no-photo-placeholder">🏠</div>
            )}
            {photos[activePhoto]?.url && <div className="zoom-hint">🔍 Zoomer</div>}
          </div>
          
          {photos.length > 1 && (
            <div className="thumbnail-side-grid">
              {photos.slice(1, 3).map((p, i) => (
                <div key={i} className="thumb-wrap" onClick={() => setActivePhoto(i + 1)}>
                  {p?.url ? <img src={p.url} alt="" /> : <div className="no-photo-placeholder-mini">🏠</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="detail-main-layout">
          <div className="detail-left-content">
            
            {/* ── SECTION PILLS AVEC LES NOUVELLES ICÔNES SVG PRESTIGE ── */}
            <div className="spec-pill-group">
              <SpecItem 
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                } 
                label="Type" 
                value={annonce.typeLogement} 
              />
              <SpecItem 
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                  </svg>
                } 
                label="Surface" 
                value={`${annonce.surface} m²`} 
              />
              <SpecItem 
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                } 
                label="Ville" 
                value={annonce.ville} 
              />
              <SpecItem 
                icon={
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                } 
                label="Disponibilité" 
                value={annonce.dateDisponibilite ? new Date(annonce.dateDisponibilite).toLocaleDateString() : "Immédiate"} 
              />
            </div>

            <h3 className="section-title-premium">À propos du logement</h3>
            <p className="description-text">{annonce.description}</p>
          </div>

          <aside className="detail-sidebar">
            <div className="booking-card-premium">
              <div className="owner-info-small">
                <span className="owner-label">Propriétaire :</span>
                <span className="owner-name-value">{annonce.proprietaire?.nom || "Non renseigné"}</span>
              </div>

              <div className="price-block">
                <span className="price-big">{annonce.prix?.toLocaleString()} MAD</span>
                <span className="price-sub"> / mois</span>
              </div>

              {isOwner ? (
                <div className="owner-actions-vertical">
                  <div className="owner-management-info">Ma gestion</div>
                  <button onClick={() => navigate("modifier-annonce", annonce._id)} className="btn-edit-gold-full">
                     Modifier l'annonce
                  </button>
                  <button onClick={handleArchive} className="btn-archive-outline">
                     Archiver
                  </button>
                </div>
              ) : (
                <>
                  {msgSent ? (
                    <div className="success-message-premium">✓ Demande envoyée</div>
                  ) : (
                    <div className="form-premium">
                      <label className="input-label-premium">Votre message</label>
                      <textarea 
                        placeholder="Posez vos questions ici..."
                        value={msgForm}
                        onChange={(e) => setMsgForm(e.target.value)}
                      />
                      <button onClick={sendMessage} className="btn-send-premium" disabled={!msgForm.trim()}>
                        Contacter le propriétaire
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon, label, value }) {
  return (
    <div className="spec-pill-item">
      <div className="icon-box-premium">
        {icon}
      </div>
      <div className="spec-texts">
        <div className="spec-label">{label}</div>
        <div className="spec-value">{value}</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = { active: "#10B981", en_attente: "#F59E0B", rejetee: "#EF4444", archivee: "#64748B" };
  const color = map[status] || "#64748B";
  return (
    <span className="status-badge-premium" style={{ color: color, background: `${color}15` }}>
      ● {status?.replace('_', ' ')}
    </span>
  );
}