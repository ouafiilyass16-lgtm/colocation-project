import { useState } from "react";
import { useAuth } from "../App";

function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏡</div>
          <h1 style={{ fontSize: 28, marginBottom: 8 }}>{title}</h1>
          <p style={{ color: "var(--text2)", fontSize: 15 }}>{subtitle}</p>
        </div>
        <div className="card" style={{ padding: 32 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default function Login() {
  const { api, login, navigate } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Tous les champs sont requis"); return; }
    setLoading(true); setError("");
    const data = await api.post("/auth/login", form);
    setLoading(false);
    if (data.token) {
      login(data.user, data.token);
    } else {
      setError(data.msg || "Identifiants invalides");
    }
  };

  return (
    <AuthLayout title="Bon retour" subtitle="Connectez-vous à votre compte">
      {error && <div className="alert alert-error">{error}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="vous@email.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        </div>
        <button className="btn btn-primary w-full" style={{ marginTop: 8, justifyContent: "center" }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" />Connexion...</> : "Se connecter"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
          Pas encore inscrit ?{" "}
          <span onClick={() => navigate("register")} style={{ color: "var(--accent)", cursor: "pointer" }}>
            Créer un compte
          </span>
        </p>
      </div>
    </AuthLayout>
  );
}

export function Register() {
  const { api, navigate } = useAuth();
  const [form, setForm] = useState({ nom: "", email: "", password: "", role: "etudiant" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.nom || !form.email || !form.password) { setError("Tous les champs sont requis"); return; }
    if (form.password.length < 6) { setError("Le mot de passe doit faire au moins 6 caractères"); return; }
    setLoading(true); setError(""); setSuccess("");
    const data = await api.post("/auth/register", form);
    setLoading(false);
    if (data.msg === "Utilisateur enregistré avec succès") {
      setSuccess("Compte créé ! Vous pouvez vous connecter.");
      setTimeout(() => navigate("login"), 1500);
    } else {
      setError(data.msg || "Une erreur est survenue");
    }
  };

  return (
    <AuthLayout title="Créer un compte" subtitle="Rejoignez la communauté LocaStudy">
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Nom complet</label>
          <input className="form-input" placeholder="Votre nom" value={form.nom}
            onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="vous@email.com" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input className="form-input" type="password" placeholder="Minimum 6 caractères" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        <div className="form-group">
          <label className="form-label">Je suis</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { value: "etudiant", label: "🎓 Étudiant", desc: "Je cherche un logement" },
              { value: "proprietaire", label: "🏠 Propriétaire", desc: "Je loue un logement" },
            ].map((r) => (
              <div key={r.value}
                onClick={() => setForm(p => ({ ...p, role: r.value }))}
                style={{
                  padding: "12px 14px", borderRadius: "var(--radius2)", cursor: "pointer",
                  border: `1px solid ${form.role === r.value ? "var(--accent)" : "var(--border)"}`,
                  background: form.role === r.value ? "rgba(79,142,247,0.1)" : "var(--bg3)",
                  transition: "var(--transition)",
                }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{r.label}</div>
                <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="btn btn-primary w-full" style={{ justifyContent: "center", marginTop: 4 }}
          onClick={handleSubmit} disabled={loading}>
          {loading ? <><span className="spinner" />Création...</> : "Créer mon compte"}
        </button>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--text3)" }}>
          Déjà inscrit ?{" "}
          <span onClick={() => navigate("login")} style={{ color: "var(--accent)", cursor: "pointer" }}>
            Se connecter
          </span>
        </p>
      </div>
    </AuthLayout>
  );
}
