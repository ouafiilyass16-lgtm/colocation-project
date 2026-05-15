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
      // Mise à jour locale immédiate pour la fluidité
      setFavoris(prev => prev.filter(f => (f.annonce?._id || f.annonce) !== annonceId));
    } catch (err) {
      console.error("Erreur suppression favori");
    }
  };

  if (!user) return (
    <div className="container" style={{ paddingTop: 100, textAlign: 'center' }}>
      <div style={{ fontSize: 50, marginBottom: 20 }}>🔒</div>
      <h3 className="section-title-premium" style={{ justifyContent: 'center' }}>Connexion requise</h3>
      <p style={{ color: '#64748B', marginBottom: 24 }}>Connectez-vous pour accéder à vos annonces sauvegardées.</p>
      <button className="btn-send-premium" onClick={() => navigate("login")} style={{ width: 'auto', padding: '14px 40px' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="status-badge-premium" style={{ color: '#D4B996', background: 'rgba(212, 185, 150, 0.1)' }}>
              {favoris.length} Sélection{favoris.length > 1 ? "s" : ""}
            </span>
            <div style={{ flexGrow: 1, height: 1, background: 'linear-gradient(to right, #EEEEEE, transparent)' }}></div>
          </div>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : favoris.length === 0 ? (
          <div className="empty-state" style={{ textAlign: 'center', paddingTop: 60 }}>
            <div style={{ fontSize: 60, marginBottom: 20 }}>✨</div>
            <h3 className="section-title-premium" style={{ justifyContent: 'center' }}>Votre liste est vide</h3>
            <p style={{ color: '#64748B', marginBottom: 30 }}>Explorez nos résidences et cliquez sur le cœur pour les retrouver ici.</p>
            <button className="btn-send-premium" onClick={() => navigate("home")} style={{ width: 'auto', padding: '14px 40px' }}>
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
                  isFavori={true} // Forcer l'affichage du cœur plein
                  onFavori={() => handleRemove(annonce._id)} // Cliquer sur le cœur retire le favori
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}