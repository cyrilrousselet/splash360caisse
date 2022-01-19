const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
      nom: String,
      identifiant: String,
      taux_horaire: String,
      status: String,
      livreur: Boolean,
      coordonnees: String,
      droits: {},
      localsync: Array,
      user_id: String,
      createdAt: Number,
      updatedAt: Number  
    },
  { strict: false }
);

module.exports = mongoose.model("users", UserSchema);
