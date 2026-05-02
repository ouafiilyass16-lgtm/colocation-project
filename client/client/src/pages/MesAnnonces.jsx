import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function MesAnnonces() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => { if (token) loadAnnonces(); }, [token]);

  const loadAnnonces = async () => {
    setLoading(true);
    const data = await api.get("/annonces/mes/annonces", token);
    setAnnonces(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const archiver = async (id) => {
    await api.patch(`/annonces/${id}/archiver`, {}, token);
    loadAnnonces();
    setConfirm(null);
  };

  const supprimer = async (id) => {
    await api.delete(`/annonces/${id}`, token);
    loadAnnonces();
    setConfirm(null);
  };

  const statusBadge = (s) => {
    const map = {
      active: "badge-active", en_attente: "badge-pending",
      rejetee: "badge-rejected", archivee: "badge-archived",
    };
    const labels = { active: "Actif", en_attente: "En attente", rejetee: "Rejeté", archivee: "Archivé" };
    return <span className={`badge ${map[s]}`}>{labels[s]}</span>;
  };

  if (!user || user.role !== "proprietaire") return (
    <div className="page container empty-state">
      <div className="empty-icon">🔒</div>
      <h3>Accès réservé aux propriétaires</h3>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-8">
          <div>
            <h1 style={{ marginBottom: 4 }}>Mes annonces</h1>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>{annonces.length} annonce(s)</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate("create-annonce")}>+ Nouvelle annonce</button>
        </div>

        {/* Stats row */}
        <div className="grid-4 mb-8">
          {[
            ["active", "🟢 Actives"],
            ["en_attente", "⏳ En attente"],
            ["rejetee", "❌ Rejetées"],
            ["archivee", "📦 Archivées"],
          ].map(([s, label]) => (
            <div key={s} className="card" style={{ padding: "16px 20px", textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "var(--font-display)" }}>
                {annonces.filter(a => a.statut === s).length}
              </div>
              <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : annonces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>Aucune annonce pour le moment</h3>
            <p style={{ marginBottom: 20 }}>Créez votre première annonce</p>
            <button className="btn btn-primary" onClick={() => navigate("create-annonce")}>+ Créer une annonce</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {annonces.map((a) => (
              <div key={a._id} className="card" style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "1fr auto", gap: 16, alignItems: "center" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700 }}>{a.titre}</h3>
                    {statusBadge(a.statut)}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text2)", display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span>📍 {a.ville}</span>
                    <span>💰 {a.prix?.toLocaleString()} MAD/mois</span>
                    <span>📐 {a.surface} m²</span>
                    <span>📅 {new Date(a.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  {a.commentaireAdmin && (
                    <div style={{ marginTop: 8, padding: "6px 12px", background: "rgba(248,113,113,0.1)", borderRadius: 6, fontSize: 12, color: "var(--danger)" }}>
                      💬 Admin : {a.commentaireAdmin}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => navigate("annonce-detail", a._id)}>👁️ Voir</button>
                  {a.statut !== "archivee" && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setConfirm({ type: "archive", id: a._id, titre: a.titre })}>📦 Archiver</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => setConfirm({ type: "delete", id: a._id, titre: a.titre })}>🗑️ Supprimer</button>
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
            <h3 style={{ marginBottom: 12 }}>
              {confirm.type === "delete" ? "Supprimer l'annonce" : "Archiver l'annonce"}
            </h3>
            <p style={{ color: "var(--text2)", marginBottom: 24, fontSize: 14 }}>
              {confirm.type === "delete"
                ? `Êtes-vous sûr de vouloir supprimer "${confirm.titre}" ? Cette action est irréversible.`
                : `Archiver "${confirm.titre}" ? L'annonce ne sera plus visible.`}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Annuler</button>
              <button
                className={`btn ${confirm.type === "delete" ? "btn-danger" : "btn-secondary"}`}
                onClick={() => confirm.type === "delete" ? supprimer(confirm.id) : archiver(confirm.id)}>
                {confirm.type === "delete" ? "🗑️ Supprimer" : "📦 Archiver"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
