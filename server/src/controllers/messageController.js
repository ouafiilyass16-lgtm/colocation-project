const Message = require('../models/Message');
const User = require('../models/User');

// Envoyer un message (direct ou lié à une annonce)
exports.envoyerMessage = async (req, res) => {
  try {
    const { destinataireId, contenu, annonceId } = req.body;

    if (!destinataireId || !contenu)
      return res.status(400).json({ message: 'destinataireId et contenu sont obligatoires' });

    // Vérifier que le destinataire existe
    const destinataire = await User.findById(destinataireId);
    if (!destinataire)
      return res.status(404).json({ message: 'Destinataire non trouvé' });

    // Empêcher d'envoyer un message à soi-même
    if (destinataireId === req.user.id)
      return res.status(400).json({ message: 'Vous ne pouvez pas vous envoyer un message à vous-même' });

    const message = new Message({
      expediteur: req.user.id,
      destinataire: destinataireId,
      contenu,
      annonce: annonceId || null,
    });

    await message.save();

    const messagePopule = await Message.findById(message._id)
      .populate('expediteur', 'nom email')
      .populate('destinataire', 'nom email')
      .populate('annonce', 'titre ville prix');

    res.status(201).json({ message: 'Message envoyé avec succès', data: messagePopule });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Voir ma boîte de réception (messages reçus)
exports.getMessagesRecus = async (req, res) => {
  try {
    const messages = await Message.find({ destinataire: req.user.id })
      .populate('expediteur', 'nom email')
      .populate('annonce', 'titre ville prix')
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: messages.length,
      nonLus: messages.filter(m => !m.lu).length,
      messages,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Voir mes messages envoyés
exports.getMessagesEnvoyes = async (req, res) => {
  try {
    const messages = await Message.find({ expediteur: req.user.id })
      .populate('destinataire', 'nom email')
      .populate('annonce', 'titre ville prix')
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: messages.length,
      messages,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Voir la conversation entre deux utilisateurs
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;

    const messages = await Message.find({
      $or: [
        { expediteur: req.user.id, destinataire: userId },
        { expediteur: userId, destinataire: req.user.id },
      ],
    })
      .populate('expediteur', 'nom email')
      .populate('destinataire', 'nom email')
      .populate('annonce', 'titre ville prix')
      .sort({ createdAt: 1 });

    if (messages.length === 0)
      return res.status(404).json({ message: 'Aucune conversation trouvée avec cet utilisateur' });

    // Marquer les messages reçus comme lus
    await Message.updateMany(
      { expediteur: userId, destinataire: req.user.id, lu: false },
      { lu: true }
    );

    res.status(200).json({
      total: messages.length,
      messages,
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Voir les messages liés à une annonce
exports.getMessagesAnnonce = async (req, res) => {
  try {
    const { annonceId } = req.params;

    const messages = await Message.find({
      annonce: annonceId,
      $or: [
        { expediteur: req.user.id },
        { destinataire: req.user.id },
      ],
    })
      .populate('expediteur', 'nom email')
      .populate('destinataire', 'nom email')
      .populate('annonce', 'titre ville prix')
      .sort({ createdAt: 1 });

    if (messages.length === 0)
      return res.status(404).json({ message: 'Aucun message trouvé pour cette annonce' });

    res.status(200).json({ total: messages.length, messages });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Marquer un message comme lu
exports.marquerCommeLu = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: 'Message non trouvé' });
    if (message.destinataire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    message.lu = true;
    await message.save();

    res.status(200).json({ message: 'Message marqué comme lu' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};

// Supprimer un message
exports.supprimerMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) return res.status(404).json({ message: 'Message non trouvé' });
    if (message.expediteur.toString() !== req.user.id &&
        message.destinataire.toString() !== req.user.id)
      return res.status(403).json({ message: 'Accès refusé' });

    await message.deleteOne();

    res.status(200).json({ message: 'Message supprimé' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur', error: err.message });
  }
};
