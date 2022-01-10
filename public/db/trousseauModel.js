const mongoose = require("mongoose");

const TrousseauSchema = mongoose.Schema(
  {
    trousseauId: String,
    privateKey: String,
    publicKey: String,
    createdAd: Number
  },
  { strict: false }
);

module.exports = mongoose.model("trousseaux", TrousseauSchema);
