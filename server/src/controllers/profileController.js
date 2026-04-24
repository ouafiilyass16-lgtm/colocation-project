const User = require("../models/User");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    let result = {
      _id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role
    };

    if (user.role === "etudiant") {
      result.etudiantProfile = user.etudiantProfile;
    }

    if (user.role === "proprietaire") {
      result.proprietaireProfile = user.proprietaireProfile;
    }

    if (user.role === "admin") {
      result.adminProfile = user.adminProfile;
    }

    res.json(result);

  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

exports.updateEtudiantProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "etudiant") {
      return res.status(403).json({ msg: "Accès interdit" });
    }

    user.etudiantProfile = req.body;

    await user.save();

    res.json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      etudiantProfile: user.etudiantProfile
    });

  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

// PROPRIETAIRE
exports.updateProprietaireProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "proprietaire") {
      return res.status(403).json({ msg: "Accès interdit" });
    }

    user.proprietaireProfile = req.body;

    await user.save();

    res.json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      proprietaireProfile: user.proprietaireProfile
    });

  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur" });
  }
};

// ADMIN
exports.updateAdminProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (user.role !== "admin") {
      return res.status(403).json({ msg: "Accès interdit" });
    }

    user.adminProfile = req.body;

    await user.save();

    res.json({
      _id: user._id,
      nom: user.nom,
      email: user.email,
      role: user.role,
      adminProfile: user.adminProfile
    });

  } catch (err) {
    res.status(500).json({ msg: "Erreur serveur" });
  }
};