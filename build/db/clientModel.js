const mongoose = require("mongoose");

const ClientSchema = mongoose.Schema(
  {
    client_id: String,
    prenom: String,
    nom: String,
    email: String,
    telephone: String,
    telephone2: String,
    adresse: String,
    adresse2: String,
    batiment: String,
    etage: String,
    codepostal: String,
    ville: String,
    commentaire: String,
    prenom_canonical: String,
    nom_canonical: String,
    inscription: Number,
    secteur: Number,
    createdAt: Number,
    updatedAt: Number,
    localsync: Array,
    id: String
  },
  { strict: false }
);

module.exports = mongoose.model("clients", ClientSchema);
