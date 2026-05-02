import { useState, useEffect } from "react";
import { useAuth } from "../App";
import AnnonceCard from "../components/AnnonceCard";

export default function Favoris() {
  const { api, token, user, navigate } = useAuth();
  const [favoris, setFavoris] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { if (token) loadFavoris(); }, [token]);

  const loadFavoris = async () => {
    setLoading(true);
    const data = await api.get("/favoris", token);
    setFavoris(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  const removeFavori = async (annonceId) => {
    await api.delete(`/favoris/${annonceId}`, token);
    setFavoris(prev => prev.filter(f => (f.annonce?._id || f.annonce) !== annonceId));
  };

  if (!user) return (
    <div className="page container empty-state">
      <div className="empty-icon">🔒</div>
      <h3>Connexion requise</h3>
      <button className="btn btn-primary" onClick={() => navigate("login")} style={{ marginTop: 20 }}>Se connecter</button>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <h1 style={{ marginBottom: 8 }}>Mes favoris</h1>
        <p style={{ color: "var(--text2)", marginBottom: 32, fontSize: 14 }}>
          {favoris.length} annonce(s) sauvegardée(s)
        </p>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : favoris.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h3>Aucun favori pour l'instant</h3>
            <p style={{ marginBottom: 20 }}>Sauvegardez des annonces qui vous intéressent</p>
            <button className="btn btn-primary" onClick={() => navigate("home")}>Explorer les annonces</button>
          </div>
        ) : (
          <div className="grid-3">
            {favoris.map((f) => {
              const annonce = f.annonce;
              if (!annonce?._id) return null;
              return (
                <div key={f._id} style={{ position: "relative" }}>
                  <AnnonceCard annonce={annonce} />
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeFavori(annonce._id)}
                    style={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}
                  >
                    ❤️ Retirer
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
