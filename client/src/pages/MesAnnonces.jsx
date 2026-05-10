import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function MesAnnonces() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => { if (token) loadAnnonces(); }, [token]);

  const loadAnnonces = async () => {
    setLoading(true);
    const data = await api.get("/annonces/mes/annonces", token);
    setAnnonces(Array.isArray(data) ? data : []);
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

  const statusBadge = (s) => {
    const map = { active: "badge-active", en_attente: "badge-pending", rejetee: "badge-rejected", archivee: "badge-archived" };
    const labels = { active: "Actif", en_attente: "En attente", rejetee: "Rejeté", archivee: "Archivé" };
    return <span className={`badge ${map[s]}`}>{labels[s]}</span>;
  };

  if (!user || user.role !== "proprietaire") return (
    <div className="container empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🔒</div>
      <h3>Accès réservé aux propriétaires</h3>
    </div>
  );

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: 6 }}>Mes annonces</h1>
            <p style={{ color: "#717171", fontSize: 14 }}>{annonces.length} annonce{annonces.length > 1 ? "s" : ""} au total</p>
          </div>
          <button
            className="btn btn-primary btn-pill"
            onClick={() => navigate("create-annonce")}
            style={{ fontSize: 14 }}
          >
            + Nouvelle annonce
          </button>
        </div>

        {/* Stats cards */}
        <div className="grid-4" style={{ marginBottom: 32 }}>
          {[
            { key: "active", label: "Actives", color: "#008A05", bg: "rgba(0,138,5,0.08)" },
            { key: "en_attente", label: "En attente", color: "#B56E00", bg: "rgba(181,110,0,0.08)" },
            { key: "rejetee", label: "Rejetées", color: "#C13515", bg: "rgba(193,53,21,0.08)" },
            { key: "archivee", label: "Archivées", color: "#717171", bg: "#F7F7F7" },
          ].map(s => (
            <div key={s.key} style={{
              background: s.bg, borderRadius: 16, padding: "20px 24px",
              border: `1px solid ${s.bg}`, cursor: "pointer",
              transition: "all 0.15s",
            }}
              onClick={() => setActiveTab(s.key)}
            >
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, fontFamily: "'Fraunces', serif" }}>
                {annonces.filter(a => a.statut === s.key).length}
              </div>
              <div style={{ fontSize: 13, color: "#717171", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {TABS.map(t => (
            <button
              key={t.key}
              className={`tab ${activeTab === t.key ? "active" : ""}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
              <span style={{
                marginLeft: 6, fontSize: 11, fontWeight: 700,
                background: activeTab === t.key ? "#222" : "#EBEBEB",
                color: activeTab === t.key ? "#fff" : "#717171",
                borderRadius: 100, padding: "1px 7px",
              }}>
                {t.key === "all" ? annonces.length : annonces.filter(a => a.statut === t.key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucune annonce ici</h3>
            <p>Créez votre première annonce pour commencer</p>
            <button className="btn btn-primary btn-pill" onClick={() => navigate("create-annonce")} style={{ marginTop: 20 }}>
              + Créer une annonce
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(a => (
              <div
                key={a._id}
                style={{
                  background: "#fff",
                  border: "1px solid #DDDDDD",
                  borderRadius: 16, padding: "20px 24px",
                  display: "grid", gridTemplateColumns: "80px 1fr auto",
                  gap: 20, alignItems: "center",
                  transition: "box-shadow 0.15s",
                }}
                onMouseOver={e => e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
                onMouseOut={e => e.currentTarget.style.boxShadow = "none"}
              >
                {/* Thumbnail */}
                <div style={{
                  width: 80, height: 64, borderRadius: 10, overflow: "hidden",
                  background: "#EBEBEB", flexShrink: 0,
                }}>
                  {a.photos?.[0]?.url ? (
                    <img src={a.photos[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, opacity: 0.25 }}>🏠</div>
                  )}
                </div>

                {/* Info */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "#222", margin: 0 }}>{a.titre}</h3>
                    {statusBadge(a.statut)}
                  </div>
                  <div style={{ fontSize: 13, color: "#717171", display: "flex", gap: 14, flexWrap: "wrap" }}>
                    <span>📍 {a.ville}</span>
                    <span>💰 {a.prix?.toLocaleString()} MAD/mois</span>
                    <span>📐 {a.surface} m²</span>
                    <span>Publié le {new Date(a.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  {a.commentaireAdmin && (
                    <div style={{
                      marginTop: 8, padding: "6px 12px",
                      background: "rgba(193,53,21,0.06)",
                      borderRadius: 8, fontSize: 12, color: "#C13515",
                      border: "1px solid rgba(193,53,21,0.15)",
                    }}>
                      💬 Admin : {a.commentaireAdmin}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate("annonce-detail", a._id)}>
                    Voir
                  </button>
                  {a.statut !== "archivee" && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setConfirm({ type: "archive", id: a._id, titre: a.titre })}>
                      Archiver
                    </button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ type: "delete", id: a._id, titre: a.titre })}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div className="modal-overlay" onClick={() => setConfirm(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 8, fontFamily: "'Fraunces', serif" }}>
              {confirm.type === "delete" ? "Supprimer l'annonce" : "Archiver l'annonce"}
            </h3>
            <p style={{ color: "#717171", marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
              {confirm.type === "delete"
                ? `Voulez-vous vraiment supprimer "${confirm.titre}" ? Cette action est irréversible.`
                : `Voulez-vous archiver "${confirm.titre}" ? Elle ne sera plus visible par les étudiants.`}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Annuler</button>
              <button
                className={`btn ${confirm.type === "delete" ? "btn-danger" : "btn-secondary"}`}
                onClick={() => confirm.type === "delete" ? supprimer(confirm.id) : archiver(confirm.id)}
              >
                {confirm.type === "delete" ? "Supprimer" : "Archiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
