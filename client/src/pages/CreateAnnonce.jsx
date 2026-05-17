import { useState } from "react";
import { useAuth } from "../App";
import "../styles/CreateAnnonce.css";

const STEPS = [
  { 
    id: 1, 
    label: "Informations", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
      </svg>
    ) 
  },
  { 
    id: 2, 
    label: "Détails", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    ) 
  },
  { 
    id: 3, 
    label: "Photos", 
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ) 
  },
];

const VILLES_LIST = ["Casablanca", "Rabat", "Marrakech", "Fès", "Agadir", "Tanger", "Meknès", "Oujda", "Tétouan", "Kénitra"];

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
    <div className="container empty-state-premium" style={{ textAlign: 'center', padding: "100px 20px" }}>
      <div className="empty-icon-box" style={{ margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h3>Accès Propriétaire Requis</h3>
      <button className="btn-send-premium" onClick={() => navigate("/login")} style={{ marginTop: "20px" }}>Se connecter</button>
    </div>
  );

  const removePhoto = (i) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== i));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 5 - photos.length;
    
    files.slice(0, remaining).forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        setError(`L'image ${file.name} est trop lourde (max 2 Mo)`);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = ev => setPhotos(prev => [...prev, { url: ev.target.result, ordre: prev.length, file }]);
      reader.readAsDataURL(file);
    });
  };

  const validateStep = () => {
    setError("");
    if (step === 1) {
      if (!form.titre || !form.description || !form.ville) {
        setError("Veuillez remplir tous les champs d'informations.");
        return false;
      }
    }
    if (step === 2) {
      if (!form.prix || !form.surface || !form.dateDisponibilite) {
        setError("Veuillez remplir les détails techniques.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep()) setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    setError("");
    
    try {
      const payload = { ...form, prix: Number(form.prix), surface: Number(form.surface) };
      const data = await api.post("/annonces", payload, token);
      
      if (data && data.annonce) {
        if (photos.length > 0) {
          const photosPayload = photos.map((p) => ({ url: p.url, ordre: p.ordre }));
          await api.post(`/annonces/${data.annonce._id}/photos`, { photos: photosPayload }, token);
        }
        navigate("/mes-annonces");
      } else {
        setError(data.message || "Erreur lors de la création");
      }
    } catch (err) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-annonce-wrapper">
      <div className="container" style={{ maxWidth: 800, paddingTop: 20 }}>

        <button onClick={() => navigate("/mes-annonces")} className="btn-back-premium">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Retour à mes annonces</span>
        </button>

        <div className="create-header" style={{ marginTop: 24, marginBottom: 32 }}>
          <h1 className="detail-main-title">Publier une annonce</h1>
          <p className="subtitle-prestige">Remplissez les détails pour proposer votre logement aux étudiants.</p>
        </div>

        {/* Stepper avec icônes vectorielles */}
        <div className="stepper-premium" style={{ marginBottom: 40 }}>
          {STEPS.map((s, i) => (
            <div key={s.id} className={`step-item ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
              <div className="step-circle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step > s.id ? "✓" : s.icon}
              </div>
              <span className="step-label">{s.label}</span>
              {i < STEPS.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        {error && <div className="alert-error-premium" style={{ marginBottom: 24 }}>{error}</div>}

        <div className="form-card-premium">
          {step === 1 && (
            <div className="step-content anim-fade-in">
              <h3 className="section-title-premium">Informations générales</h3>
              <div className="form-grid-prestige">
                <div className="input-group-prestige">
                  <label>Titre de l'annonce</label>
                  <input type="text" placeholder="Ex: Studio moderne à Agdal" 
                    value={form.titre} onChange={e => setForm(p => ({ ...p, titre: e.target.value }))} />
                </div>
                <div className="input-group-prestige">
                  <label>Description</label>
                  <textarea placeholder="Décrivez les atouts du logement..." 
                    value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="grid-2-prestige">
                  <div className="input-group-prestige">
                    <label>Ville *</label>
                    <input 
                      list="villes-list" 
                      placeholder="Saisissez ou choisissez une ville"
                      value={form.ville} 
                      onChange={e => setForm(p => ({ ...p, ville: e.target.value }))}
                    />
                    <datalist id="villes-list">
                      {VILLES_LIST.map(v => <option key={v} value={v} />)}
                    </datalist>
                  </div>
                  <div className="input-group-prestige">
                    <label>Type de logement</label>
                    <select value={form.typeLogement} onChange={e => setForm(p => ({ ...p, typeLogement: e.target.value }))}>
                      <option value="appartement">Appartement</option>
                      <option value="studio">Studio</option>
                      <option value="chambre">Chambre</option>
                      <option value="maison">Maison</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="step-content anim-fade-in">
              <h3 className="section-title-premium">Détails techniques</h3>
              <div className="form-grid-prestige">
                <div className="grid-2-prestige">
                  <div className="input-group-prestige">
                    <label>Prix mensuel (MAD)</label>
                    <input type="number" value={form.prix} onChange={e => setForm(p => ({ ...p, prix: e.target.value }))} />
                  </div>
                  <div className="input-group-prestige">
                    <label>Surface (m²)</label>
                    <input type="number" value={form.surface} onChange={e => setForm(p => ({ ...p, surface: e.target.value }))} />
                  </div>
                </div>
                <div className="input-group-prestige">
                  <label>Date de disponibilité</label>
                  <input type="date" value={form.dateDisponibilite} onChange={e => setForm(p => ({ ...p, dateDisponibilite: e.target.value }))} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="step-content anim-fade-in">
              <h3 className="section-title-premium">Photos</h3>
              <div className="upload-zone-premium" onClick={() => photos.length < 5 && document.getElementById("photo-input").click()} style={{ cursor: 'pointer' }}>
                <div className="upload-icon" style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <p>Cliquez pour ajouter des photos (Max 5)</p>
              </div>
              <input id="photo-input" type="file" hidden multiple onChange={handlePhotoChange} />
              <div className="photo-preview-grid" style={{ marginTop: 24 }}>
                {photos.map((p, i) => (
                  <div key={i} className="photo-thumb">
                    <img src={p.url} alt="" />
                    <button 
                      className="remove-btn-prestige" 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
                    >
                      ×
                    </button>
                    {i === 0 && <div className="main-badge">Principale</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="navigation-footer-prestige" style={{ marginTop: 32, display: 'flex', justifyContent: 'space-between' }}>
          <button className="btn-secondary-prestige" onClick={() => step > 1 ? setStep(s => s - 1) : navigate("/mes-annonces")}>
            {step === 1 ? "Annuler" : "← Précédent"}
          </button>
          
          {step < 3 ? (
            <button className="btn-send-premium" onClick={handleNext} style={{width: 'auto', padding: '14px 40px'}}>
              Suivant →
            </button>
          ) : (
            <button className="btn-send-premium" onClick={handleSubmit} disabled={loading} style={{width: 'auto', padding: '14px 40px'}}>
              {loading ? "Publication..." : " Publier l'annonce"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}