import "../styles/Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">Loca<span className="footer-accent">Study</span></span>
          <p className="footer-tagline">La colocation étudiante simplifiée au Maroc</p>
        </div>
        <div className="footer-links">
          <div className="footer-col">
            <h4>Navigation</h4>
            <button className="footer-link-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Annonces</button>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <span className="footer-info">contact@locastudy.ma</span>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} LocaStudy. Tous droits réservés.</span>
      </div>
    </footer>
  );
}