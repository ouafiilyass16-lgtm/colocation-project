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
      <div className="empty-icon-box">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
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
          <button className="btn-send-premium" onClick={() => navigate("/create-annonce")}>
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
            <div className="empty-icon-box">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <h3>Aucune annonce trouvée</h3>
            <p>Commencez par publier votre premier bien pour attirer des étudiants.</p>
            <button className="btn-send-premium" onClick={() => navigate("/create-annonce")}>
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
                    <div className="placeholder-thumb">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info Center */}
                <div className="card-info">
                  <div className="card-title-row">
                    <h3>{a.titre}</h3>
                    <StatusBadge status={a.statut} />
                  </div>
                  <div className="card-specs-row" style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {a.ville}
                    </span>
                    <span className="divider">·</span>
                    <span className="price-text" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                        <line x1="12" y1="1" x2="12" y2="23"></line>
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                      {a.prix?.toLocaleString()} MAD
                    </span>
                    <span className="divider">·</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                      </svg>
                      {a.surface} m²
                    </span>
                  </div>
                  {a.commentaireAdmin && (
                    <div className="admin-comment" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <span>Admin : {a.commentaireAdmin}</span>
                    </div>
                  )}
                </div>

                {/* Actions Right */}
                <div className="card-actions">
                  <button className="btn-action-view" onClick={() => navigate(`/annonce/${a._id}`)}>Voir</button>
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