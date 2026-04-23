const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connexion à MongoDB réussie !");
    } catch (err) {
        console.error("❌ Erreur de connexion MongoDB :", err.message);
        process.exit(1); // Arrête l'app en cas d'échec
    }
};

module.exports = connectDB;