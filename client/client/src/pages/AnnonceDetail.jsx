import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function AnnonceDetail({ id }) {
  const { api, token, user, navigate } = useAuth();
  const [annonce, setAnnonce] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msgForm, setMsgForm] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [msgError, setMsgError] = useState("");

  useEffect(() => { loadAnnonce(); }, [id]);

  const loadAnnonce = async () => {
    setLoading(true);
    const data = await api.get(`/annonces/${id}`);
    setAnnonce(data._id ? data : null);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!msgForm.trim()) return;
    if (!token) { navigate("login"); return; }
    const res = await api.post("/messages", {
      destinataireId: annonce.proprietaire._id,
      contenu: msgForm,
      annonceId: id,
    }, token);
    if (res.data) { setMsgSent(true); setMsgForm(""); }
    else setMsgError(res.message || "Erreur");
  };

  const typeLabels = { appartement: "Appartement", chambre: "Chambre", studio: "Studio", maison: "Maison", autre: "Autre" };

  if (loading) return <div className="page page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!annonce) return (
    <div className="page container empty-state">
      <div className="empty-icon">🔍</div>
      <h3>Annonce introuvable</h3>
      <button className="btn btn-primary" onClick={() => navigate("home")} style={{ marginTop: 20 }}>Retour aux annonces</button>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-secondary btn-sm mb-6" onClick={() => navigate("home")}>← Retour</button>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 28, alignItems: "start" }}>
          {/* Main */}
          <div>
            {/* Photos */}
            <div style={{
              height: 320, background: "var(--bg3)", borderRadius: "var(--radius)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 64, marginBottom: 24, overflow: "hidden",
              border: "1px solid var(--border)",
            }}>
              {annonce.photos?.[0]?.url
                ? <img src={annonce.photos[0].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ opacity: 0.3 }}>🏠</span>
              }
            </div>

            {/* Title */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "clamp(22px, 4vw, 30px)", flex: 1 }}>{annonce.titre}</h1>
                <StatusBadge status={annonce.statut} />
              </div>
              <div style={{ display: "flex", gap: 16, color: "var(--text2)", fontSize: 14, flexWrap: "wrap" }}>
                <span>📍 {annonce.ville}</span>
                <span>🏠 {typeLabels[annonce.typeLogement]}</span>
                <span>📐 {annonce.surface} m²</span>
                <span>📅 Dispo : {new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR")}</span>
              </div>
            </div>

            {/* Description */}
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, marginBottom: 12, color: "var(--text2)", textTransform: "uppercase", letterSpacing: "0.06em", fontSize: 12 }}>Description</h3>
              <p style={{ color: "var(--text)", lineHeight: 1.7, fontSize: 15, whiteSpace: "pre-wrap" }}>{annonce.description}</p>
            </div>

            {/* Admin comment */}
            {annonce.commentaireAdmin && (
              <div className="alert alert-error">
                <strong>Commentaire admin :</strong> {annonce.commentaireAdmin}
              </div>
            )}

            {/* Photos gallery */}
            {annonce.photos?.length > 1 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                {annonce.photos.map((p, i) => (
                  <img key={i} src={p.url} alt="" style={{ height: 80, width: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 84 }}>
            {/* Price */}
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--accent)" }}>
                {annonce.prix?.toLocaleString()}
              </div>
              <div style={{ color: "var(--text3)", fontSize: 13, marginBottom: 20 }}>MAD / mois</div>

              {user && user.id !== annonce.proprietaire?._id && annonce.statut === "active" && (
                <div>
                  {msgSent ? (
                    <div className="alert alert-success" style={{ marginBottom: 0 }}>✓ Message envoyé !</div>
                  ) : (
                    <>
                      {msgError && <div className="alert alert-error">{msgError}</div>}
                      <textarea className="form-input" placeholder="Votre message au propriétaire..."
                        value={msgForm} onChange={e => setMsgForm(e.target.value)}
                        style={{ marginBottom: 10, minHeight: 80 }} />
                      <button className="btn btn-primary w-full" style={{ justifyContent: "center" }}
                        onClick={sendMessage} disabled={!msgForm.trim()}>
                        💬 Envoyer un message
                      </button>
                    </>
                  )}
                </div>
              )}
              {!user && (
                <button className="btn btn-primary w-full" style={{ justifyContent: "center" }} onClick={() => navigate("login")}>
                  Se connecter pour contacter
                </button>
              )}
            </div>

            {/* Owner info */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text3)", marginBottom: 12 }}>Propriétaire</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--accent), var(--accent2))",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontWeight: 700, color: "white",
                }}>
                  {annonce.proprietaire?.nom?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{annonce.proprietaire?.nom}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)" }}>{annonce.proprietaire?.email}</div>
                </div>
              </div>
            </div>

            {/* Quick info */}
            <div className="card" style={{ padding: 20 }}>
              {[
                ["Type", typeLabels[annonce.typeLogement]],
                ["Surface", `${annonce.surface} m²`],
                ["Ville", annonce.ville],
                ["Disponible", new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR")],
              ].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span style={{ color: "var(--text3)" }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 360px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: ["badge-active", "● Actif"],
    en_attente: ["badge-pending", "⏳ En attente"],
    rejetee: ["badge-rejected", "✕ Rejeté"],
    archivee: ["badge-archived", "📦 Archivé"],
  };
  const [cls, label] = map[status] || ["badge-archived", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
