import { useState, useEffect } from "react";
import { useAuth } from "../App";
import AnnonceCard from "../components/AnnonceCard";

export default function Favoris() {
  const { api, token, user, navigate } = useAuth();
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { 
    if (token) loadFavoris(); 
  }, [token]);

  const loadFavoris = async () => {
    setLoading(true);
    try {
      const data = await api.get("/favoris", token);
      setFavoris(Array.isArray(data) ? data : []);
    } catch (err) {
      setFavoris([]);
    }
    setLoading(false);
  };

  const handleRemove = async (annonceId) => {
    try {
      await api.delete(`/favoris/${annonceId}`, token);
      setFavoris(prev => prev.filter(f => (f.annonce?._id || f.annonce) !== annonceId));
    } catch (err) {
      console.error("Erreur suppression favori");
    }
  };

  if (!user) return (
    <div className="empty-state-prestige" style={{ padding: "100px 20px", textAlign: 'center' }}>
      <div className="empty-icon-box" style={{ margin: "0 auto 20px" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2.5">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <h3 className="section-title-premium" style={{ justifyContent: 'center' }}>Connexion requise</h3>
      <p style={{ color: 'var(--text3)', marginBottom: 24 }}>Connectez-vous pour accéder à vos annonces sauvegardées.</p>
      <button className="btn-send-premium" onClick={() => navigate("/login")} style={{ width: 'auto', padding: '14px 40px' }}>
        Se connecter
      </button>
    </div>
  );

  return (
    <div className="page-wrapper" style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: 40 }}>
        
        {/* Header Prestige */}
        <div style={{ marginBottom: 40 }}>
          <h1 className="detail-main-title">Mes Coups de Cœur</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
            <span className="status-badge-premium" style={{ color: '#D4B996', background: 'rgba(212, 185, 150, 0.1)', padding: "6px 16px", borderRadius: "50px", fontWeight: 700, fontSize: "13px" }}>
              {favoris.length} Sélection{favoris.length > 1 ? "s" : ""}
            </span>
            <div style={{ flexGrow: 1, height: 1, background: 'linear-gradient(to right, rgba(212, 185, 150, 0.2), transparent)' }}></div>
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : favoris.length === 0 ? (
          <div className="empty-state-modern" style={{ textAlign: 'center', padding: "60px 20px" }}>
            <div className="empty-icon-box" style={{ margin: "0 auto 20px" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4B996" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
            </div>
            <h3 className="section-title-premium" style={{ justifyContent: 'center' }}>Votre liste est vide</h3>
            <p style={{ color: 'var(--text3)', marginBottom: 30 }}>Explorez nos résidences et cliquez sur le cœur pour les retrouver ici.</p>
            <button className="btn-send-premium" onClick={() => navigate("/")} style={{ width: 'auto', padding: '14px 40px' }}>
              Explorer les résidences
            </button>
          </div>
        ) : (
          <div className="listing-grid">
            {favoris.map(f => {
              const annonce = f.annonce;
              if (!annonce?._id) return null;
              return (
                <AnnonceCard 
                  key={f._id} 
                  annonce={annonce} 
                  isFavori={true} 
                  onFavori={() => handleRemove(annonce._id)} 
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}