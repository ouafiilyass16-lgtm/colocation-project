const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ─── Routes publiques ─────────────────────────────────────────────────────────
router.get('/', annonceController.getAnnonces);
router.get('/:id', annonceController.getAnnonceById);

// ─── Routes propriétaire ──────────────────────────────────────────────────────
router.post('/', authMiddleware, annonceController.creerAnnonce);
router.get('/mes/annonces', authMiddleware, annonceController.getMesAnnonces);
router.put('/:id', authMiddleware, annonceController.modifierAnnonce);
router.patch('/:id/archiver', authMiddleware, annonceController.archiverAnnonce);
router.delete('/:id', authMiddleware, annonceController.supprimerAnnonce);

// ─── Routes photos ────────────────────────────────────────────────────────────
router.post('/:id/photos', authMiddleware, annonceController.ajouterPhotos);
router.delete('/:id/photos/:photoId', authMiddleware, annonceController.supprimerPhoto);

// ─── Routes admin (AVANT /:id) ────────────────────────────────────────────────
router.get('/admin/en-attente', authMiddleware, adminMiddleware, annonceController.getAnnoncesEnAttente);
router.patch('/:id/valider', authMiddleware, adminMiddleware, annonceController.validerAnnonce);
router.patch('/:id/rejeter', authMiddleware, adminMiddleware, annonceController.rejeterAnnonce);

module.exports = router;