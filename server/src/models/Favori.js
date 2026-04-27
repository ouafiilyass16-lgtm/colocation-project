const mongoose = require("mongoose");

const favoriSchema = new mongoose.Schema(
  {
    etudiant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    annonce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Annonce",
      required: true
    }
  },
  { timestamps: true }
);

// éviter qu’un étudiant ajoute la même annonce 2 fois
favoriSchema.index({ etudiant: 1, annonce: 1 }, { unique: true });

module.exports = mongoose.model("Favori", favoriSchema);