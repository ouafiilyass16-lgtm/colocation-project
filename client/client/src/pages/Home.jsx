import { useState, useEffect } from "react";
import { useAuth } from "../App";
import AnnonceCard from "../components/AnnonceCard";

export default function Home() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoris, setFavoris] = useState(new Set());
  const [filters, setFilters] = useState({
    ville: "", typeLogement: "", prixMin: "", prixMax: "", surfaceMin: "",
  });
  const [searched, setSearched] = useState(false);
  const [searchMsg, setSearchMsg] = useState("");

  useEffect(() => {
    loadAnnonces();
    if (user?.role === "etudiant") loadFavoris();
  }, []);

  const loadAnnonces = async () => {
    setLoading(true);
    try {
      const data = await api.get("/annonces");
      setAnnonces(Array.isArray(data) ? data : []);
    } catch (e) { setAnnonces([]); }
    setLoading(false);
  };

  const loadFavoris = async () => {
    try {
      const data = await api.get("/favoris", token);
      if (Array.isArray(data)) setFavoris(new Set(data.map((f) => f.annonce?._id || f.annonce)));
    } catch (e) {}
  };

  const handleSearch = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
    setLoading(true);
    try {
      const data = await api.get(`/annonces/recherche?${params.toString()}`);
      if (data.annonces) { setAnnonces(data.annonces); setSearchMsg(data.message); }
      else if (data.message) { setAnnonces([]); setSearchMsg(data.message); }
      setSearched(true);
    } catch (e) {}
    setLoading(false);
  };

  const handleFavori = async (annonceId) => {
    if (!token) { navigate("login"); return; }
    if (favoris.has(annonceId)) {
      await api.delete(`/favoris/${annonceId}`, token);
      setFavoris((prev) => { const n = new Set(prev); n.delete(annonceId); return n; });
    } else {
      await api.post(`/favoris/${annonceId}`, {}, token);
      setFavoris((prev) => new Set(prev).add(annonceId));
    }
  };

  const resetSearch = () => {
    setFilters({ ville: "", typeLogement: "", prixMin: "", prixMax: "", surfaceMin: "" });
    setSearched(false); setSearchMsg(""); loadAnnonces();
  };

  return (
    <div className="page">
      {/* Hero */}
      <div style={{
        textAlign: "center", padding: "60px 20px 48px",
        position: "relative",
      }}>
        <div style={{
          display: "inline-block", padding: "4px 14px", borderRadius: 100,
          background: "rgba(79,142,247,0.1)", border: "1px solid rgba(79,142,247,0.2)",
          fontSize: 12, color: "var(--accent)", fontWeight: 600, letterSpacing: "0.08em",
          marginBottom: 20, textTransform: "uppercase",
        }}>
          Plateforme de logement étudiant au Maroc
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 64px)", marginBottom: 16, lineHeight: 1.1 }}>
          Trouve ton logement<br />
          <span style={{ background: "linear-gradient(135deg, var(--accent), var(--accent3))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            idéal
          </span>
        </h1>
        <p style={{ fontSize: 17, color: "var(--text2)", maxWidth: 480, margin: "0 auto 32px" }}>
          Appartements, studios, chambres — trouvez le logement qui correspond à votre budget et votre ville.
        </p>
        {user?.role === "proprietaire" && (
          <button className="btn btn-primary btn-lg" onClick={() => navigate("create-annonce")}>
            + Publier une annonce
          </button>
        )}
        {!user && (
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate("register")}>Commencer</button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate("login")}>Se connecter</button>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <div className="container" style={{ marginBottom: 40 }}>
        <div style={{
          background: "var(--bg2)", border: "1px solid var(--border)",
          borderRadius: 16, padding: 20,
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr auto", gap: 12, alignItems: "end",
        }}>
          <div className="form-group">
            <label className="form-label">Ville</label>
            <input className="form-input" placeholder="Casablanca, Rabat..." value={filters.ville}
              onChange={(e) => setFilters((p) => ({ ...p, ville: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Type</label>
            <select className="form-input" value={filters.typeLogement}
              onChange={(e) => setFilters((p) => ({ ...p, typeLogement: e.target.value }))}>
              <option value="">Tous</option>
              <option value="appartement">Appartement</option>
              <option value="studio">Studio</option>
              <option value="chambre">Chambre</option>
              <option value="maison">Maison</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Prix max (MAD)</label>
            <input className="form-input" type="number" placeholder="3000" value={filters.prixMax}
              onChange={(e) => setFilters((p) => ({ ...p, prixMax: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Surface min (m²)</label>
            <input className="form-input" type="number" placeholder="20" value={filters.surfaceMin}
              onChange={(e) => setFilters((p) => ({ ...p, surfaceMin: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-primary" onClick={handleSearch}>🔍 Chercher</button>
            {searched && <button className="btn btn-secondary" onClick={resetSearch}>✕</button>}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container">
        <div className="flex-between mb-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22 }}>
            {searched ? searchMsg || "Résultats" : "Annonces récentes"}
          </h2>
          <span style={{ color: "var(--text3)", fontSize: 14 }}>{annonces.length} annonce(s)</span>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : annonces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>Aucune annonce trouvée</h3>
            <p>{searched ? "Modifiez vos critères de recherche" : "Aucune annonce disponible pour le moment"}</p>
          </div>
        ) : (
          <div className="grid-3">
            {annonces.map((a) => (
              <AnnonceCard key={a._id} annonce={a} onFavori={handleFavori} isFavori={favoris.has(a._id)} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 1fr 1fr 1fr auto"] {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 600px) {
          div[style*="gridTemplateColumns: 1fr 1fr 1fr 1fr auto"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
