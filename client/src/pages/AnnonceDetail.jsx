import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../App";
import "../styles/AnnonceDetail.css";

export default function AnnonceDetail() {
  const { id } = useParams();
  const { api, token, user, navigate } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgForm, setMsgForm] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState("");
  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => { loadAnnonce(); }, [id]);

  const loadAnnonce = async () => {
    setLoading(true);
    const data = await api.get(`/annonces/${id}`);
    setAnnonce(data._id ? data : null);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!msgForm.trim()) return;
    if (!token) { navigate("/login"); return; }
    const res = await api.post("/messages", {
      destinataireId: annonce.proprietaire._id,
      contenu: msgForm,
      annonceId: id,
    }, token);
    if (res.data) { setMsgSent(true); setMsgForm(""); }
    else setMsgError(res.message || "Erreur");
  };

  const typeLabels = { appartement: "Appartement", chambre: "Chambre", studio: "Studio", maison: "Maison", autre: "Autre" };

  if (loading) return (
    <div className="page-loading" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTop: "3px solid var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!annonce) return (
    <div className="container empty-state" style={{ paddingTop: 80, textAlign: "center" }}>
      <div className="empty-icon" style={{ fontSize: 48, color: "var(--text4)" }}>🔍</div>
      <h3 style={{ fontWeight: 500, color: "var(--text)", marginTop: 16 }}>Annonce introuvable</h3>
      <button className="btn" onClick={() => navigate("/")} style={{ marginTop: 24, padding: "12px 24px", background: "var(--accent)", color: "var(--text)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
        Retour aux annonces
      </button>
    </div>
  );

  const photos = annonce.photos?.length ? annonce.photos : [null];

  return (
    <div className="annonce-detail-page">
      
      {/* ── Header Navigation ── */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 0 }}>
        <button onClick={() => navigate("/")} className="detail-header-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Retour à la liste
        </button>

        <div className="detail-title-row">
          <div>
            <h1 className="detail-title">{annonce.titre}</h1>
            <div className="detail-meta-list">
              <StatusBadge status={annonce.statut} />
              <span className="detail-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {annonce.ville}
              </span>
              <span className="detail-divider">|</span>
              <span className="detail-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                {typeLabels[annonce.typeLogement]}
              </span>
              {annonce.surface && (
                <>
                  <span className="detail-divider">|</span>
                  <span className="detail-meta-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    {annonce.surface} m²
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Galerie Photos ── */}
      <div className="container" style={{ marginBottom: 40 }}>
        <div className="gallery-grid" style={{ gridTemplateColumns: photos.length > 1 ? "3fr 1.8fr" : "1fr" }}>
          <div className="gallery-main-container">
            {photos[activePhoto]?.url ? (
              <img src={photos[activePhoto].url} alt="" className="gallery-main-img" />
            ) : (
              <div className="gallery-placeholder">🏠</div>
            )}
          </div>

          {photos.length > 1 && (
            <div className="gallery-thumbs-sidebar" style={{ gridTemplateRows: `repeat(${Math.min(photos.length - 1, 2)}, 1fr)` }}>
              {photos.slice(1, 3).map((p, i) => (
                <div key={i} onClick={() => setActivePhoto(i + 1)} className="gallery-thumb-item">
                  <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {i === 1 && photos.length > 3 && (
                    <div className="gallery-overlay-count">
                      +{photos.length - 3} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {photos.length > 3 && (
          <div className="thumbnail-strip">
            {photos.map((p, i) => (
              <div key={i} onClick={() => setActivePhoto(i)} className="strip-thumb-box" style={{ border: `2px solid ${activePhoto === i ? "var(--accent2)" : "transparent"}` }}>
                {p?.url && <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Contenu Principal ── */}
      <div className="container" style={{ paddingBottom: 100 }}>
        <div className="detail-main-layout">

          {/* Colonne gauche : Infos */}
          <div>
            <div className="host-section">
              <div className="host-flex">
                <div>
                  <h2 className="host-name-title">Logement proposé par {annonce.proprietaire?.nom}</h2>
                  <div className="host-availability">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    Disponible dès le {new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <div className="host-avatar">
                  {annonce.proprietaire?.photoUrl ? (
                    <img src={annonce.proprietaire.photoUrl} alt="" className="host-avatar-img" />
                  ) : (
                    annonce.proprietaire?.nom?.[0]?.toUpperCase()
                  )}
                </div>
              </div>
            </div>

            <div className="features-pills-row">
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>, label: typeLabels[annonce.typeLogement] },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>, label: `${annonce.surface} m²` },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path></svg>, label: annonce.ville },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="10" x2="21" y2="10"></line></svg>, label: new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR") },
              ].map((item, idx) => (
                <div key={idx} className="feature-pill">
                  <span className="feature-pill-icon">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            <div className="description-section">
              <h3 className="section-subtitle">À propos de ce logement</h3>
              <p className="description-text">{annonce.description}</p>
            </div>

            {annonce.commentaireAdmin && (
              <div className="admin-notice-box">
                <strong>Note de l'administrateur :</strong> {annonce.commentaireAdmin}
              </div>
            )}

            <div className="owner-info-card">
              <h3 className="section-subtitle" style={{ fontSize: 18, marginBottom: 16 }}>Informations de contact</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--bg2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 600, color: "var(--text)", overflow: "hidden" }}>
                  {annonce.proprietaire?.photoUrl ? (
                    <img src={annonce.proprietaire.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    annonce.proprietaire?.nom?.[0]?.toUpperCase()
                  )}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "var(--text)" }}>{annonce.proprietaire?.nom}</div>
                  <div style={{ fontSize: 13, color: "var(--text3)", marginTop: 2 }}>{annonce.proprietaire?.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Carte Sticky */}
          <div className="sticky-sidebar-card">
            <div className="booking-card">
              <div className="price-row">
                <span className="price-amount">{annonce.prix?.toLocaleString()} MAD</span>
                <span className="price-period">/ mois</span>
              </div>

              <div className="card-hr" />

              <div className="data-rows-container">
                {[
                  ["Type de bien", typeLabels[annonce.typeLogement]],
                  ["Superficie", `${annonce.surface} m²`],
                  ["Ville", annonce.ville],
                  ["Disponibilité", new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR")],
                ].map(([k, v]) => (
                  <div key={k} className="data-row">
                    <span className="data-row-key">{k}</span>
                    <span className="data-row-val">{v}</span>
                  </div>
                ))}
              </div>

              <div className="card-hr" />

              {/* Gestion des formulaires dynamiques selon authentification */}
              {user && user.id !== annonce.proprietaire?._id && annonce.statut === "active" ? (
                <div>
                  {msgSent ? (
                    <div className="alert-success-beige">
                      ✓ Demande envoyée ! Le propriétaire reviendra vers vous sous peu.
                    </div>
                  ) : (
                    <>
                      <p className="contact-label-row">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        Écrire au propriétaire
                      </p>
                      {msgError && <div style={{ padding: 12, background: "var(--danger-bg)", color: "var(--danger)", borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{msgError}</div>}
                      <textarea
                        className="form-textarea-beige"
                        placeholder="Bonjour, je suis très intéressé(e) par votre offre de colocation..."
                        value={msgForm}
                        onChange={e => setMsgForm(e.target.value)}
                      />
                      <button
                        className="btn-send-beige"
                        style={{
                          background: msgForm.trim() ? "var(--accent)" : "var(--bg3)",
                          color: msgForm.trim() ? "var(--text)" : "var(--text4)",
                          cursor: msgForm.trim() ? "pointer" : "not-allowed",
                        }}
                        onClick={sendMessage}
                        disabled={!msgForm.trim()}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        Envoyer ma demande
                      </button>
                    </>
                  )}
                </div>
              ) : !user ? (
                <button className="btn-connect-beige" onClick={() => navigate("/login")}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h4M10 17l5-5-5-5M13 12H3"/></svg>
                  Se connecter pour contacter
                </button>
              ) : user.id === annonce.proprietaire?._id ? (
                <div className="owner-warning-badge">
                  Vous visitez votre propre annonce
                </div>
              ) : null}

              <p style={{ fontSize: 12, color: "var(--text4)", textAlign: "center", marginTop: 16, letterSpacing: "0.2px" }}>
                Aucun frais de commission de service
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const vars = document.documentElement.style;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const map = {
    active: { bg: isDark ? "#0a2e1a" : "#EDF7ED", txt: isDark ? "#6fcf97" : "#1C733C", label: "Disponible" },
    en_attente: { bg: isDark ? "#2e2200" : "#FFF4E5", txt: isDark ? "#f0ad4e" : "#B76E00", label: "Vérification en cours" },
    rejetee: { bg: isDark ? "#2e0a0a" : "#FCEFEF", txt: isDark ? "#f87171" : "#A83232", label: "Refusée" },
    archivee: { bg: isDark ? "#1e293b" : "#F1EDE6", txt: isDark ? "#94a3b8" : "#7A746B", label: "Archivée" },
  };
  const current = map[status] || { bg: isDark ? "#1e293b" : "#F1EDE6", txt: isDark ? "#94a3b8" : "#7A746B", label: status };
  
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, background: current.bg, color: current.txt }}>
      {current.label}
    </span>
  );
}