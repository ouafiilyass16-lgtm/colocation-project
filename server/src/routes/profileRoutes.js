const express = require("express");
const router = express.Router();

const {
  getProfile,
  updatePhoto,
  deletePhoto,
  updateEtudiantProfile,
  updateProprietaireProfile,
  updateAdminProfile
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, getProfile);

router.put("/photo", authMiddleware, updatePhoto);
router.delete("/photo", authMiddleware, deletePhoto);
router.put("/etudiant", authMiddleware, updateEtudiantProfile);
router.put("/proprietaire", authMiddleware, updateProprietaireProfile);
router.put("/admin", authMiddleware, updateAdminProfile);

module.exports = router;