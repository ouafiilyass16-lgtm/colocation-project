import { useState } from "react";
import { useAuth } from "../App";
import "../styles/Auth.css";

// Importations des images
import loginImage from "../styles/image.png";
import mainLogo from "../styles/ChatGPT Image 14 mai 2026, 19_19_52.png";

// Composant de mise en page partagé (Split Screen)
function AuthLayout({ children, title, subtitle, sidebarTitle, sidebarText }) {
  return (
    <div className="auth-container">
      {/* SECTION GAUCHE : VISUEL ET TEXTE ANIME */}
      <div 
        className="auth-sidebar" 
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.7)), url(${loginImage})` }}
      >
        <div className="auth-sidebar-content">
          <h2 className="auth-sidebar-title">{sidebarTitle}</h2>
          <p className="auth-sidebar-text">{sidebarText}</p>
        </div>
      </div>

      {/* SECTION DROITE : FORMULAIRE DANS LA BOITE AVEC OMBRES ET POINTILLÉS */}
      <div className="auth-form-section">
        <div className="auth-form-box">
          {/* LOGO CENTRÉ AU MILIEU DU FORMULAIRE */}
          <div className="logo-centered-container">
            <img src={mainLogo} alt="LocaStudy Logo" className="logo-main-img" />
          </div>
          
          <h1 className="auth-form-title">{title}</h1>
          <p className="auth-form-subtitle">{subtitle}</p>
          
          {children}
        </div>
      </div>
    </div>
  );
}

// COMPOSANT DE CONNEXION (LOGIN)
export default function Login() {
  const { api, login, navigate } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.email || !form.password) { setError("Tous les champs sont requis"); return; }
    setLoading(true); setError("");
    try {
      const data = await api.post("/auth/login", form);
      setLoading(false);
      if (data.token) login(data.user, data.token);
      else setError(data.msg || "Email ou mot de passe incorrect");
    } catch (err) {
      setLoading(false);
      setError("Erreur de connexion au serveur (Vérifiez votre Backend)");
    }
  };

  return (
    <AuthLayout 
      title="Bon retour !" 
      subtitle="Accédez à votre espace LocaStudy"
      sidebarTitle="L'IMMOBILIER ÉTUDIANT, SIMPLIFIÉ."
      sidebarText="Trouvez, visitez et louez votre futur logement en quelques clics."
    >
      {error && <div className="alert alert-error" style={{marginBottom: '15px'}}>{error}</div>}
      
      <div className="flex-column">
        <div className="form-group">
          <label className="form-label">Email professionnel ou étudiant</label>
          <input className="form-input" type="email" placeholder="nom@exemple.com"
            value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>
        
        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input className="form-input" type="password" placeholder="••••••••"
            value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        
        <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
          {loading ? "Connexion en cours..." : "Se connecter maintenant"}
        </button>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Nouveau ici ? 
            <span className="auth-link-action" onClick={() => navigate("register")}>
              Créer un compte gratuitement
            </span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}

// COMPOSANT D'INSCRIPTION (REGISTER)
export function Register() {
  const { api, navigate } = useAuth();
  const [form, setForm] = useState({ nom: "", email: "", password: "", role: "etudiant" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.nom || !form.email || !form.password) { setError("Tous les champs sont requis"); return; }
    setLoading(true); setError("");
    try {
      const data = await api.post("/auth/register", form);
      setLoading(false);
      if (data.msg === "Utilisateur enregistré avec succès") navigate("login");
      else setError(data.msg);
    } catch (err) {
      setLoading(false);
      setError("Erreur de connexion au serveur");
    }
  };

  return (
    <AuthLayout 
      title="Créer un compte" 
      subtitle="Rejoignez LocaStudy dès aujourd'hui."
      sidebarTitle="REJOIGNEZ LA COMMUNAUTÉ LOCASTUDY"
      sidebarText="Inscrivez-vous pour trouver votre logement idéal ou proposer vos biens."
    >
      {error && <div className="alert alert-error" style={{marginBottom: '15px'}}>{error}</div>}
      
      <div className="flex-column">
        <div className="form-group">
          <label className="form-label">Nom complet</label>
          <input className="form-input" placeholder="Prénom & Nom" value={form.nom}
            onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" placeholder="Email" value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
        </div>

        <div className="form-group">
          <label className="form-label">Mot de passe</label>
          <input className="form-input" type="password" placeholder="Mot de passe" value={form.password}
            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
        </div>
        
        {/* SÉLECTEUR DE RÔLE STYLISÉ (CARTES INTERACTIVES) */}
        <div className="form-group">
          <label className="form-label">Je suis :</label>
          <div className="role-selection-grid">
            <div 
              className={`role-card ${form.role === "etudiant" ? "active" : ""}`}
              onClick={() => setForm(p => ({ ...p, role: "etudiant" }))}
            >
              <span className="role-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                </svg>
              </span>
              <span className="role-card-label">Étudiant</span>
              <span className="role-card-desc">Chercher</span>
            </div>

            <div 
              className={`role-card ${form.role === "proprietaire" ? "active" : ""}`}
              onClick={() => setForm(p => ({ ...p, role: "proprietaire" }))}
            >
              <span className="role-card-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/>
                </svg>
              </span>

              <span className="role-card-label">Propriétaire</span>
              <span className="role-card-desc">Louer</span>
            </div>
          </div>
        </div>

        <button className="btn-auth" onClick={handleSubmit} disabled={loading}>
          {loading ? "Création..." : "S'inscrire gratuitement"}
        </button>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Déjà membre ? 
            <span className="auth-link-action" onClick={() => navigate("login")}>
              Se connecter
            </span>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}