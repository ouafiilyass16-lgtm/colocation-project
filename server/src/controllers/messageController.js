// server/controllers/messageController.js
const Message       = require('../models/Message');
const User          = require('../models/User');

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
      .populate('expediteur',  'nom email photoUrl')
      .populate('destinataire','nom email photoUrl')
      .populate('annonce',     'titre ville prix');

    // ── LOGIQUE DE DISTINCTION PREMIER CONTACT / DISCUSSION ──
    let messageDeRetour = 'Message envoyé avec succès';
    
    if (annonceId) {
      // On compte combien de messages existent entre ces deux utilisateurs pour CE logement précis
      const messageCount = await Message.countDocuments({
        annonce: annonceId,
        $or: [
          { expediteur: req.user.id, destinataire: destinataireId },
          { expediteur: destinataireId, destinataire: req.user.id }
        ]
      });

      // Si le compteur vaut 1, ça veut dire que l'unique message en BDD est celui qu'on vient de sauvegarder à l'instant
      if (messageCount === 1) {
        messageDeRetour = 'Demande envoyée avec succès';
      }
    }

    // On renvoie le bon texte dynamique selon le contexte
    res.status(201).json({ message: messageDeRetour, data: messagePopule });

  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// ─── Boîte de réception ───────────────────────────────────────
exports.getMessagesRecus = async (req, res) => {
  try {
    const messages = await Message.find({ destinataire: req.user.id })
      .populate('expediteur', 'nom email photoUrl')
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
      .populate('destinataire', 'nom email photoUrl')
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
      .populate('expediteur',  'nom email photoUrl')
      .populate('destinataire','nom email photoUrl')
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
      count: annonceId,
      $or: [
        { expediteur:  req.user.id },
        { destinataire: req.user.id },
      ],
    })
      .populate('expediteur',  'nom email photoUrl')
      .populate('destinataire','nom email photoUrl')
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