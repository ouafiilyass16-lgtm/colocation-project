import { useState, useEffect } from "react";
import { useAuth } from "../App";
import "../styles/MesAnnonces.css";

export default function MesAnnonces() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => { if (token) loadAnnonces(); }, [token]);

  const loadAnnonces = async () => {
    setLoading(true);
    try {
      const data = await api.get("/annonces/mes/annonces", token);
      setAnnonces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erreur chargement annonces");
    }
    setLoading(false);
  };

  const archiver = async (id) => {
    await api.patch(`/annonces/${id}/archiver`, {}, token);
    loadAnnonces(); setConfirm(null);
  };

  const supprimer = async (id) => {
    await api.delete(`/annonces/${id}`, token);
    loadAnnonces(); setConfirm(null);
  };

  const TABS = [
    { key: "all", label: "Toutes" },
    { key: "active", label: "Actives" },
    { key: "en_attente", label: "En attente" },
    { key: "rejetee", label: "Rejetées" },
    { key: "archivee", label: "Archivées" },
  ];

  const filtered = activeTab === "all" ? annonces : annonces.filter(a => a.statut === activeTab);

  if (!user || user.role !== "proprietaire") return (
    <div className="container empty-state-premium">
      <div className="empty-icon-box">🔒</div>
      <h3>Accès réservé aux propriétaires</h3>
    </div>
  );

  return (
    <div className="mes-annonces-wrapper">
      <div className="container">

        {/* Header Prestige */}
        <div className="page-header-prestige">
          <div>
            <h1 className="detail-main-title">Tableau de Bord</h1>
            <p className="subtitle-prestige">{annonces.length} annonce{annonces.length > 1 ? "s" : ""} publiée{annonces.length > 1 ? "s" : ""}</p>
          </div>
          <button className="btn-send-premium" onClick={() => navigate("create-annonce")}>
            + Nouvelle annonce
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-grid-prestige">
          {[
            { key: "active", label: "Actives", color: "#10B981" },
            { key: "en_attente", label: "En attente", color: "#F59E0B" },
            { key: "rejetee", label: "Rejetées", color: "#EF4444" },
            { key: "archivee", label: "Archivées", color: "#64748B" },
          ].map(s => (
            <div key={s.key} className={`stat-card ${activeTab === s.key ? 'active' : ''}`} onClick={() => setActiveTab(s.key)}>
              <div className="stat-number" style={{ color: s.color }}>
                {annonces.filter(a => a.statut === s.key).length}
              </div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs Modern */}
        <div className="tabs-container-prestige">
          {TABS.map(t => (
            <button key={t.key} className={`tab-item ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
              <span className="tab-count">
                {t.key === "all" ? annonces.length : annonces.filter(a => a.statut === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-icon-box">📋</div>
            <h3>Aucune annonce trouvée</h3>
            <p>Commencez par publier votre premier bien pour attirer des étudiants.</p>
            <button className="btn-send-premium" onClick={() => navigate("create-annonce")}>
              Créer une annonce
            </button>
          </div>
        ) : (
          <div className="management-list">
            {filtered.map(a => (
              <div key={a._id} className="management-card">
                {/* Thumbnail */}
                <div className="card-thumb">
                  {a.photos?.[0]?.url ? (
                    <img src={a.photos[0].url} alt="" />
                  ) : (
                    <div className="placeholder-thumb">🏠</div>
                  )}
                </div>

                {/* Info Center */}
                <div className="card-info">
                  <div className="card-title-row">
                    <h3>{a.titre}</h3>
                    <StatusBadge status={a.statut} />
                  </div>
                  <div className="card-specs-row">
                    <span>📍 {a.ville}</span>
                    <span className="divider">·</span>
                    <span className="price-text">{a.prix?.toLocaleString()} MAD</span>
                    <span className="divider">·</span>
                    <span>📐 {a.surface} m²</span>
                  </div>
                  {a.commentaireAdmin && (
                    <div className="admin-comment">
                      <span className="icon">💬</span> Admin : {a.commentaireAdmin}
                    </div>
                  )}
                </div>

                {/* Actions Right */}
                <div className="card-actions">
                  <button className="btn-action-view" onClick={() => navigate("annonce-detail", a._id)}>Voir</button>
                  {a.statut !== "archivee" && (
                    <button className="btn-action-archive" onClick={() => setConfirm({ type: "archive", id: a._id, titre: a.titre })}>Archiver</button>
                  )}
                  <button className="btn-action-delete" onClick={() => setConfirm({ type: "delete", id: a._id, titre: a.titre })}>Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Overlay */}
      {confirm && (
        <div className="modal-overlay-prestige" onClick={() => setConfirm(null)}>
          <div className="modal-card-prestige" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">{confirm.type === "delete" ? "Supprimer l'annonce" : "Archiver l'annonce"}</h3>
            <p>Voulez-vous vraiment {confirm.type === "delete" ? "supprimer" : "archiver"} <strong>"{confirm.titre}"</strong> ?</p>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setConfirm(null)}>Annuler</button>
              <button className={`btn-confirm ${confirm.type === 'delete' ? 'danger' : 'gold'}`}
                onClick={() => confirm.type === "delete" ? supprimer(confirm.id) : archiver(confirm.id)}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
    const map = { active: "#10B981", en_attente: "#F59E0B", rejetee: "#EF4444", archivee: "#64748B" };
    const labels = { active: "Actif", en_attente: "En attente", rejetee: "Rejeté", archivee: "Archivé" };
    const color = map[status] || "#64748B";
    return <span className="status-badge-premium" style={{ color: color, background: `${color}15` }}>● {labels[status]}</span>;
}