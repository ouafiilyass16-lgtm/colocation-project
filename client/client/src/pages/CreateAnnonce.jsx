import { useState } from "react";
import { useAuth } from "../App";

export default function CreateAnnonce() {
  const { api, token, navigate, user } = useAuth();
  const [form, setForm] = useState({
    titre: "", description: "", prix: "", ville: "",
    typeLogement: "appartement", surface: "", dateDisponibilite: "",
  });
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user || user.role !== "proprietaire") {
    return (
      <div className="page container empty-state">
        <div className="empty-icon">🔒</div>
        <h3>Accès réservé aux propriétaires</h3>
        <button className="btn btn-primary" onClick={() => navigate("login")} style={{ marginTop: 20 }}>
          Se connecter
        </button>
      </div>
    );
  }

  const removePhoto = (i) => setPhotos((p) => p.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    const required = ["titre", "description", "prix", "ville", "typeLogement", "surface", "dateDisponibilite"];
    for (const f of required) {
      if (!form[f]) { setError(`Le champ "${f}" est requis`); return; }
    }
    setLoading(true);
    setError("");
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

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 720 }}>
        <button className="btn btn-secondary btn-sm mb-6" onClick={() => navigate("mes-annonces")}>
          ← Retour
        </button>
        <h1 style={{ marginBottom: 8 }}>Publier une annonce</h1>
        <p style={{ color: "var(--text2)", marginBottom: 32 }}>
          Votre annonce sera examinée par un administrateur avant publication.
        </p>

        {error && <div className="alert alert-error mb-6">{error}</div>}

        <div className="card" style={{ padding: 32 }}>
          <div style={{ display: "grid", gap: 20 }}>

            <div className="form-group">
              <label className="form-label">Titre de l'annonce *</label>
              <input className="form-input" placeholder="Bel appartement au centre-ville..."
                value={form.titre} onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))} />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-input" placeholder="Décrivez votre logement, ses équipements..."
                value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Prix mensuel (MAD) *</label>
                <input className="form-input" type="number" placeholder="2500"
                  value={form.prix} onChange={(e) => setForm((p) => ({ ...p, prix: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Surface (m²) *</label>
                <input className="form-input" type="number" placeholder="45"
                  value={form.surface} onChange={(e) => setForm((p) => ({ ...p, surface: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Ville *</label>
                <input className="form-input" placeholder="Casablanca"
                  value={form.ville} onChange={(e) => setForm((p) => ({ ...p, ville: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Type de logement *</label>
                <select className="form-input" value={form.typeLogement}
                  onChange={(e) => setForm((p) => ({ ...p, typeLogement: e.target.value }))}>
                  <option value="appartement">Appartement</option>
                  <option value="studio">Studio</option>
                  <option value="chambre">Chambre</option>
                  <option value="maison">Maison</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Date de disponibilité *</label>
              <input className="form-input" type="date" value={form.dateDisponibilite}
                onChange={(e) => setForm((p) => ({ ...p, dateDisponibilite: e.target.value }))} />
            </div>

            {/* Photos */}
            <div>
              <label className="form-label" style={{ display: "block", marginBottom: 8 }}>
                Photos (max 5) — {photos.length}/5
              </label>

              <div
                onClick={() => photos.length < 5 && document.getElementById("photo-input").click()}
                style={{
                  border: `2px dashed ${photos.length >= 5 ? "var(--border)" : "var(--accent)"}`,
                  borderRadius: 10, padding: "28px 20px", textAlign: "center",
                  cursor: photos.length >= 5 ? "not-allowed" : "pointer",
                  background: "var(--bg3)", transition: "var(--transition)",
                  marginBottom: 12, opacity: photos.length >= 5 ? 0.5 : 1,
                }}
                onMouseOver={(e) => { if (photos.length < 5) e.currentTarget.style.background = "rgba(79,142,247,0.05)"; }}
                onMouseOut={(e) => { e.currentTarget.style.background = "var(--bg3)"; }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", marginBottom: 4 }}>
                  {photos.length >= 5 ? "Limite atteinte (5/5)" : "Cliquez pour choisir des photos"}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  JPG, PNG, WEBP — {5 - photos.length} emplacement(s) restant(s)
                </div>
              </div>

              <input
                id="photo-input"
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  const remaining = 5 - photos.length;
                  files.slice(0, remaining).forEach((file) => {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      setPhotos((prev) => [...prev, { url: ev.target.result, ordre: prev.length, file }]);
                    };
                    reader.readAsDataURL(file);
                  });
                  e.target.value = "";
                }}
              />

              {photos.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                  {photos.map((p, i) => (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={p.url} alt="" style={{
                        width: "100%", height: 90, objectFit: "cover",
                        borderRadius: 8, border: "1px solid var(--border)", display: "block",
                      }} />
                      <button type="button" onClick={() => removePhoto(i)} style={{
                        position: "absolute", top: 4, right: 4,
                        background: "rgba(248,113,113,0.85)", border: "none",
                        color: "white", borderRadius: "50%", width: 22, height: 22,
                        fontSize: 11, cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}
                style={{ minWidth: 180, justifyContent: "center" }}>
                {loading ? <><span className="spinner" /> Publication...</> : "📤 Publier l'annonce"}
              </button>
              <button className="btn btn-secondary" onClick={() => navigate("mes-annonces")}>
                Annuler
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}