import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import "../styles/AdminPanel.css";

export default function AdminPanel() {
  const { api, token, user, navigate } = useAuth();

  const [annonces, setAnnonces] = useState([]);
  const [stats, setStats] = useState({ enAttente: 0, active: 0, rejetee: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("en_attente");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectComment, setRejectComment] = useState("");

  const loadedRef = useRef(false);

  // Premier chargement
  useEffect(() => {
    if (loadedRef.current) return;
    if (user?.role !== "admin") { navigate("/"); return; }
    loadedRef.current = true;
    loadAdminData();
  }, []);

  // Rechargement quand on change d'onglet
  useEffect(() => {
    if (loadedRef.current) loadAdminData();
  }, [activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      // ── Un seul appel API → on filtre côté client ──
      const data = await api.get("/annonces/admin/toutes", token);
      const all = Array.isArray(data) ? data : [];

      setAnnonces(all.filter(a => a.statut === activeTab));
      setStats({
        enAttente: all.filter(a => a.statut === "en_attente").length,
        active:    all.filter(a => a.statut === "active").length,
        rejetee:   all.filter(a => a.statut === "rejetee").length,
      });

    } catch (err) {
      console.error("Erreur admin :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    try {
      const body = action === "rejeter" ? { commentaire: rejectComment } : {};
      await api.patch(`/annonces/${id}/${action}`, body, token);
      setRejectModal(null);
      setRejectComment("");
      loadAdminData();
    } catch (err) {
      console.error("Erreur action admin", err);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="admin-wrapper-prestige">
      <div className="container">

        {/* ── STATS ── */}
        <div className="admin-stats-row">
          <div className="stat-box-mini">
            <span className="stat-icon"></span>
            <div className="stat-info">
              <span className="stat-label">Validées</span>
              <span className="stat-value">{stats.active}</span>
            </div>
          </div>
          <div className="stat-box-mini gold">
            <span className="stat-icon"></span>
            <div className="stat-info">
              <span className="stat-label">En Attente</span>
              <span className="stat-value">{stats.enAttente}</span>
            </div>
          </div>
          <div className="stat-box-mini">
            <span className="stat-icon"></span>
            <div className="stat-info">
              <span className="stat-label">Rejetées</span>
              <span className="stat-value">{stats.rejetee}</span>
            </div>
          </div>
        </div>

        {/* ── TABS ── */}
        <div className="admin-tabs-nav">
          <button
            className={`admin-tab ${activeTab === "en_attente" ? "active" : ""}`}
            onClick={() => setActiveTab("en_attente")}
          >
             À Valider
            {stats.enAttente > 0 && (
              <span className="tab-badge">{stats.enAttente}</span>
            )}
          </button>
          <button
            className={`admin-tab ${activeTab === "active" ? "active" : ""}`}
            onClick={() => setActiveTab("active")}
          >
            Validées
          </button>
          <button
            className={`admin-tab ${activeTab === "rejetee" ? "active" : ""}`}
            onClick={() => setActiveTab("rejetee")}
          >
             Rejetées
          </button>
        </div>

        {/* ── LISTE ── */}
        <div className="admin-grid">
          {annonces.length === 0 ? (
            <div className="empty-state-card">
              Aucune annonce dans cette catégorie
            </div>
          ) : (
            annonces.map(a => (
              <div key={a._id} className="admin-card-row">

                {/* Image */}
                <div className="admin-card-img-wrap">
                  {a.photos?.[0]?.url ? (
                    <img src={a.photos[0].url} alt="" />
                  ) : (
                    <div className="placeholder"></div>
                  )}
                </div>

                {/* Corps */}
                <div className="admin-card-body">
                  <div className="admin-card-main">
                    <h3>{a.titre}</h3>
                    <p className="owner-text">
                      Propriétaire : <strong>{a.proprietaire?.nom}</strong>
                    </p>
                    <div className="admin-specs">
                      <span>📍 {a.ville}</span>
                      {" • "}
                      <span>💰 {a.prix?.toLocaleString()} MAD/mois</span>
                    </div>
                    {/* Raison du rejet */}
                    {a.commentaireAdmin && (
                      <div className="admin-reason">
                        💬 Raison : {a.commentaireAdmin}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="admin-btn-group">
                    {a.statut === "en_attente" && (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleAction(a._id, "valider")}
                        >
                          Approuver
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => { setRejectModal(a._id); setRejectComment(""); }}
                        >
                          Refuser
                        </button>
                      </>
                    )}
                    <button
                      className="btn-view-admin"
                      onClick={() => navigate(`/annonce/${a._id}`)}
                    >
                      Détails
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── MODAL REJET ── */}
      {rejectModal && (
        <div className="modal-overlay-prestige" onClick={() => setRejectModal(null)}>
          <div className="modal-card-prestige" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Motif du refus</h3>
            <textarea
              className="modal-textarea"
              placeholder="Expliquez pourquoi cette annonce est refusée..."
              value={rejectComment}
              onChange={e => setRejectComment(e.target.value)}
            />
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setRejectModal(null)}>
                Annuler
              </button>
              <button
                className="btn-confirm danger"
                disabled={!rejectComment.trim()}
                onClick={() => handleAction(rejectModal, "rejeter")}
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}