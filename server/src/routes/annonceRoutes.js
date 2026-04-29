const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ─── Routes publiques (SANS paramètre) ───────────────────────────────────────
router.get('/', annonceController.getAnnonces);
router.get('/recherche', annonceController.rechercherAnnonces);
router.get('/admin/en-attente', authMiddleware, adminMiddleware, annonceController.getAnnoncesEnAttente);
router.get('/mes/annonces', authMiddleware, annonceController.getMesAnnonces);

// ─── Routes avec /:id ─────────────────────────────────────────────────────────
router.get('/:id', annonceController.getAnnonceById);
router.post('/', authMiddleware, annonceController.creerAnnonce);
router.put('/:id', authMiddleware, annonceController.modifierAnnonce);
router.patch('/:id/archiver', authMiddleware, annonceController.archiverAnnonce);
router.patch('/:id/valider', authMiddleware, adminMiddleware, annonceController.validerAnnonce);
router.patch('/:id/rejeter', authMiddleware, adminMiddleware, annonceController.rejeterAnnonce);
router.delete('/:id', authMiddleware, annonceController.supprimerAnnonce);

// ─── Routes photos ────────────────────────────────────────────────────────────
router.post('/:id/photos', authMiddleware, annonceController.ajouterPhotos);
router.delete('/:id/photos/:photoId', authMiddleware, annonceController.supprimerPhoto);

module.exports = router;