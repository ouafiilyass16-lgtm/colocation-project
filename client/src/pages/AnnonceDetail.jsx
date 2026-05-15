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

  // Vérification propriétaire (conversion en String pour éviter les erreurs de type)
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
            <span className="location-text">📍 {annonce.ville}</span>
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
            <div className="spec-pill-group">
              <SpecItem icon="🏠" label="Type" value={annonce.typeLogement} />
              <SpecItem icon="📐" label="Surface" value={`${annonce.surface} m²`} />
              <SpecItem icon="📍" label="Ville" value={annonce.ville} />
              <SpecItem icon="📅" label="Dispo" value={annonce.dateDisponibilite ? new Date(annonce.dateDisponibilite).toLocaleDateString() : "N/C"} />
            </div>

            <h3 className="section-title-premium">À propos du logement</h3>
            <p className="description-text">{annonce.description}</p>
          </div>

          <aside className="detail-sidebar">
            <div className="booking-card-premium">
              {/* AFFICHAGE DU NOM DU PROPRIÉTAIRE */}
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
                    📝 Modifier l'annonce
                  </button>
                  <button onClick={handleArchive} className="btn-archive-outline">
                    📦 Archiver
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
      <span className="icon-box-premium">{icon}</span>
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