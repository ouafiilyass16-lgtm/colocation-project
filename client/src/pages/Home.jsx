import { useState, useEffect } from "react";
import { useAuth } from "../App";
import AnnonceCard from "../components/AnnonceCard";

const CATEGORIES = [
  { icon: "🏙️", label: "Tous" },
  { icon: "🏢", label: "Appartements" },
  { icon: "🛏️", label: "Chambres" },
  { icon: "🏠", label: "Studios" },
  { icon: "🏡", label: "Maisons" },
];

const CITIES = [
  "Casablanca", "Rabat", "Marrakech", "Fès", "Agadir", "Tanger", "Meknès", "Oujda",
];

export default function Home() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoris, setFavoris] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchVille, setSearchVille] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchPrix, setSearchPrix] = useState("");
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
    } catch { setAnnonces([]); }
    setLoading(false);
  };

  const loadFavoris = async () => {
    try {
      const data = await api.get("/favoris", token);
      if (Array.isArray(data)) setFavoris(new Set(data.map(f => f.annonce?._id || f.annonce)));
    } catch {}
  };

  const handleSearch = async () => {
    const params = new URLSearchParams();
    if (searchVille) params.append("ville", searchVille);
    if (searchType) params.append("typeLogement", searchType);
    if (searchPrix) params.append("prixMax", searchPrix);
    setLoading(true);
    try {
      const data = await api.get(`/annonces/recherche?${params.toString()}`);
      if (data.annonces) { setAnnonces(data.annonces); setSearchMsg(data.message); }
      else if (data.message) { setAnnonces([]); setSearchMsg(data.message); }
      setSearched(true);
    } catch {}
    setLoading(false);
  };

  const handleFavori = async (annonceId) => {
    if (!token) { navigate("login"); return; }
    if (favoris.has(annonceId)) {
      await api.delete(`/favoris/${annonceId}`, token);
      setFavoris(prev => { const n = new Set(prev); n.delete(annonceId); return n; });
    } else {
      await api.post(`/favoris/${annonceId}`, {}, token);
      setFavoris(prev => new Set(prev).add(annonceId));
    }
  };

  const resetSearch = () => {
    setSearchVille(""); setSearchType(""); setSearchPrix("");
    setSearched(false); setSearchMsg("");
    loadAnnonces();
  };

  // Filter by category
  const categoryMap = { "Appartements": "appartement", "Chambres": "chambre", "Studios": "studio", "Maisons": "maison" };
  const displayedAnnonces = activeCategory === "Tous"
    ? annonces
    : annonces.filter(a => a.typeLogement === categoryMap[activeCategory]);

  return (
    <div>
      {/* ── Hero ── */}
      <div style={{
        background: "linear-gradient(160deg, #fff5f5 0%, #fff0f3 40%, #fff 100%)",
        borderBottom: "1px solid #DDDDDD",
        padding: "64px 24px 56px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          {!user && (
            <div style={{
              display: "inline-block",
              padding: "6px 16px", borderRadius: 100,
              background: "rgba(255,56,92,0.08)",
              border: "1px solid rgba(255,56,92,0.2)",
              fontSize: 12, color: "#FF385C", fontWeight: 700,
              letterSpacing: "0.08em", textTransform: "uppercase",
              marginBottom: 20,
            }}>
              Logement étudiant au Maroc
            </div>
          )}
          <h1 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(34px, 5vw, 56px)",
            fontWeight: 700,
            lineHeight: 1.12,
            color: "#222",
            marginBottom: 16,
          }}>
            Trouve ton logement<br />
            <span style={{ color: "#FF385C" }}>idéal</span>
          </h1>
          <p style={{
            fontSize: 17, color: "#717171",
            maxWidth: 460, margin: "0 auto 40px",
            lineHeight: 1.6,
          }}>
            Appartements, studios, chambres — le logement qui correspond à votre budget et votre ville.
          </p>

          {/* ── Search Bar ── */}
          <div className="search-bar" style={{ maxWidth: 640, margin: "0 auto" }}>
            <div className="search-bar__section" style={{ flex: "1.5" }}>
              <div className="search-bar__label">Ville</div>
              <input
                className="search-bar__input"
                placeholder="Où allez-vous ?"
                value={searchVille}
                onChange={e => setSearchVille(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="search-bar__section" style={{ flex: 1 }}>
              <div className="search-bar__label">Type</div>
              <select
                className="search-bar__input"
                value={searchType}
                onChange={e => setSearchType(e.target.value)}
                style={{ appearance: "none" }}
              >
                <option value="">Tous les types</option>
                <option value="appartement">Appartement</option>
                <option value="studio">Studio</option>
                <option value="chambre">Chambre</option>
                <option value="maison">Maison</option>
              </select>
            </div>
            <div className="search-bar__section" style={{ flex: 1 }}>
              <div className="search-bar__label">Budget max</div>
              <input
                className="search-bar__input"
                type="number"
                placeholder="Prix (MAD)"
                value={searchPrix}
                onChange={e => setSearchPrix(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button className="search-bar__btn" onClick={handleSearch}>
              🔍
            </button>
          </div>

          {searched && (
            <button
              onClick={resetSearch}
              style={{
                marginTop: 16, background: "none", border: "none",
                color: "#717171", fontSize: 13, cursor: "pointer",
                textDecoration: "underline", fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Effacer la recherche
            </button>
          )}
        </div>
      </div>

      {/* ── Cities quick links ── */}
      {!searched && (
        <div style={{ borderBottom: "1px solid #DDDDDD", padding: "14px 24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {CITIES.map(city => (
              <button
                key={city}
                onClick={() => { setSearchVille(city); handleSearch(); }}
                style={{
                  background: "none", border: "1px solid #DDDDDD",
                  borderRadius: 100, padding: "6px 14px",
                  fontSize: 13, color: "#484848", cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.background = "#F7F7F7"; e.currentTarget.style.borderColor = "#B0B0B0"; }}
                onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.borderColor = "#DDDDDD"; }}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Content ── */}
      <div className="container" style={{ paddingTop: 32, paddingBottom: 80 }}>

        {/* Category pills */}
        {!searched && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
            <div className="category-pills">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  className={`category-pill ${activeCategory === cat.label ? "active" : ""}`}
                  onClick={() => setActiveCategory(cat.label)}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            {user?.role === "proprietaire" && (
              <button
                className="btn btn-primary btn-pill"
                onClick={() => navigate("create-annonce")}
                style={{ flexShrink: 0, marginLeft: 16 }}
              >
                + Publier une annonce
              </button>
            )}
            {!user && (
              <div style={{ display: "flex", gap: 8, flexShrink: 0, marginLeft: 16 }}>
                <button className="btn btn-secondary btn-pill btn-sm" onClick={() => navigate("login")}>Connexion</button>
                <button className="btn btn-primary btn-pill btn-sm" onClick={() => navigate("register")}>Inscription</button>
              </div>
            )}
          </div>
        )}

        {/* Section title */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: "clamp(20px, 2.5vw, 26px)",
            fontWeight: 600, color: "#222",
          }}>
            {searched ? (searchMsg || "Résultats de recherche") : "Annonces disponibles"}
          </h2>
          <span style={{ fontSize: 14, color: "#717171" }}>
            {displayedAnnonces.length} logement{displayedAnnonces.length > 1 ? "s" : ""}
          </span>
        </div>

        {loading ? (
          <div className="page-loading"><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        ) : displayedAnnonces.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>Aucune annonce trouvée</h3>
            <p>{searched ? "Modifiez vos critères de recherche" : "Aucune annonce disponible pour le moment"}</p>
            {searched && (
              <button className="btn btn-primary btn-pill" style={{ marginTop: 20 }} onClick={resetSearch}>
                Voir toutes les annonces
              </button>
            )}
          </div>
        ) : (
          <div className="listing-grid">
            {displayedAnnonces.map(a => (
              <AnnonceCard
                key={a._id}
                annonce={a}
                onFavori={handleFavori}
                isFavori={favoris.has(a._id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Footer CTA ── */}
      {!user && !loading && (
        <div style={{
          background: "#222",
          padding: "56px 24px",
          textAlign: "center",
          marginTop: 40,
        }}>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <h2 style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: "clamp(24px, 4vw, 36px)",
              color: "#fff", fontWeight: 600, marginBottom: 12,
            }}>
              Vous êtes propriétaire ?
            </h2>
            <p style={{ color: "#B0B0B0", fontSize: 16, marginBottom: 28, lineHeight: 1.6 }}>
              Publiez votre logement gratuitement et touchez des milliers d'étudiants.
            </p>
            <button className="btn btn-primary btn-pill btn-lg" onClick={() => navigate("register")}>
              Commencer maintenant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
