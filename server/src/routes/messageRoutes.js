const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

// Toutes les routes nécessitent un token
router.use(authMiddleware);

router.post('/', messageController.envoyerMessage);                          // Envoyer un message
router.get('/recus', messageController.getMessagesRecus);                    // Boîte de réception
router.get('/envoyes', messageController.getMessagesEnvoyes);                // Messages envoyés
router.get('/conversation/:userId', messageController.getConversation);      // Conversation avec un user
router.get('/annonce/:annonceId', messageController.getMessagesAnnonce);     // Messages d'une annonce
router.patch('/:id/lu', messageController.marquerCommeLu);                   // Marquer comme lu
router.delete('/:id', messageController.supprimerMessage);                   // Supprimer

module.exports = router;
