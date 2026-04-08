const mongoose = require("mongoose");

const AvoirSchema = mongoose.Schema(
  {
    avoir_id: String,
    emission: Number,
    limite: Number,
    operator: String,
    sur_moyen: String,
    client: String,
    commande: String,
    valeur: Number,
    code: String,
    createdAt: Number,
    updatedAt: Number,
    localsync: Array,
    id: String
  },
  { strict: false }
);

module.exports = mongoose.model("avoirs", AvoirSchema);
