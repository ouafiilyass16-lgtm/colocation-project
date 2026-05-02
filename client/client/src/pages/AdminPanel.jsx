import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function AdminPanel() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectComment, setRejectComment] = useState("");
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, rejected: 0 });

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
    setRejectModal(null);
    setRejectComment("");
  };

  if (!user || user.role !== "admin") return (
    <div className="page container empty-state">
      <div className="empty-icon">🔒</div>
      <h3>Accès administrateur requis</h3>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{
            display: "inline-block", padding: "4px 14px", borderRadius: 100,
            background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)",
            fontSize: 11, color: "var(--warning)", fontWeight: 600, letterSpacing: "0.08em",
            marginBottom: 12, textTransform: "uppercase",
          }}>
            ⚙️ Panneau d'administration
          </div>
          <h1 style={{ marginBottom: 4 }}>Modération des annonces</h1>
          <p style={{ color: "var(--text2)", fontSize: 14 }}>
            {annonces.length} annonce(s) en attente de validation
          </p>
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
            {annonces.map((a) => (
              <div key={a._id} className="card" style={{ padding: 24 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 20, alignItems: "start" }}>
                  <div>
                    {/* Meta */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                      <span className="badge badge-pending">⏳ En attente</span>
                      <span style={{ fontSize: 12, color: "var(--text3)" }}>
                        Soumis le {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{a.titre}</h3>

                    {/* Details grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8, marginBottom: 14 }}>
                      {[
                        ["📍 Ville", a.ville],
                        ["💰 Prix", `${a.prix?.toLocaleString()} MAD/mois`],
                        ["📐 Surface", `${a.surface} m²`],
                        ["🏠 Type", a.typeLogement],
                        ["👤 Propriétaire", a.proprietaire?.nom],
                        ["📧 Email", a.proprietaire?.email],
                      ].map(([k, v]) => (
                        <div key={k} style={{
                          background: "var(--bg3)", borderRadius: 8,
                          padding: "8px 12px", fontSize: 13,
                        }}>
                          <div style={{ color: "var(--text3)", fontSize: 11, marginBottom: 2 }}>{k}</div>
                          <div style={{ fontWeight: 500, color: "var(--text)" }}>{v}</div>
                        </div>
                      ))}
                    </div>

                    {/* Description */}
                    <div style={{
                      background: "var(--bg3)", borderRadius: 8, padding: "12px 16px",
                      fontSize: 13, color: "var(--text2)", lineHeight: 1.6,
                      display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {a.description}
                    </div>

                    {/* Photos count */}
                    {a.photos?.length > 0 && (
                      <div style={{ marginTop: 10, fontSize: 12, color: "var(--text3)" }}>
                        🖼️ {a.photos.length} photo(s)
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 140 }}>
                    <button className="btn btn-success" onClick={() => valider(a._id)} style={{ justifyContent: "center" }}>
                      ✓ Valider
                    </button>
                    <button className="btn btn-danger" onClick={() => { setRejectModal(a._id); setRejectComment(""); }}
                      style={{ justifyContent: "center" }}>
                      ✕ Rejeter
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate("annonce-detail", a._id)}
                      style={{ justifyContent: "center" }}>
                      👁️ Détails
                    </button>
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
            <h3 style={{ marginBottom: 8 }}>Rejeter l'annonce</h3>
            <p style={{ color: "var(--text2)", fontSize: 14, marginBottom: 20 }}>
              Veuillez expliquer la raison du rejet. Ce commentaire sera visible par le propriétaire.
            </p>
            <div className="form-group mb-4">
              <label className="form-label">Raison du rejet *</label>
              <textarea className="form-input" placeholder="Ex: Photos manquantes, description insuffisante, prix non conforme..."
                value={rejectComment} onChange={e => setRejectComment(e.target.value)} />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setRejectModal(null)}>Annuler</button>
              <button className="btn btn-danger" onClick={rejeter} disabled={!rejectComment.trim()}>
                ✕ Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
