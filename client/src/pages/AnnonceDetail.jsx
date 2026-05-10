import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function AnnonceDetail({ id }) {
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

  if (loading) return (
    <div className="page-loading" style={{ minHeight: "60vh" }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  if (!annonce) return (
    <div className="container empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🔍</div>
      <h3>Annonce introuvable</h3>
      <button className="btn btn-primary btn-pill" onClick={() => navigate("home")} style={{ marginTop: 24 }}>
        Retour aux annonces
      </button>
    </div>
  );

  const photos = annonce.photos?.length ? annonce.photos : [null];

  return (
    <div>
      {/* ── Back + Title ── */}
      <div className="container" style={{ paddingTop: 24, paddingBottom: 0 }}>
        <button
          onClick={() => navigate("home")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14,
            color: "#222", padding: "8px 0", marginBottom: 16,
            display: "flex", alignItems: "center", gap: 6,
            fontWeight: 500, textDecoration: "underline",
          }}
        >
          ← Retour
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <div>
            <h1 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 600, color: "#222", marginBottom: 8,
            }}>
              {annonce.titre}
            </h1>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <StatusBadge status={annonce.statut} />
              <span style={{ fontSize: 14, color: "#484848" }}>📍 {annonce.ville}</span>
              <span style={{ color: "#DDDDDD" }}>·</span>
              <span style={{ fontSize: 14, color: "#484848" }}>{typeLabels[annonce.typeLogement]}</span>
              {annonce.surface && (
                <>
                  <span style={{ color: "#DDDDDD" }}>·</span>
                  <span style={{ fontSize: 14, color: "#484848" }}>{annonce.surface} m²</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Photo Gallery ── */}
      <div className="container" style={{ marginBottom: 32 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: photos.length > 1 ? "3fr 2fr" : "1fr",
          gap: 8,
          height: 400,
          borderRadius: 16,
          overflow: "hidden",
        }}>
          {/* Main photo */}
          <div style={{ position: "relative", background: "#EBEBEB", overflow: "hidden" }}>
            {photos[activePhoto]?.url ? (
              <img src={photos[activePhoto].url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, opacity: 0.2 }}>🏠</div>
            )}
          </div>

          {/* Thumbnails */}
          {photos.length > 1 && (
            <div style={{ display: "grid", gridTemplateRows: `repeat(${Math.min(photos.length - 1, 2)}, 1fr)`, gap: 8, overflow: "hidden" }}>
              {photos.slice(1, 3).map((p, i) => (
                <div
                  key={i}
                  onClick={() => setActivePhoto(i + 1)}
                  style={{
                    background: "#EBEBEB", overflow: "hidden", cursor: "pointer",
                    position: "relative",
                  }}
                >
                  <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {i === 1 && photos.length > 3 && (
                    <div style={{
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.45)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: 18,
                    }}>
                      +{photos.length - 3} photos
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 3 && (
          <div style={{ display: "flex", gap: 8, marginTop: 8, overflowX: "auto" }}>
            {photos.map((p, i) => (
              <div
                key={i}
                onClick={() => setActivePhoto(i)}
                style={{
                  width: 72, height: 56, flexShrink: 0,
                  borderRadius: 8, overflow: "hidden", cursor: "pointer",
                  border: `2px solid ${activePhoto === i ? "#222" : "transparent"}`,
                  transition: "border-color 0.15s",
                }}
              >
                {p?.url && <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div className="container" style={{ paddingBottom: 80 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 64, alignItems: "start" }}>

          {/* Left */}
          <div>
            {/* Host */}
            <div style={{ paddingBottom: 24, borderBottom: "1px solid #DDDDDD", marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#222", marginBottom: 4 }}>
                    Logement proposé par {annonce.proprietaire?.nom}
                  </h3>
                  <div style={{ fontSize: 14, color: "#717171" }}>
                    Disponible le {new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <div style={{
                  width: 50, height: 50, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF385C, #E31C5F)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, fontWeight: 700, color: "#fff", flexShrink: 0,
                }}>
                  {annonce.proprietaire?.nom?.[0]?.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Key info pills */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #DDDDDD" }}>
              {[
                { icon: "🏠", label: typeLabels[annonce.typeLogement] },
                { icon: "📐", label: `${annonce.surface} m²` },
                { icon: "📍", label: annonce.ville },
                { icon: "📅", label: new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR") },
              ].map(item => (
                <div key={item.label} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "12px 18px", borderRadius: 12,
                  background: "#F7F7F7", border: "1px solid #EBEBEB",
                }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#222" }}>{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid #DDDDDD" }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#222", marginBottom: 14 }}>
                À propos de ce logement
              </h3>
              <p style={{ fontSize: 15, color: "#484848", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                {annonce.description}
              </p>
            </div>

            {/* Admin comment */}
            {annonce.commentaireAdmin && (
              <div className="alert alert-error" style={{ marginBottom: 24 }}>
                <strong>Commentaire de l'administrateur :</strong> {annonce.commentaireAdmin}
              </div>
            )}

            {/* Contact info */}
            <div style={{ background: "#F7F7F7", borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#222", marginBottom: 12 }}>
                Informations du propriétaire
              </h3>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF385C, #E31C5F)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, fontWeight: 700, color: "#fff",
                }}>
                  {annonce.proprietaire?.nom?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#222" }}>{annonce.proprietaire?.nom}</div>
                  <div style={{ fontSize: 13, color: "#717171" }}>{annonce.proprietaire?.email}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Booking card */}
          <div style={{ position: "sticky", top: 100 }}>
            <div style={{
              background: "#fff",
              border: "1px solid #DDDDDD",
              borderRadius: 16,
              padding: 28,
              boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
            }}>
              {/* Price */}
              <div style={{ marginBottom: 20 }}>
                <span style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: 26, fontWeight: 700, color: "#222",
                }}>
                  {annonce.prix?.toLocaleString()} MAD
                </span>
                <span style={{ fontSize: 16, color: "#717171", fontWeight: 400 }}> / mois</span>
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #DDDDDD", marginBottom: 20 }} />

              {/* Details */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {[
                  ["Type", typeLabels[annonce.typeLogement]],
                  ["Surface", `${annonce.surface} m²`],
                  ["Ville", annonce.ville],
                  ["Disponibilité", new Date(annonce.dateDisponibilite).toLocaleDateString("fr-FR")],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                    <span style={{ color: "#717171" }}>{k}</span>
                    <span style={{ fontWeight: 500, color: "#222" }}>{v}</span>
                  </div>
                ))}
              </div>

              <hr style={{ border: "none", borderTop: "1px solid #DDDDDD", marginBottom: 20 }} />

              {/* Contact form */}
              {user && user.id !== annonce.proprietaire?._id && annonce.statut === "active" ? (
                <div>
                  {msgSent ? (
                    <div className="alert alert-success" style={{ marginBottom: 0 }}>
                      ✓ Message envoyé ! Le propriétaire vous contactera bientôt.
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: 14, color: "#484848", marginBottom: 12, fontWeight: 500 }}>
                        Contactez le propriétaire
                      </p>
                      {msgError && <div className="alert alert-error">{msgError}</div>}
                      <textarea
                        className="form-input"
                        placeholder="Bonjour, je suis intéressé(e) par votre annonce..."
                        value={msgForm}
                        onChange={e => setMsgForm(e.target.value)}
                        style={{ marginBottom: 12, minHeight: 100, resize: "none" }}
                      />
                      <button
                        className="btn btn-primary w-full"
                        style={{
                          justifyContent: "center", borderRadius: 10,
                          padding: "14px", fontSize: 15,
                        }}
                        onClick={sendMessage}
                        disabled={!msgForm.trim()}
                      >
                        Envoyer un message
                      </button>
                    </>
                  )}
                </div>
              ) : !user ? (
                <button
                  className="btn btn-primary w-full"
                  style={{ justifyContent: "center", borderRadius: 10, padding: "14px", fontSize: 15 }}
                  onClick={() => navigate("login")}
                >
                  Se connecter pour contacter
                </button>
              ) : user.id === annonce.proprietaire?._id ? (
                <div style={{ fontSize: 14, color: "#717171", textAlign: "center", padding: "12px 0" }}>
                  Vous êtes le propriétaire de cette annonce
                </div>
              ) : null}

              <p style={{ fontSize: 12, color: "#B0B0B0", textAlign: "center", marginTop: 14 }}>
                Aucun frais ne sera débité
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 380px"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="gridTemplateColumns: 3fr 2fr"] {
            grid-template-columns: 1fr !important;
            height: 260px !important;
          }
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    active: ["badge-active", "Actif"],
    en_attente: ["badge-pending", "En attente"],
    rejetee: ["badge-rejected", "Rejeté"],
    archivee: ["badge-archived", "Archivé"],
  };
  const [cls, label] = map[status] || ["badge-archived", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}
