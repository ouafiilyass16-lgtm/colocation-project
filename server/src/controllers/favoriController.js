const Favori = require("../models/Favori");
const Annonce = require("../models/Annonce");

exports.addFavori = async (req, res) => {
  try {
   
    const etudiantId = req.user.id;

   
    const { annonceId } = req.params;

    const annonce = await Annonce.findById(annonceId);

    if (!annonce) {
      return res.status(404).json({
        message: "Annonce introuvable"
      });
    }

 
    const favori = await Favori.create({
      etudiant: etudiantId,
      annonce: annonceId
    });

    res.status(201).json({
      message: "Annonce ajoutée aux favoris",
      favori
    });
  } catch (error) {
  
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Cette annonce est déjà dans vos favoris"
      });
    }

    res.status(500).json({
      message: error.message
    });
  }
};

exports.getMesFavoris = async (req, res) => {
  try {
    const etudiantId = req.user.id;

   
    const favoris = await Favori.find({ etudiant: etudiantId })
      .populate("annonce");

    res.status(200).json(favoris);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

exports.deleteFavori = async (req, res) => {
  try {
   
    const etudiantId = req.user.id;

    
    const { annonceId } = req.params;


    const favori = await Favori.findOneAndDelete({
      etudiant: etudiantId,
      annonce: annonceId
    });

    if (!favori) {
      return res.status(404).json({
        message: "Favori introuvable"
      });
    }

    res.status(200).json({
      message: "Favori supprimé avec succès"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};