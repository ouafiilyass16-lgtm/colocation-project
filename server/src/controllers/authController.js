const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Inscription
exports.register = async (req, res) => {
    try {
        const { nom, email, password, role } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: "Utilisateur déjà existant" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ nom, email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ msg: "Utilisateur enregistré avec succès" });
    } catch (err) {
        res.status(500).send("Erreur serveur");
    }
};

// Connexion
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: "Identifiants invalides" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: "Identifiants invalides" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, nom: user.nom, role: user.role } });
    } catch (err) {
        res.status(500).send("Erreur serveur");
    }
};