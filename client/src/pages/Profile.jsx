import { useState, useEffect } from "react";
import { useAuth } from "../App";
import "../styles/Profile.css";

const roleConfig = {
  etudiant: {
    icon: "🎓", label: "Étudiant",
    color: "#D4B996", bg: "rgba(15, 23, 42, 0.05)",
    fields: [
      { key: "universite",    label: "Université",            placeholder: "ENSA, ENSIAS...",        icon: "🏫" },
      { key: "niveauEtude",   label: "Niveau d'étude",        placeholder: "Licence, Master...",     icon: "📚" },
      { key: "villeRecherche",label: "Ville recherchée",      placeholder: "Casablanca...",          icon: "📍" },
      { key: "budgetMax",     label: "Budget max (MAD/mois)", placeholder: "3000", type: "number",   icon: "💰" },
    ],
  },
  proprietaire: {
    icon: "🏠", label: "Propriétaire",
    color: "#D4B996", bg: "rgba(15, 23, 42, 0.05)",
    fields: [
      { key: "telephone", label: "Téléphone", placeholder: "+212 6XX XXX XXX", icon: "📞" },
      { key: "adresse",   label: "Adresse",   placeholder: "123 Rue Mohammed V, Casablanca", icon: "🏠" },
    ],
  },
  admin: {
    icon: "🛡️", label: "Administrateur",
    color: "#D4B996", bg: "#0F172A",
    fields: [],
  },
};

export default function Profile() {
  const { api, token, user, navigate } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState({});   
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (token) loadProfile(); }, [token]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await api.get("/profile", token);
      setProfile(data);
      const profileData =
        data.role === "etudiant" ? (data.etudiantProfile || {}) :
        data.role === "proprietaire" ? (data.proprietaireProfile || {}) : {};
      setForm(profileData);
      setSaved(profileData);
    } catch (err) {
      console.error("Erreur chargement profil");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true); 
    setMsg("");
    try {
      const endpoints = {
        etudiant: "/profile/etudiant",
        proprietaire: "/profile/proprietaire",
        admin: "/profile/admin",
      };
      
      const data = await api.put(endpoints[user.role], form, token);
      
      if (data && (data._id || data.success)) {
        setSaved({ ...form });
        setMsg("success");
        setEditing(false);
        // On attend un peu pour laisser l'utilisateur voir le succès
        setTimeout(() => setMsg(""), 3000);
      } else {
        setMsg("error");
      }
    } catch (err) {
      setMsg("error");
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setForm({ ...saved });
    setEditing(false);
    setMsg("");
  };

  if (!user) return (
    <div className="empty-state-prestige">
      <div className="empty-icon-box">🔒</div>
      <h3>Accès restreint</h3>
      <p>Veuillez vous connecter pour gérer votre profil.</p>
      <button className="btn-prestige-gold" onClick={() => navigate("login")}>
        Se connecter
      </button>
    </div>
  );

  const config = roleConfig[user.role] || roleConfig.etudiant;

  return (
    <div className="profile-wrapper-prestige">
      <div className="container">
        
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : (
          <div className="profile-layout">
            
            {/* ── HEADER PROFIL ── */}
            <header className="profile-hero-card">
              <div className="profile-hero-content">
                <div className="avatar-huge">
                  {user.nom?.[0]?.toUpperCase()}
                  <div className="avatar-badge">{config.icon}</div>
                </div>
                <div className="profile-hero-text">
                  <h1 className="fraunces-title">{user.nom}</h1>
                  <p className="profile-email">{user.email}</p>
                  <span className="role-badge-prestige" style={{ background: config.bg, color: config.color }}>
                    {config.label}
                  </span>
                </div>
              </div>
            </header>

            <div className="profile-sections-grid">
              
              {/* ── SECTION INFORMATIONS ── */}
              {config.fields.length > 0 && (
                <section className="profile-section-card">
                  <div className="section-header-flex">
                    <h3 className="section-title-prestige">Informations Personnelles</h3>
                    {!editing && (
                      <button onClick={() => setEditing(true)} className="btn-edit-prestige">
                        <span>✏️</span> Modifier le profil
                      </button>
                    )}
                  </div>

                  {msg === "success" && <div className="alert-prestige success">✓ Vos modifications ont été enregistrées avec succès.</div>}
                  {msg === "error" && <div className="alert-prestige error">⚠️ Une erreur est survenue lors de l'enregistrement.</div>}

                  {!editing ? (
                    <div className="info-display-grid">
                      {config.fields.map((f) => (
                        <div key={f.key} className="info-item-prestige">
                          <label>{f.icon} {f.label}</label>
                          <div className={`info-value ${!saved[f.key] ? 'is-empty' : ''}`}>
                            {saved[f.key] 
                              ? (f.key === "budgetMax" ? `${Number(saved[f.key]).toLocaleString()} MAD / mois` : saved[f.key])
                              : "Non renseigné"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="form-edit-prestige">
                      <div className="form-grid-2">
                        {config.fields.map(f => (
                          <div key={f.key} className="form-group-prestige">
                            <label>{f.icon} {f.label}</label>
                            <input
                              type={f.type || "text"}
                              placeholder={f.placeholder}
                              value={form[f.key] || ""}
                              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="form-actions-prestige">
                        {/* BOUTON DE VALIDATION */}
                        <button className="btn-save-prestige" onClick={handleSave} disabled={saving}>
                          {saving ? "Enregistrement..." : "Confirmer les modifications"}
                        </button>
                        <button className="btn-cancel-prestige" onClick={handleCancel}>Annuler</button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* ── ACCÈS ADMIN (Si applicable) ── */}
              {user.role === "admin" && (
                <section className="profile-section-card admin-special">
                  <div className="admin-cta-flex">
                    <div className="admin-cta-text">
                      <h3 className="section-title-prestige white">Contrôle Administrateur</h3>
                      <p>Gérez les annonces en attente et les utilisateurs de la plateforme.</p>
                    </div>
                    <button className="btn-admin-go" onClick={() => navigate("admin")}>
                      Ouvrir le Panel 🛡️
                    </button>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}