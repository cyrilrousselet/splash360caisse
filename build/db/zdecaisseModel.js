const mongoose = require("mongoose");

const ZdeCaisseSchema = mongoose.Schema(
  {
    zid: String,
    ztype: String,
    comptage: {},
    periode: String,
    ca: Number,
    caisse: String,
    depenses: Number,
    editeur: {      
      nom: String,
      user_id: String,
    },
    emission: Number,
    fdcaisse: Number,
    mtcaisse: Number,
    numtickets: Number,
    paramfdcaisse: Number,
    remboursements: Number,
    ticket_moyen: Number,
    ventes: Number,
    ventilation: {
      moyen: {},
      tva: {},
      vendeur: {},
    },
    prelevement: Number,
    staffmeals: Number,
    createdAt: String,
    source: String,
    hash: String,
    signature: String,
    trousseauId: String,
    localsync: Array,
  },
  { strict: false }
);

module.exports = mongoose.model("zdecaisse", ZdeCaisseSchema);
