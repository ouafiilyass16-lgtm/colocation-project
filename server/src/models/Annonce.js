const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  url: { type: String, required: true },
  ordre: { type: Number, default: 0 },
  dateAjout: { type: Date, default: Date.now },
});

const annonceSchema = new mongoose.Schema({
  titre: { type: String, required: true },
  description: { type: String, required: true },
  prix: { type: Number, required: true },
  ville: { type: String, required: true },
  typeLogement: {
    type: String,
    enum: ['appartement', 'chambre', 'studio', 'maison', 'autre'],
    required: true,
  },
  surface: { type: Number, required: true },
  dateDisponibilite: { type: Date, required: true },
  statut: {
    type: String,
    enum: ['en_attente', 'active', 'archivee', 'rejetee'],
    default: 'en_attente',
  },
  commentaireAdmin: {
    type: String,
    default: null,
  },
  photos: {
    type: [photoSchema],
    validate: {
      validator: function (val) {
        return val.length <= 5;
      },
      message: 'Maximum 5 photos autorisées par annonce',
    },
  },
  proprietaire: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Annonce', annonceSchema);