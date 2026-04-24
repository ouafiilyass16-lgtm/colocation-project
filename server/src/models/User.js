
const mongoose = require("mongoose");

const etudiantProfile = require("./etudiantProfile");
const proprietaireProfile = require("./proprietaireProfile");
const adminProfile = require("./adminProfile");

const userSchema = new mongoose.Schema({
  nom: String,

  email: {
    type: String,
    unique: true,
    required: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["etudiant", "proprietaire", "admin"],
    default: "etudiant"
  },

  dateInscription: {
    type: Date,
    default: Date.now
  },
  etudiantProfile,
  proprietaireProfile,
  adminProfile
});

module.exports = mongoose.model("User", userSchema);

















// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//     nom: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     role: { 
//         type: String, 
//         enum: ['etudiant', 'proprietaire', 'administrateur'], 
//         default: 'étudiant' 
//     }
// }, { timestamps: true });

// module.exports = mongoose.model('User', UserSchema);