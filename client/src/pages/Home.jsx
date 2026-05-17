import { useState, useEffect, useRef } from "react";
import { useAuth } from "../App";
import AnnonceCard from "../components/AnnonceCard";
import "../styles/Home.css";

import heroBg from "../styles/d9f91d8dcebc4434eae6efea5ae509d2.jpg";

export default function Home() {
  const { api, token, user, navigate } = useAuth();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoris, setFavoris] = useState(new Set());
  const [activeCategory, setActiveCategory] = useState("Tous");
  
  // États de recherche
  const [searchVille, setSearchVille] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchPrix, setSearchPrix] = useState("");
  const [isSearched, setIsSearched] = useState(false); // Pour savoir si une recherche est active

  // Référence pour le défilement automatique
  const resultsRef = useRef(null);

  useEffect(() => {
    loadAnnonces();
    if (user?.role === "etudiant") loadFavoris();
  }, []);

  const loadAnnonces = async () => {
    setLoading(true);
    setIsSearched(false);
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
    setIsSearched(true);

    try {
      const data = await api.get(`/annonces/recherche?${params.toString()}`);
      
      if (data && data.annonces) {
        setAnnonces(data.annonces);
      } else {
        setAnnonces([]);
      }

      // SCROLL AUTOMATIQUE : Défilement vers la section résultats
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);

    } catch (err) {
      setAnnonces([]);
      // Même en cas d'erreur (404), on scroll pour montrer le message "Aucun résultat"
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setLoading(false);
  };

  const categoryMap = { "Appartements": "appartement", "Chambres": "chambre", "Studios": "studio", "Maisons": "maison" };
  const displayedAnnonces = activeCategory === "Tous"
    ? annonces
    : annonces.filter(a => a.typeLogement === categoryMap[activeCategory]);
const handleFavori = async (annonceId) => {
  // Vérifier si l'utilisateur est connecté
  if (!token) {
    navigate("/login");
    return;
  }
  
  try {
    if (favoris.has(annonceId)) {
      // Supprimer des favoris
      await api.delete(`/favoris/${annonceId}`, token);
      setFavoris(prev => {
        const next = new Set(prev);
        next.delete(annonceId);
        return next;
      });
    } else {
      // Ajouter aux favoris
      await api.post(`/favoris/${annonceId}`, {}, token);
      setFavoris(prev => {
        const next = new Set(prev);
        next.add(annonceId);
        return next;
      });
    }
  } catch (err) {
    console.error("Erreur lors de la mise à jour des favoris", err);
  }
};
  return (
    <div className="home-wrapper">
      <section 
        className="hero-section" 
        style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.2)), url(${heroBg})` }}
      >
        <div className="hero-content">
          <p className="hero-subtitle">VOTRE FUTURE RÉSIDENCE ÉTUDIANTE</p>
          <h1 className="hero-title">Trouvez votre foyer<br />idéal au Maroc</h1>
          
          <div className="search-container-floating">
            <div className="search-field">
              <label>Ville</label>
              <input 
                placeholder="Ex: Casablanca..." 
                value={searchVille}
                onChange={e => setSearchVille(e.target.value)}
              />
            </div>
            <div className="search-field">
              <label>Type de bien</label>
              <select value={searchType} onChange={e => setSearchType(e.target.value)}>
                <option value="">Tous les types</option>
                <option value="appartement">Appartement</option>
                <option value="studio">Studio</option>
                <option value="chambre">Chambre</option>
                <option value="maison">Maison</option>
              </select>
            </div>
            <div className="search-field">
              <label>Budget Max</label>
              <input 
                type="number" 
                placeholder="Prix en MAD" 
                value={searchPrix}
                onChange={e => setSearchPrix(e.target.value)}
              />
            </div>
            <button className="btn-search-main" onClick={handleSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ── SECTION LISTING (Ciblée par le Scroll) ── */}
      <section className="section-listing" ref={resultsRef}>
        <div className="section-header">
          <h2>{isSearched ? "Résultats de votre recherche" : "Nos Résidences Sélectionnées"}</h2>
          <div className="line"></div>
        </div>
        
        {loading ? (
          <div className="page-loading"><div className="spinner" /></div>
        ) : displayedAnnonces.length === 0 ? (
          /* ── MESSAGE SI AUCUN RÉSULTAT ── */
          <div className="empty-search-container">
            <h3>Oups ! Aucun logement trouvé</h3>
            <p>Nous n'avons rien trouvé pour ces critères. Essayez de modifier votre recherche ou de voir toutes nos annonces.</p>
            <div className="empty-search-buttons">
              <button className="btn-search-reset" onClick={loadAnnonces}>
                Voir toutes les annonces
              </button>
              <button className="btn-search-back" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                Modifier ma recherche
              </button>
            </div>
          </div>
        ) : (
        <div className="listing-grid">
  {displayedAnnonces.map(a => (
    <AnnonceCard 
      key={a._id} 
      annonce={a} 
      onFavori={handleFavori} // Utilisez handleFavori ici au lieu de handleSearch
      isFavori={favoris.has(a._id)} 
    />
  ))}
</div>
        )}
      </section>
    </div>
  );
}