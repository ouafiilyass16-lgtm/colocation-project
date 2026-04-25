const Annonce = require('../models/Annonce');

// Créer une annonce
exports.creerAnnonce = async (req, res) => {
  try {
    const {
      titre, description, prix, ville,
      typeLogement, surface, dateDisponibilite,
    } = req.body;

    const annonce = new Annonce({
      titre,
      description,
      prix,
      ville,
      typeLogement,
      surface,
      dateDisponibilite,
      proprietaire: req.user.id,
    });

    await annonce.save();
    res.status(201).json({ message: 'Annonce créée avec succès', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Toutes les annonces actives (publique)
exports.getAnnonces = async (req, res) => {
  try {
    const annonces = await Annonce.find({ statut: 'active' })
      .populate('proprietaire', 'nom email')
      .sort({ createdAt: -1 });

    res.status(200).json(annonces);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Une annonce par ID (publique)
exports.getAnnonceById = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id)
      .populate('proprietaire', 'nom email');

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });

    res.status(200).json(annonce);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Mes annonces (propriétaire connecté)
exports.getMesAnnonces = async (req, res) => {
  try {
    const annonces = await Annonce.find({ proprietaire: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json(annonces);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Modifier une annonce
exports.modifierAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    if (annonce.proprietaire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    Object.assign(annonce, req.body);
    await annonce.save();

    res.status(200).json({ message: 'Annonce modifiée', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Publier une annonce
exports.publierAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    if (annonce.proprietaire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    annonce.statut = 'active';
    await annonce.save();

    res.status(200).json({ message: 'Annonce publiée', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Archiver une annonce
exports.archiverAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    if (annonce.proprietaire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    annonce.statut = 'archivee';
    await annonce.save();

    res.status(200).json({ message: 'Annonce archivée', annonce });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Supprimer une annonce
exports.supprimerAnnonce = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    if (annonce.proprietaire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    await annonce.deleteOne();

    res.status(200).json({ message: 'Annonce supprimée' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Ajouter plusieurs photos (max 5 au total)
exports.ajouterPhotos = async (req, res) => {
  try {
    const { photos } = req.body;

    if (!Array.isArray(photos) || photos.length === 0)
      return res.status(400).json({ message: 'Envoyez un tableau de photos' });

    for (const photo of photos) {
      if (!photo.url) return res.status(400).json({ message: 'Chaque photo doit avoir une URL' });
    }

    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    if (annonce.proprietaire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    const totalApresAjout = annonce.photos.length + photos.length;
    if (totalApresAjout > 5)
      return res.status(400).json({
        message: `Maximum 5 photos autorisées. Vous avez déjà ${annonce.photos.length} photo(s), vous pouvez en ajouter ${5 - annonce.photos.length} de plus.`
      });

    const nouvellsPhotos = photos.map(p => ({ url: p.url, ordre: p.ordre || 0 }));

    await Annonce.findByIdAndUpdate(
      req.params.id,
      { $push: { photos: { $each: nouvellsPhotos } } },
      { new: true }
    );

    const annonceMAJ = await Annonce.findById(req.params.id);

    res.status(201).json({
      message: `${photos.length} photo(s) ajoutée(s) avec succès`,
      totalPhotos: annonceMAJ.photos.length,
      photos: annonceMAJ.photos,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Supprimer une photo
exports.supprimerPhoto = async (req, res) => {
  try {
    const annonce = await Annonce.findById(req.params.id);

    if (!annonce) return res.status(404).json({ message: 'Annonce non trouvée' });
    if (annonce.proprietaire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    const photoIndex = annonce.photos.findIndex(
      p => p._id.toString() === req.params.photoId
    );

    if (photoIndex === -1)
      return res.status(404).json({ message: 'Photo non trouvée' });

    annonce.photos.splice(photoIndex, 1);
    await annonce.save();

    res.status(200).json({
      message: 'Photo supprimée',
      totalPhotos: annonce.photos.length,
      photos: annonce.photos,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};