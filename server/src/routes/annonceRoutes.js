const express = require('express');
const router = express.Router();
const annonceController = require('../controllers/annonceController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// ─── 1. ROUTES STATIQUES (priorité max, avant /:id) ───────────────────────────
router.get('/', annonceController.getAnnonces);
router.get('/recherche', annonceController.rechercherAnnonces);

// Admin — stats (compteurs légers)
router.get('/admin/stats', [authMiddleware, adminMiddleware], annonceController.getAdminStats);
// Admin — toutes les annonces filtrables par ?statut=
router.get('/admin/toutes', [authMiddleware, adminMiddleware], annonceController.getAnnoncesToutesAdmin);
// Admin — en attente uniquement
router.get('/admin/en-attente', [authMiddleware, adminMiddleware], annonceController.getAnnoncesEnAttente);

// Mes annonces (propriétaire)
router.get('/mes/annonces', authMiddleware, annonceController.getMesAnnonces);

// ─── 2. ROUTES DYNAMIQUES ─────────────────────────────────────────────────────
router.get('/:id', annonceController.getAnnonceById);
router.post('/', authMiddleware, annonceController.creerAnnonce);
router.put('/:id', authMiddleware, annonceController.modifierAnnonce);
router.patch('/:id/archiver', authMiddleware, annonceController.archiverAnnonce);
router.patch('/:id/valider', [authMiddleware, adminMiddleware], annonceController.validerAnnonce);
router.patch('/:id/rejeter', [authMiddleware, adminMiddleware], annonceController.rejeterAnnonce);
router.delete('/:id', authMiddleware, annonceController.supprimerAnnonce);

// ─── 3. PHOTOS ────────────────────────────────────────────────────────────────
router.post('/:id/photos', authMiddleware, annonceController.ajouterPhotos);
router.delete('/:id/photos/:photoId', authMiddleware, annonceController.supprimerPhoto);

module.exports = router;