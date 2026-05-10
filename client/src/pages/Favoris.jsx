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
    <div className="container empty-state" style={{ paddingTop: 80 }}>
      <div className="empty-icon">🔒</div>
      <h3>Connexion requise</h3>
      <button className="btn btn-primary btn-pill" onClick={() => navigate("login")} style={{ marginTop: 20 }}>
        Se connecter
      </button>
    </div>
  );

  return (
    <div className="page">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: "'Fraunces', serif", marginBottom: 6 }}>Mes favoris</h1>
          <p style={{ color: "#717171", fontSize: 14 }}>
            {favoris.length} annonce{favoris.length > 1 ? "s" : ""} sauvegardée{favoris.length > 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="page-loading">
            <div className="spinner" style={{ width: 36, height: 36 }} />
          </div>
        ) : favoris.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">❤️</div>
            <h3>Aucun favori pour l'instant</h3>
            <p style={{ marginBottom: 20 }}>Sauvegardez des annonces qui vous intéressent</p>
            <button className="btn btn-primary btn-pill" onClick={() => navigate("home")}>
              Explorer les annonces
            </button>
          </div>
        ) : (
          <div className="listing-grid">
            {favoris.map(f => {
              const annonce = f.annonce;
              if (!annonce?._id) return null;
              return (
                <div key={f._id} style={{ position: "relative" }}>
                  <AnnonceCard annonce={annonce} />
                  <button
                    onClick={() => removeFavori(annonce._id)}
                    style={{
                      position: "absolute", top: 12, right: 12,
                      background: "rgba(255,255,255,0.9)",
                      border: "1px solid #DDDDDD",
                      borderRadius: 100, padding: "4px 12px",
                      fontSize: 12, fontWeight: 600, color: "#222",
                      cursor: "pointer", zIndex: 10,
                    }}
                  >
                    Retirer
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
