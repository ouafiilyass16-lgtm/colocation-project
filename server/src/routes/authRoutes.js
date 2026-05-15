const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const User = require("../models/User");
const { register, login } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// Route pour récupérer les utilisateurs (Admin uniquement)
router.get("/users", [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;