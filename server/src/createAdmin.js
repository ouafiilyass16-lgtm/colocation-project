
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash("admin123", salt);

  const admin = new User({
    nom: "Admin",
    email: "admin@locastudy.com",
    password,
    role: "admin",
  });

  await admin.save();
  console.log("✅ Admin créé avec succès !");
  process.exit();
}).catch(err => {
  console.error(err);
  process.exit(1);
});