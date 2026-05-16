// server/controllers/messageController.js
const Message       = require('../models/Message');
const User          = require('../models/User');
const socketManager = require('../socket'); // ← NOUVEAU

// ─── Envoyer un message ───────────────────────────────────────
exports.envoyerMessage = async (req, res) => {
  try {
    const { destinataireId, contenu, annonceId } = req.body;

    if (!destinataireId || !contenu)
      return res.status(400).json({ message: 'destinataireId et contenu sont obligatoires' });

    const destinataire = await User.findById(destinataireId);
    if (!destinataire)
      return res.status(404).json({ message: 'Destinataire non trouvé' });

    if (destinataireId === req.user.id)
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message à vous-même' });

    const message = new Message({
      expediteur:  req.user.id,
      destinataire: destinataireId,
      contenu,
      annonce: annonceId || null,
    });

    await message.save();

    const messagePopule = await Message.findById(message._id)
      .populate('expediteur',  'nom email')
      .populate('destinataire','nom email')
      .populate('annonce',     'titre ville prix');

    // ── Émettre le message en temps réel au destinataire ──────
    try {
      const io             = socketManager.getIO();
      const destSocketId   = socketManager.getSocketId(destinataireId);

      if (destSocketId) {
        // Le destinataire est en ligne → il reçoit le message instantanément
        io.to(destSocketId).emit("new_message", messagePopule);
        console.log(`📨 Message émis en temps réel vers ${destinataireId}`);
      }
    } catch (socketErr) {
      // Socket non dispo — pas critique, le polling prend le relais
      console.warn("Socket non dispo :", socketErr.message);
    }

    res.status(201).json({ message: 'Message envoyé avec succès', data: messagePopule });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ─── Boîte de réception ───────────────────────────────────────
exports.getMessagesRecus = async (req, res) => {
  try {
    const messages = await Message.find({ destinataire: req.user.id })
      .populate('expediteur', 'nom email')
      .populate('annonce',    'titre ville prix')
      .sort({ createdAt: -1 });

    res.status(200).json({
      total:  messages.length,
      nonLus: messages.filter(m => !m.lu).length,
      messages,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ─── Messages envoyés ─────────────────────────────────────────
exports.getMessagesEnvoyes = async (req, res) => {
  try {
    const messages = await Message.find({ expediteur: req.user.id })
      .populate('destinataire', 'nom email')
      .populate('annonce',      'titre ville prix')
      .sort({ createdAt: -1 });

    res.status(200).json({ total: messages.length, messages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ─── Conversation entre 2 users ───────────────────────────────
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { expediteur: req.user.id, destinataire: userId },
        { expediteur: userId,      destinataire: req.user.id },
      ],
    })
      .populate('expediteur',  'nom email')
      .populate('destinataire','nom email')
      .populate('annonce',     'titre ville prix')
      .sort({ createdAt: 1 });

    if (messages.length === 0)
      return res.status(404).json({ message: 'Aucune conversation trouvée' });

    await Message.updateMany(
      { expediteur: userId, destinataire: req.user.id, lu: false },
      { lu: true }
    );

    res.status(200).json({ total: messages.length, messages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ─── Messages liés à une annonce ──────────────────────────────
exports.getMessagesAnnonce = async (req, res) => {
  try {
    const { annonceId } = req.params;

    const messages = await Message.find({
      annonce: annonceId,
      $or: [
        { expediteur:  req.user.id },
        { destinataire: req.user.id },
      ],
    })
      .populate('expediteur',  'nom email')
      .populate('destinataire','nom email')
      .populate('annonce',     'titre ville prix')
      .sort({ createdAt: 1 });

    if (messages.length === 0)
      return res.status(404).json({ message: 'Aucun message trouvé pour cette annonce' });

    res.status(200).json({ total: messages.length, messages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ─── Marquer comme lu ─────────────────────────────────────────
exports.marquerCommeLu = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message)
      return res.status(404).json({ message: 'Message non trouvé' });
    if (message.destinataire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    message.lu = true;
    await message.save();

    // ── Notifier l'expéditeur que son message a été lu ────────
    try {
      const io            = socketManager.getIO();
      const senderSocketId = socketManager.getSocketId(message.expediteur.toString());

      if (senderSocketId) {
        io.to(senderSocketId).emit("message_read", {
          messageId: message._id,
        });
        console.log(`👁️ Lu notifié à ${message.expediteur}`);
      }
    } catch (socketErr) {
      console.warn("Socket non dispo :", socketErr.message);
    }

    res.status(200).json({ message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ─── Supprimer un message ─────────────────────────────────────
exports.supprimerMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message)
      return res.status(404).json({ message: 'Message non trouvé' });
    if (
      message.expediteur.toString()  !== req.user.id &&
      message.destinataire.toString() !== req.user.id
    )
      return res.status(403).json({ message: 'Accès refusé' });

    await message.deleteOne();
    res.status(200).json({ message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};