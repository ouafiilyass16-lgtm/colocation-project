import { useEffect, useState } from "react";
import { useAuth } from "../App";
import "../styles/CreateAnnonce.css";

const STEPS = [
  { id: 1, label: "Informations", icon: "📝" },
  { id: 2, label: "Détails", icon: "📐" },
  { id: 3, label: "Photos", icon: "📷" },
];

const VILLES_LIST = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Agadir",
  "Tanger",
  "Meknès",
  "Oujda",
  "Tétouan",
  "Kénitra",
];

export default function ModifierAnnonce({ id }) {

  const { api, token, navigate } = useAuth();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    prix: "",
    ville: "",
    typeLogement: "appartement",
    surface: "",
    dateDisponibilite: "",
  });

  const [photos, setPhotos] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ======================================================
  // CHARGER ANNONCE
  // ======================================================

  useEffect(() => {

    if (id) {
      loadAnnonce();
    }

  }, [id]);

  const loadAnnonce = async () => {

    try {

      console.log("ID :", id);

      const data = await api.get(
        `/annonces/${id}`
      );

      console.log("ANNONCE :", data);

      setForm({
        titre: data.titre || "",
        description: data.description || "",
        prix: data.prix || "",
        ville: data.ville || "",
        typeLogement:
          data.typeLogement || "appartement",
        surface: data.surface || "",
        dateDisponibilite:
          data.dateDisponibilite
            ? data.dateDisponibilite.slice(0, 10)
            : "",
      });

      setPhotos(data.photos || []);

    } catch (err) {

      console.error(err);

      setError(
        "Erreur chargement annonce"
      );
    }
  };

  // ======================================================
  // SUPPRIMER PHOTO
  // ======================================================

  const removePhoto = async (
    index,
    photoId
  ) => {

    try {

      // PHOTO EXISTE EN BDD

      if (photoId) {

        await api.delete(
          `/annonces/${id}/photos/${photoId}`,
          token
        );
      }

      setPhotos(prev =>
        prev.filter(
          (_, i) => i !== index
        )
      );

    } catch (err) {

      console.error(err);
    }
  };

  // ======================================================
  // AJOUT PHOTOS
  // ======================================================

  const handlePhotoChange = (e) => {

    const files = Array.from(
      e.target.files
    );

    const remaining =
      5 - photos.length;

    files
      .slice(0, remaining)
      .forEach(file => {

        // MAX 2 MO

        if (
          file.size >
          2 * 1024 * 1024
        ) {

          setError(
            `Image ${file.name} trop lourde`
          );

          return;
        }

        const reader =
          new FileReader();

        reader.onload = ev => {

          setPhotos(prev => [
            ...prev,
            {
              url: ev.target.result,
              ordre: prev.length,
              file,
            }
          ]);
        };

        reader.readAsDataURL(file);
      });
  };

  // ======================================================
  // VALIDATION
  // ======================================================

  const validateStep = () => {

    setError("");

    if (step === 1) {

      if (
        !form.titre ||
        !form.description ||
        !form.ville
      ) {

        setError(
          "Veuillez remplir tous les champs"
        );

        return false;
      }
    }

    if (step === 2) {

      if (
        !form.prix ||
        !form.surface ||
        !form.dateDisponibilite
      ) {

        setError(
          "Veuillez remplir les détails"
        );

        return false;
      }
    }

    return true;
  };

  // ======================================================
  // NEXT STEP
  // ======================================================

  const handleNext = () => {

    if (validateStep()) {

      setStep(s => s + 1);
    }
  };

  // ======================================================
  // MODIFICATION
  // ======================================================

  const handleSubmit = async () => {

    if (!validateStep()) return;

    try {

      setLoading(true);

      const payload = {
        ...form,
        prix: Number(form.prix),
        surface: Number(form.surface),
      };

      // ======================================
      // MODIFICATION ANNONCE
      // ======================================

      const res = await api.put(
        `/annonces/${id}`,
        payload,
        token
      );

      console.log(
        "MODIFICATION :",
        res
      );

      // ======================================
      // AJOUT NOUVELLES PHOTOS
      // ======================================

      const nouvellesPhotos =
        photos.filter(p => p.file);

      if (
        nouvellesPhotos.length > 0
      ) {

        await api.post(
          `/annonces/${id}/photos`,
          {
            photos:
              nouvellesPhotos.map(
                (p, i) => ({
                  url: p.url,
                  ordre: i,
                })
              ),
          },
          token
        );
      }

      alert(
        "Annonce modifiée avec succès"
      );

      navigate("mes-annonces");

    } catch (err) {

      console.error(err);

      setError(
        "Erreur modification annonce"
      );

    } finally {

      setLoading(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="create-annonce-wrapper">

      <div
        className="container"
        style={{ maxWidth: 800 }}
      >

        {/* RETOUR */}

        <button
          onClick={() =>
            navigate("mes-annonces")
          }
          className="btn-back-premium"
        >
          ← Retour
        </button>

        {/* HEADER */}

        <div className="create-header">

          <h1 className="detail-main-title">
            Modifier l'annonce
          </h1>

          <p className="subtitle-prestige">
            Modifiez les informations
            de votre logement.
          </p>
        </div>

        {/* STEPPER */}

        <div className="stepper-premium">

          {STEPS.map((s, i) => (

            <div
              key={s.id}
              className={`step-item ${
                step === s.id
                  ? "active"
                  : ""
              } ${
                step > s.id
                  ? "completed"
                  : ""
              }`}
            >

              <div className="step-circle">
                {step > s.id
                  ? "✓"
                  : s.id}
              </div>

              <span className="step-label">
                {s.label}
              </span>

              {i <
                STEPS.length - 1 && (
                <div className="step-line"></div>
              )}
            </div>
          ))}
        </div>

        {/* ERROR */}

        {error && (
          <div className="alert-error-premium">
            {error}
          </div>
        )}

        {/* FORM */}

        <div className="form-card-premium">

          {/* STEP 1 */}

          {step === 1 && (

            <div className="step-content anim-fade-in">

              <h3 className="section-title-premium">
                Informations générales
              </h3>

              <div className="form-grid-prestige">

                <div className="input-group-prestige">

                  <label>
                    Titre
                  </label>

                  <input
                    type="text"
                    value={form.titre}
                    onChange={e =>
                      setForm(p => ({
                        ...p,
                        titre:
                          e.target.value
                      }))
                    }
                  />
                </div>

                <div className="input-group-prestige">

                  <label>
                    Description
                  </label>

                  <textarea
                    value={
                      form.description
                    }
                    onChange={e =>
                      setForm(p => ({
                        ...p,
                        description:
                          e.target.value
                      }))
                    }
                  />
                </div>

                <div className="grid-2-prestige">

                  <div className="input-group-prestige">

                    <label>
                      Ville
                    </label>

                    <input
                      list="villes-list"
                      value={form.ville}
                      onChange={e =>
                        setForm(p => ({
                          ...p,
                          ville:
                            e.target.value
                        }))
                      }
                    />

                    <datalist id="villes-list">
                      {VILLES_LIST.map(v => (
                        <option
                          key={v}
                          value={v}
                        />
                      ))}
                    </datalist>
                  </div>

                  <div className="input-group-prestige">

                    <label>
                      Type logement
                    </label>

                    <select
                      value={
                        form.typeLogement
                      }
                      onChange={e =>
                        setForm(p => ({
                          ...p,
                          typeLogement:
                            e.target.value
                        }))
                      }
                    >

                      <option value="appartement">
                        Appartement
                      </option>

                      <option value="studio">
                        Studio
                      </option>

                      <option value="chambre">
                        Chambre
                      </option>

                      <option value="maison">
                        Maison
                      </option>

                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (

            <div className="step-content anim-fade-in">

              <h3 className="section-title-premium">
                Détails techniques
              </h3>

              <div className="grid-2-prestige">

                <div className="input-group-prestige">

                  <label>
                    Prix
                  </label>

                  <input
                    type="number"
                    value={form.prix}
                    onChange={e =>
                      setForm(p => ({
                        ...p,
                        prix:
                          e.target.value
                      }))
                    }
                  />
                </div>

                <div className="input-group-prestige">

                  <label>
                    Surface
                  </label>

                  <input
                    type="number"
                    value={form.surface}
                    onChange={e =>
                      setForm(p => ({
                        ...p,
                        surface:
                          e.target.value
                      }))
                    }
                  />
                </div>
              </div>

              <div className="input-group-prestige">

                <label>
                  Date disponibilité
                </label>

                <input
                  type="date"
                  value={
                    form.dateDisponibilite
                  }
                  onChange={e =>
                    setForm(p => ({
                      ...p,
                      dateDisponibilite:
                        e.target.value
                    }))
                  }
                />
              </div>
            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (

            <div className="step-content anim-fade-in">

              <h3 className="section-title-premium">
                Photos
              </h3>

              <div
                className="upload-zone-premium"
                onClick={() =>
                  photos.length < 5 &&
                  document
                    .getElementById(
                      "photo-input"
                    )
                    .click()
                }
              >

                <div className="upload-icon">
                  📷
                </div>

                <p>
                  Cliquez pour ajouter
                  des photos
                </p>
              </div>

              <input
                id="photo-input"
                type="file"
                hidden
                multiple
                onChange={
                  handlePhotoChange
                }
              />

              {/* PREVIEW */}

              <div className="photo-preview-grid">

                {photos.map((p, i) => (

                  <div
                    key={i}
                    className="photo-thumb"
                  >

                    <img
                      src={p.url}
                      alt=""
                    />

                    {/* SUPPRIMER */}

                    <button
                      type="button"
                      className="remove-btn-prestige"
                      onClick={(e) => {

                        e.stopPropagation();

                        removePhoto(
                          i,
                          p._id
                        );
                      }}
                    >
                      ×
                    </button>

                    {i === 0 && (
                      <div className="main-badge">
                        Principale
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="navigation-footer-prestige">

          <button
            className="btn-secondary-prestige"
            onClick={() =>
              step > 1
                ? setStep(s => s - 1)
                : navigate(
                    "mes-annonces"
                  )
            }
          >
            {step === 1
              ? "Annuler"
              : "← Précédent"}
          </button>

          {step < 3 ? (

            <button
              className="btn-send-premium"
              onClick={handleNext}
            >
              Suivant →
            </button>

          ) : (

            <button
              className="btn-send-premium"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
                ? "Modification..."
                : "💾 Sauvegarder"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}