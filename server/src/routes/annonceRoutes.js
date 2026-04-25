const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const authMiddleware = require('../middleware/authMiddleware');

// ─── Routes publiques ─────────────────────────────────────────────────────────
router.get('/', annonceController.getAnnonces);
router.get('/:id', annonceController.getAnnonceById);

// ─── Routes protégées ────────────────────────────────────────────────────────
router.post('/', authMiddleware, annonceController.creerAnnonce);
router.get('/mes/annonces', authMiddleware, annonceController.getMesAnnonces);
router.put('/:id', authMiddleware, annonceController.modifierAnnonce);
router.patch('/:id/publier', authMiddleware, annonceController.publierAnnonce);
router.patch('/:id/archiver', authMiddleware, annonceController.archiverAnnonce);
router.delete('/:id', authMiddleware, annonceController.supprimerAnnonce);

// ─── Routes photos ────────────────────────────────────────────────────────────
router.post('/:id/photos', authMiddleware, annonceController.ajouterPhotos);
router.delete('/:id/photos/:photoId', authMiddleware, annonceController.supprimerPhoto);

module.exports = router;