module.exports = {
  telephone: String,
  adresse: String,
  nbAnnonces: {
    type: Number,
    default: 0
  },
  verifie: {
    type: Boolean,
    default: false
  }
};