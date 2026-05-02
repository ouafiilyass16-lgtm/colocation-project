import { useState, useEffect } from "react";
import { useAuth } from "../App";

export default function Profile() {
  const { api, token, user, navigate } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { if (token) loadProfile(); }, [token]);

  const loadProfile = async () => {
    setLoading(true);
    const data = await api.get("/profile", token);
    setProfile(data);
    if (data.role === "etudiant") setForm(data.etudiantProfile || {});
    if (data.role === "proprietaire") setForm(data.proprietaireProfile || {});
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true); setMsg("");
    const endpoints = { etudiant: "/profile/etudiant", proprietaire: "/profile/proprietaire", admin: "/profile/admin" };
    const data = await api.put(endpoints[user.role], form, token);
    setSaving(false);
    if (data._id) setMsg("✓ Profil mis à jour avec succès !");
    else setMsg("Erreur lors de la mise à jour");
    setTimeout(() => setMsg(""), 3000);
  };

  if (!user) return (
    <div className="page container empty-state">
      <div className="empty-icon">🔒</div>
      <h3>Connexion requise</h3>
      <button className="btn btn-primary" onClick={() => navigate("login")} style={{ marginTop: 20 }}>Se connecter</button>
    </div>
  );

  const roleConfig = {
    etudiant: {
      icon: "🎓", label: "Étudiant",
      fields: [
        { key: "universite", label: "Université", placeholder: "ENSA, ENSIAS..." },
        { key: "niveauEtude", label: "Niveau d'étude", placeholder: "Licence, Master, Doctorat..." },
        { key: "villeRecherche", label: "Ville recherchée", placeholder: "Casablanca..." },
        { key: "budgetMax", label: "Budget max (MAD/mois)", placeholder: "3000", type: "number" },
      ],
    },
    proprietaire: {
      icon: "🏠", label: "Propriétaire",
      fields: [
        { key: "telephone", label: "Téléphone", placeholder: "+212 6XX XXX XXX" },
        { key: "adresse", label: "Adresse", placeholder: "123 Rue Mohammed V, Casablanca" },
      ],
    },
    admin: {
      icon: "⚙️", label: "Administrateur",
      fields: [],
    },
  };

  const config = roleConfig[user.role] || roleConfig.etudiant;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 640 }}>
        <h1 style={{ marginBottom: 32 }}>Mon profil</h1>

        {/* Avatar card */}
        <div className="card" style={{ padding: 28, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--accent), var(--accent2))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 800, color: "white",
              flexShrink: 0,
            }}>
              {user.nom?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 22, marginBottom: 4 }}>{user.nom}</h2>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontSize: 13, color: "var(--text2)" }}>{user.email || profile?.email}</span>
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 4,
                  background: "rgba(79,142,247,0.1)", color: "var(--accent)",
                  padding: "2px 10px", borderRadius: 100, fontSize: 12, fontWeight: 600,
                }}>
                  {config.icon} {config.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile fields */}
        {config.fields.length > 0 && (
          <div className="card" style={{ padding: 28 }}>
            <h3 style={{ fontSize: 14, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text3)", marginBottom: 20 }}>
              Informations du profil
            </h3>

            {msg && (
              <div className={`alert ${msg.startsWith("✓") ? "alert-success" : "alert-error"} mb-4`}>{msg}</div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {config.fields.map((f) => (
                <div key={f.key} className="form-group">
                  <label className="form-label">{f.label}</label>
                  <input
                    className="form-input"
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    value={form[f.key] || ""}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  />
                </div>
              ))}

              {user.role === "proprietaire" && profile?.proprietaireProfile && (
                <div style={{ display: "flex", gap: 16, padding: "12px 16px", background: "var(--bg3)", borderRadius: "var(--radius2)", fontSize: 13 }}>
                  <div>
                    <span style={{ color: "var(--text3)" }}>Annonces : </span>
                    <strong>{profile.proprietaireProfile.nbAnnonces || 0}</strong>
                  </div>
                  <div>
                    <span style={{ color: "var(--text3)" }}>Vérifié : </span>
                    <strong style={{ color: profile.proprietaireProfile.verifie ? "var(--success)" : "var(--text3)" }}>
                      {profile.proprietaireProfile.verifie ? "✓ Oui" : "Non"}
                    </strong>
                  </div>
                </div>
              )}

              <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ alignSelf: "flex-start" }}>
                {saving ? <><span className="spinner" />Sauvegarde...</> : "💾 Enregistrer"}
              </button>
            </div>
          </div>
        )}

        {user.role === "admin" && (
          <div className="card" style={{ padding: 24 }}>
            <p style={{ color: "var(--text2)", fontSize: 14 }}>Compte administrateur — accès complet à la plateforme.</p>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => navigate("admin")}>
              ⚙️ Panneau d'administration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
