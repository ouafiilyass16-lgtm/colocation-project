import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import "../styles/Profile.css";

const roleConfig = {
  etudiant: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
      </svg>
    ), 
    label: "Étudiant",
    color: "#D4B996", 
    bg: "rgba(15, 23, 42, 0.05)",
    fields: [
      { 
        key: "universite", label: "Université", placeholder: "ENSA, ENSIAS...", 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
          </svg>
        ) 
      },
      { 
        key: "niveauEtude", label: "Niveau d'étude", placeholder: "Licence, Master...", 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        ) 
      },
      { 
        key: "villeRecherche", label: "Ville recherchée", placeholder: "Casablanca...", 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        ) 
      },
      { 
        key: "budgetMax", label: "Budget max (MAD/mois)", placeholder: "3000", type: "number", 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        ) 
      },
    ],
  },
  proprietaire: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ), 
    label: "Propriétaire",
    color: "#D4B996", 
    bg: "rgba(15, 23, 42, 0.05)",
    fields: [
      { 
        key: "telephone", label: "Téléphone", placeholder: "+212 6XX XXX XXX", 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
          </svg>
        ) 
      },
      { 
        key: "adresse", label: "Adresse", placeholder: "123 Rue Mohammed V, Casablanca", 
        icon: (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        ) 
      },
    ],
  },
  admin: {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    label: "Administrateur",
    color: "#D4B996",
    bg: "#0F172A",
    fields: [],
  },
};

export default function Profile() {
  const { api, token, user, navigate, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [saved, setSaved] = useState({});   
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhotoClick = () => fileInputRef.current?.click();

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) { alert("L'image ne doit pas dépasser 5 Mo"); return; }

    setPhotoUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const res = await api.put("/profile/photo", { photoUrl: ev.target.result }, token);
        if (res.photoUrl) {
          await loadProfile();
          const updated = { ...user, photoUrl: res.photoUrl };
          setUser(updated);
          localStorage.setItem("user", JSON.stringify(updated));
        }
      } catch (err) {
        console.error("Erreur upload photo", err);
      }
      setPhotoUploading(false);
    };
    reader.onerror = () => { setPhotoUploading(false); alert("Erreur lors de la lecture du fichier"); };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePhotoDelete = async () => {
    if (!confirm("Supprimer votre photo de profil ?")) return;
    setPhotoUploading(true);
    try {
      const res = await api.delete("/profile/photo", token);
      if (res.photoUrl === "") {
        await loadProfile();
        const updated = { ...user, photoUrl: "" };
        setUser(updated);
        localStorage.setItem("user", JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Erreur suppression photo", err);
    }
    setPhotoUploading(false);
  };

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
    <div className="empty-state-prestige" style={{ padding: "100px 20px", textAlign: 'center' }}>
      <div className="empty-icon-box" style={{ margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h3>Accès restreint</h3>
      <p>Veuillez vous connecter pour gérer votre profil.</p>
      <button className="btn-prestige-gold" onClick={() => navigate("/login")} style={{ marginTop: "20px" }}>
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
                <div className="avatar-huge" onClick={handlePhotoClick} style={{ cursor: "pointer" }}>
                  {profile?.photoUrl ? (
                    <img src={profile.photoUrl} alt="" className="avatar-img" />
                  ) : (
                    user.nom?.[0]?.toUpperCase()
                  )}
                  <div className="avatar-badge" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {config.icon}
                  </div>
                  <div className="avatar-upload-overlay">
                    {photoUploading ? (
                      <span className="avatar-upload-spinner" />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                        <circle cx="12" cy="13" r="4"/>
                      </svg>
                    )}
                  </div>
                  {profile?.photoUrl && (
                    <div className="avatar-delete-btn" onClick={(e) => { e.stopPropagation(); handlePhotoDelete(); }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </div>
                  )}
                  <input type="file" ref={fileInputRef} accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
                </div>
                <div className="profile-hero-text">
                  <h1 className="fraunces-title">{user.nom}</h1>
                  <p className="profile-email">{user.email}</p>
                  <span className="role-badge-prestige" style={{ background: config.bg, color: config.color, display: "inline-flex", alignItems: "center", gap: "6px" }}>
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
                      <button onClick={() => setEditing(true)} className="btn-edit-prestige" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
                        </svg>
                        Modifier le profil
                      </button>
                    )}
                  </div>

                  {msg === "success" && <div className="alert-prestige success">✓ Vos modifications ont été enregistrées avec succès.</div>}
                  {msg === "error" && <div className="alert-prestige error">⚠️ Une erreur est survenue lors de l'enregistrement.</div>}

                  {!editing ? (
                    <div className="info-display-grid">
                      {config.fields.map((f) => (
                        <div key={f.key} className="info-item-prestige">
                          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            {f.icon} {f.label}
                          </label>
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
                            <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              {f.icon} {f.label}
                            </label>
                            <input
                              type={f.type || "text"}
                              placeholder={f.placeholder}
                              value={form[f.key] || ""}
                              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="form-actions-prestige" style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
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

              {/* ── ACCÈS ADMIN ── */}
              {user.role === "admin" && (
                <section className="profile-section-card admin-special">
                  <div className="admin-cta-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div className="admin-cta-text">
                      <h3 className="section-title-prestige white">Contrôle Administrateur</h3>
                      <p>Gérez les annonces en attente et les utilisateurs de la plateforme.</p>
                    </div>
                    <button className="btn-admin-go" onClick={() => navigate("/admin")} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>Ouvrir le Panel</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
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