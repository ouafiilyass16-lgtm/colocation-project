const express = require("express");
const router = express.Router();

const {
  addFavori,
  getMesFavoris,
  deleteFavori
} = require("../controllers/favoriController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/:annonceId", authMiddleware, addFavori);
router.get("/", authMiddleware, getMesFavoris);
router.delete("/:annonceId", authMiddleware, deleteFavori);

module.exports = router;