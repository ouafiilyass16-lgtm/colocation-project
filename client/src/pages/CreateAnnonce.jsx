import { useState } from "react";
import { useAuth } from "../App";

const STEPS = [
  { id: 1, label: "Informations", icon: "📝" },
  { id: 2, label: "Détails", icon: "📐" },
  { id: 3, label: "Photos", icon: "📷" },
];

export default function CreateAnnonce() {
  const { api, token, navigate, user } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    titre: "", description: "", prix: "", ville: "",
    typeLogement: "appartement", surface: "", dateDisponibilite: "",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.role !== "proprietaire") return (
    <div className="container empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🔒</div>
      <h3>Accès réservé aux propriétaires</h3>
      <button className="btn btn-primary btn-pill" onClick={() => navigate("login")} style={{ marginTop: 24 }}>Se connecter</button>
    </div>
  );

  const removePhoto = (i) => setPhotos(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    const required = ["titre", "description", "prix", "ville", "typeLogement", "surface", "dateDisponibilite"];
    for (const f of required) {
      if (!form[f]) { setError(`Le champ "${f}" est requis`); return; }
    }
    setLoading(true); setError("");
    const payload = { ...form, prix: Number(form.prix), surface: Number(form.surface) };
    const data = await api.post("/annonces", payload, token);
    if (data.annonce) {
      if (photos.length > 0) {
        const photosPayload = photos.map((p) => ({ url: p.url, ordre: p.ordre }));
        await api.post(`/annonces/${data.annonce._id}/photos`, { photos: photosPayload }, token);
      }
      navigate("mes-annonces");
    } else {
      setError(data.message || "Erreur lors de la création");
    }
    setLoading(false);
  };

  const VILLES = ["Casablanca", "Rabat", "Marrakech", "Fès", "Agadir", "Tanger", "Meknès", "Oujda", "Tétouan", "Kénitra"];

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Back */}
        <button
          onClick={() => navigate("mes-annonces")}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#222",
            padding: "8px 0", marginBottom: 24, textDecoration: "underline",
            display: "flex", alignItems: "center", gap: 6, fontWeight: 500,
          }}
        >
          ← Retour
        </button>

        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: 8 }}>Publier une annonce</h1>
          <p style={{ color: "#717171", fontSize: 15 }}>
            Votre annonce sera examinée par notre équipe avant publication.
          </p>
        </div>

        {/* Progress steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? 1 : "none" }}>
              <div
                onClick={() => s.id < step || (s.id === step + 1 && isStepComplete(step)) ? setStep(s.id) : null}
                style={{
                  display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                  padding: "8px 12px", borderRadius: 8,
                  background: step === s.id ? "#F7F7F7" : "transparent",
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: s.id < step ? "#222" : s.id === step ? "#FF385C" : "#EBEBEB",
                  color: s.id <= step ? "#fff" : "#B0B0B0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0,
                }}>
                  {s.id < step ? "✓" : s.id}
                </div>
                <span style={{ fontSize: 14, fontWeight: s.id === step ? 600 : 400, color: s.id === step ? "#222" : "#717171" }}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ flex: 1, height: 1, background: s.id < step ? "#222" : "#DDDDDD", margin: "0 8px" }} />
              )}
            </div>
          ))}
        </div>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        {/* Step 1 — Informations */}
        {step === 1 && (
          <div style={{ background: "#fff", border: "1px solid #DDDDDD", borderRadius: 16, padding: 32 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, marginBottom: 24, color: "#222" }}>
              Informations générales
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="form-group">
                <label className="form-label">Titre de l'annonce *</label>
                <input className="form-input" placeholder="Bel appartement au centre-ville..."
                  value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea className="form-input" placeholder="Décrivez votre logement, ses équipements, l'environnement..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  style={{ minHeight: 140 }} />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Ville *</label>
                  <select className="form-input" value={form.ville}
                    onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}>
                    <option value="">Choisir une ville</option>
                    {VILLES.map(v => <option key={v} value={v}>{v}</option>)}
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Type de logement *</label>
                  <select className="form-input" value={form.typeLogement}
                    onChange={e => setForm(p => ({ ...p, typeLogement: e.target.value }))}>
                    <option value="appartement">Appartement</option>
                    <option value="studio">Studio</option>
                    <option value="chambre">Chambre</option>
                    <option value="maison">Maison</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2 — Détails */}
        {step === 2 && (
          <div style={{ background: "#fff", border: "1px solid #DDDDDD", borderRadius: 16, padding: 32 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, marginBottom: 24, color: "#222" }}>
              Détails et tarification
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Prix mensuel (MAD) *</label>
                  <input className="form-input" type="number" placeholder="2500"
                    value={form.prix} onChange={e => setForm(p => ({ ...p, prix: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Surface (m²) *</label>
                  <input className="form-input" type="number" placeholder="45"
                    value={form.surface} onChange={e => setForm(p => ({ ...p, surface: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date de disponibilité *</label>
                <input className="form-input" type="date" value={form.dateDisponibilite}
                  onChange={e => setForm(p => ({ ...p, dateDisponibilite: e.target.value }))} />
              </div>

              {/* Price preview */}
              {form.prix && (
                <div style={{
                  background: "#F7F7F7", borderRadius: 12, padding: "16px 20px",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <span style={{ fontSize: 24 }}>💰</span>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#222", fontFamily: "'Fraunces', serif" }}>
                      {Number(form.prix).toLocaleString()} MAD
                    </div>
                    <div style={{ fontSize: 13, color: "#717171" }}>par mois</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3 — Photos */}
        {step === 3 && (
          <div style={{ background: "#fff", border: "1px solid #DDDDDD", borderRadius: 16, padding: 32 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, marginBottom: 8, color: "#222" }}>
              Photos du logement
            </h3>
            <p style={{ color: "#717171", fontSize: 14, marginBottom: 24 }}>
              Ajoutez jusqu'à 5 photos. Les annonces avec photos sont 10× plus consultées.
            </p>

            {/* Upload zone */}
            <div
              onClick={() => photos.length < 5 && document.getElementById("photo-input").click()}
              style={{
                border: `2px dashed ${photos.length >= 5 ? "#DDDDDD" : "#FF385C"}`,
                borderRadius: 16, padding: "36px 24px", textAlign: "center",
                cursor: photos.length >= 5 ? "not-allowed" : "pointer",
                background: photos.length >= 5 ? "#F7F7F7" : "rgba(255,56,92,0.02)",
                transition: "all 0.15s",
                marginBottom: 16,
                opacity: photos.length >= 5 ? 0.6 : 1,
              }}
              onMouseOver={e => { if (photos.length < 5) e.currentTarget.style.background = "rgba(255,56,92,0.04)"; }}
              onMouseOut={e => { e.currentTarget.style.background = photos.length >= 5 ? "#F7F7F7" : "rgba(255,56,92,0.02)"; }}
            >
              <div style={{ fontSize: 36, marginBottom: 10 }}>📷</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#222", marginBottom: 6 }}>
                {photos.length >= 5 ? "Limite atteinte (5/5)" : "Cliquez pour ajouter des photos"}
              </div>
              <div style={{ fontSize: 13, color: "#B0B0B0" }}>
                JPG, PNG, WEBP — {5 - photos.length} emplacement(s) restant(s)
              </div>
            </div>

            <input id="photo-input" type="file" accept="image/*" multiple style={{ display: "none" }}
              onChange={e => {
                const files = Array.from(e.target.files);
                const remaining = 5 - photos.length;
                files.slice(0, remaining).forEach(file => {
                  const reader = new FileReader();
                  reader.onload = ev => setPhotos(prev => [...prev, { url: ev.target.result, ordre: prev.length, file }]);
                  reader.readAsDataURL(file);
                });
                e.target.value = "";
              }}
            />

            {photos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10 }}>
                {photos.map((p, i) => (
                  <div key={i} style={{ position: "relative", borderRadius: 12, overflow: "hidden", aspectRatio: "4/3" }}>
                    <img src={p.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    {i === 0 && (
                      <div style={{
                        position: "absolute", bottom: 6, left: 6,
                        background: "rgba(0,0,0,0.65)", color: "#fff",
                        fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 100,
                      }}>
                        PRINCIPALE
                      </div>
                    )}
                    <button
                      onClick={() => removePhoto(i)}
                      style={{
                        position: "absolute", top: 6, right: 6,
                        background: "rgba(255,255,255,0.9)", border: "none",
                        borderRadius: "50%", width: 24, height: 24, fontSize: 11,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, color: "#222",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
          <button
            className="btn btn-secondary"
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate("mes-annonces")}
          >
            {step === 1 ? "Annuler" : "← Précédent"}
          </button>

          {step < 3 ? (
            <button
              className="btn btn-primary btn-pill"
              onClick={() => setStep(s => s + 1)}
              style={{ padding: "12px 28px" }}
            >
              Suivant →
            </button>
          ) : (
            <button
              className="btn btn-primary btn-pill"
              onClick={handleSubmit}
              disabled={loading}
              style={{ padding: "12px 32px", fontSize: 15 }}
            >
              {loading ? <><span className="spinner" /> Publication...</> : "📤 Publier l'annonce"}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  function isStepComplete(s) {
    if (s === 1) return form.titre && form.description && form.ville && form.typeLogement;
    if (s === 2) return form.prix && form.surface && form.dateDisponibilite;
    return true;
  }
}
