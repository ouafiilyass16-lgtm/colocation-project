import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function AdminPanel() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    if (user?.role !== "admin") { navigate("home"); return; }
    loadPending();
  }, []);

  const loadPending = async () => {
    setLoading(true);
    const data = await api.get("/annonces/admin/en-attente", token);
    setAnnonces(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const valider = async (id) => {
    await api.patch(`/annonces/${id}/valider`, {}, token);
    setAnnonces(prev => prev.filter(a => a._id !== id));
  };

  const rejeter = async () => {
    if (!rejectComment.trim()) return;
    await api.patch(`/annonces/${rejectModal}/rejeter`, { commentaire: rejectComment }, token);
    setAnnonces(prev => prev.filter(a => a._id !== rejectModal));
    setRejectModal(null); setRejectComment("");
  };

  if (!user || user.role !== "admin") return (
    <div className="container empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🔒</div>
      <h3>Accès administrateur requis</h3>
    </div>
  );

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 36, flexWrap: "wrap" }}>
          <div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: 100,
              background: "rgba(181,110,0,0.08)", border: "1px solid rgba(181,110,0,0.2)",
              fontSize: 11, color: "#B56E00", fontWeight: 700,
              marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              ⚙️ Administration
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: 6 }}>Modération des annonces</h1>
            <p style={{ color: "#717171", fontSize: 14 }}>
              {annonces.length} annonce{annonces.length > 1 ? "s" : ""} en attente de validation
            </p>
          </div>

          <div style={{
            background: "rgba(181,110,0,0.08)",
            border: "1px solid rgba(181,110,0,0.15)",
            borderRadius: 16, padding: "16px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#B56E00", fontFamily: "'Fraunces', serif" }}>
              {annonces.length}
            </div>
            <div style={{ fontSize: 12, color: "#717171", fontWeight: 500 }}>En attente</div>
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : annonces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>Tout est à jour !</h3>
            <p>Aucune annonce en attente de modération</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {annonces.map(a => (
              <div
                key={a._id}
                style={{
                  background: "#fff", border: "1px solid #DDDDDD",
                  borderRadius: 20, overflow: "hidden",
                  transition: "box-shadow 0.15s",
                }}
                onMouseOver={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
              >
                <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 0 }}>
                  {/* Photo */}
                  <div style={{
                    background: "#EBEBEB", minHeight: 160,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 48, opacity: 0.25, overflow: "hidden",
                  }}>
                    {a.photos?.[0]?.url ? (
                      <img src={a.photos[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 1 }} />
                    ) : "🏠"}
                  </div>

                  {/* Content */}
                  <div style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                          <span className="badge badge-pending">En attente</span>
                          <span style={{ fontSize: 12, color: "#B0B0B0" }}>
                            Soumis le {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                          </span>
                        </div>

                        <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#222", marginBottom: 10 }}>
                          {a.titre}
                        </h3>

                        <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#717171", marginBottom: 14, flexWrap: "wrap" }}>
                          <span>📍 {a.ville}</span>
                          <span>💰 {a.prix?.toLocaleString()} MAD/mois</span>
                          <span>📐 {a.surface} m²</span>
                          <span>🏠 {a.typeLogement}</span>
                        </div>

                        <div style={{
                          background: "#F7F7F7", borderRadius: 10, padding: "10px 14px",
                          fontSize: 13, color: "#484848", lineHeight: 1.6,
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                          marginBottom: 12,
                        }}>
                          {a.description}
                        </div>

                        <div style={{
                          display: "flex", gap: 16, fontSize: 13, color: "#717171",
                          padding: "8px 0", borderTop: "1px solid #F0F0F0",
                        }}>
                          <span>👤 {a.proprietaire?.nom}</span>
                          <span>📧 {a.proprietaire?.email}</span>
                          {a.photos?.length > 0 && <span>🖼️ {a.photos.length} photo(s)</span>}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 130, flexShrink: 0 }}>
                        <button
                          className="btn btn-success"
                          onClick={() => valider(a._id)}
                          style={{ justifyContent: "center" }}
                        >
                          ✓ Valider
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => { setRejectModal(a._id); setRejectComment(""); }}
                          style={{ justifyContent: "center" }}
                        >
                          ✕ Rejeter
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate("annonce-detail", a._id)}
                          style={{ justifyContent: "center" }}
                        >
                          Voir
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Fraunces', serif", marginBottom: 8 }}>Rejeter l'annonce</h3>
            <p style={{ color: "#717171", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
              Expliquez la raison du rejet. Ce message sera visible par le propriétaire.
            </p>
            <div className="form-group mb-4">
              <label className="form-label">Raison du rejet *</label>
              <textarea
                className="form-input"
                placeholder="Ex : Photos manquantes, description insuffisante..."
                value={rejectComment}
                onChange={e => setRejectComment(e.target.value)}
                style={{ minHeight: 100 }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={rejeter} disabled={!rejectComment.trim()}>
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: 200px 1fr"] { grid-template-columns: 1fr !important; }
          div[style*="background: #EBEBEB; minHeight: 160px"] { min-height: 120px !important; }
        }
      `}</style>
    </div>
  );
}
