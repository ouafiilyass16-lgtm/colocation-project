// On importe mongoose
import mongoose from "mongoose";

// On crée le schéma de l'utilisateur
const userSchema = new mongoose.Schema(
  {
    // Nom
    name: {
      type: String,
      required: true,
    },

    // Email
    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Mot de passe
    password: {
      type: String,
      required: true,
    },

    // Rôle
    role: {
      type: String,
      enum: ["etudiant", "proprietaire"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// On crée le modèle
const User = mongoose.model("User", userSchema);

// On exporte le modèle
export default User;