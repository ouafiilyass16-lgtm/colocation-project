import { useState, useEffect } from "react";
import { useAuth } from "../App";

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
    const data = await api.get("/profile", token);
    setProfile(data);
    const profileData =
      data.role === "etudiant" ? (data.etudiantProfile || {}) :
      data.role === "proprietaire" ? (data.proprietaireProfile || {}) : {};
    setForm(profileData);
    setSaved(profileData);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true); setMsg("");
    const endpoints = {
      etudiant: "/profile/etudiant",
      proprietaire: "/profile/proprietaire",
      admin: "/profile/admin",
    };
    const data = await api.put(endpoints[user.role], form, token);
    setSaving(false);
    if (data._id) {
      setSaved({ ...form });   // mise à jour temps réel
      setMsg("success");
      setEditing(false);
      setTimeout(() => setMsg(""), 3000);
    } else {
      setMsg("error");
    }
  };

  const handleCancel = () => {
    setForm({ ...saved }); // reset vers les données sauvegardées
    setEditing(false);
    setMsg("");
  };

  if (!user) return (
    <div className="container empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🔒</div>
      <h3>Connexion requise</h3>
      <button className="btn btn-primary btn-pill" onClick={() => navigate("login")} style={{ marginTop: 20 }}>
        Se connecter
      </button>
    </div>
  );

  const roleConfig = {
    etudiant: {
      icon: "🎓", label: "Étudiant",
      color: "#4A7C6B", bg: "rgba(74,124,107,0.08)",
      fields: [
        { key: "universite",    label: "Université",            placeholder: "ENSA, ENSIAS...",        icon: "🏫" },
        { key: "niveauEtude",   label: "Niveau d'étude",        placeholder: "Licence, Master...",     icon: "📚" },
        { key: "villeRecherche",label: "Ville recherchée",      placeholder: "Casablanca...",          icon: "📍" },
        { key: "budgetMax",     label: "Budget max (MAD/mois)", placeholder: "3000", type: "number",   icon: "💰" },
      ],
    },
    proprietaire: {
      icon: "🏠", label: "Propriétaire",
      color: "#FF385C", bg: "rgba(255,56,92,0.08)",
      fields: [
        { key: "telephone", label: "Téléphone", placeholder: "+212 6XX XXX XXX", icon: "📞" },
        { key: "adresse",   label: "Adresse",   placeholder: "123 Rue Mohammed V, Casablanca", icon: "🏠" },
      ],
    },
    admin: {
      icon: "⚙️", label: "Administrateur",
      color: "#B56E00", bg: "rgba(181,110,0,0.08)",
      fields: [],
    },
  };

  const config = roleConfig[user.role] || roleConfig.etudiant;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: 32 }}>Mon profil</h1>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : (
          <>
            {/* ── Avatar card ── */}
            <div style={{
              background: "#fff", border: "1px solid #DDDDDD",
              borderRadius: 20, padding: 28, marginBottom: 16,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{
                  width: 80, height: 80, borderRadius: "50%",
                  background: "linear-gradient(135deg, #FF385C, #E31C5F)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 30, fontWeight: 800, color: "#fff", flexShrink: 0,
                }}>
                  {user.nom?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, marginBottom: 6 }}>
                    {user.nom}
                  </h2>
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, color: "#717171" }}>{user.email || profile?.email}</span>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      background: config.bg, color: config.color,
                      padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 700,
                    }}>
                      {config.icon} {config.label}
                    </span>
                  </div>

                  {user.role === "proprietaire" && profile?.proprietaireProfile && (
                    <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                      <div style={{ fontSize: 13, color: "#717171" }}>
                        <strong style={{ color: "#222" }}>{profile.proprietaireProfile.nbAnnonces || 0}</strong> annonce(s)
                      </div>
                      <div style={{ fontSize: 13, color: profile.proprietaireProfile.verifie ? "#008A05" : "#717171" }}>
                        {profile.proprietaireProfile.verifie ? "✓ Compte vérifié" : "Non vérifié"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Infos card ── */}
            {config.fields.length > 0 && (
              <div style={{
                background: "#fff", border: "1px solid #DDDDDD",
                borderRadius: 20, padding: 28, marginBottom: 16,
              }}>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 18, color: "#222" }}>
                    Informations du profil
                  </h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      style={{
                        background: "none",
                        border: "1.5px solid #DDDDDD",
                        borderRadius: 100,
                        padding: "7px 18px",
                        fontSize: 13, fontWeight: 600,
                        color: "#222", cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 6,
                        transition: "all 0.15s",
                      }}
                      onMouseOver={e => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.background = "#F7F7F7"; }}
                      onMouseOut={e => { e.currentTarget.style.borderColor = "#DDDDDD"; e.currentTarget.style.background = "none"; }}
                    >
                      ✏️ Modifier
                    </button>
                  )}
                </div>

                {msg === "success" && (
                  <div className="alert alert-success" style={{ marginBottom: 20 }}>✓ Profil mis à jour avec succès !</div>
                )}
                {msg === "error" && (
                  <div className="alert alert-error" style={{ marginBottom: 20 }}>Erreur lors de la mise à jour</div>
                )}

                {/* ── MODE LECTURE ── */}
                {!editing && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {config.fields.map((f, i) => (
                      <div
                        key={f.key}
                        style={{
                          display: "flex", alignItems: "center",
                          justifyContent: "space-between",
                          padding: "16px 0",
                          borderBottom: i < config.fields.length - 1 ? "1px solid #F0F0F0" : "none",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{f.icon}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#484848" }}>{f.label}</span>
                        </div>
                        <span style={{
                          fontSize: 14,
                          color: saved[f.key] ? "#222" : "#B0B0B0",
                          fontWeight: saved[f.key] ? 500 : 400,
                          maxWidth: 260, textAlign: "right",
                        }}>
                          {saved[f.key]
                            ? (f.key === "budgetMax" ? `${Number(saved[f.key]).toLocaleString()} MAD/mois` : saved[f.key])
                            : "Non renseigné"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── MODE ÉDITION ── */}
                {editing && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {config.fields.map(f => (
                      <div key={f.key} className="form-group">
                        <label className="form-label">
                          {f.icon} {f.label}
                        </label>
                        <input
                          className="form-input"
                          type={f.type || "text"}
                          placeholder={f.placeholder}
                          value={form[f.key] || ""}
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          autoFocus={f.key === config.fields[0].key}
                        />
                      </div>
                    ))}

                    {/* Boutons */}
                    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                      <button
                        className="btn btn-primary btn-pill"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving
                          ? <><span className="spinner" /> Sauvegarde...</>
                          : "✓ Enregistrer"}
                      </button>
                      <button
                        className="btn btn-secondary btn-pill"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Admin panel link ── */}
            {user.role === "admin" && (
              <div style={{ background: "#fff", border: "1px solid #DDDDDD", borderRadius: 20, padding: 28 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: "rgba(181,110,0,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                  }}>⚙️</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, color: "#222" }}>Panneau d'administration</div>
                    <div style={{ fontSize: 13, color: "#717171" }}>Accès complet à la plateforme</div>
                  </div>
                </div>
                <button className="btn btn-primary btn-pill" onClick={() => navigate("admin")}>
                  Accéder au panneau admin
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}