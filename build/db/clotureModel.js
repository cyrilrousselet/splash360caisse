const mongoose = require("mongoose");

const ClotureSchema = mongoose.Schema(
  {
    clotureId: String,
    ctype: String,
    archivedcommandesid: [String],
    comptage: {},
    periode: {
      ca: Number,
      caisses: [],
      // debut: String,
      depenses: Number,
      editeur: {
        // createdAt: String,
        droits: {
          cartes: Boolean,
          clients: Boolean,
          cloture: Boolean,
          depenses: Boolean,
          employes: Boolean,
          listecommandes: Boolean,
          marketing: Boolean,
          menu: Boolean,
          parametres: Boolean,
          remise: Boolean,
          statistiques: Boolean,
          stocks: Boolean,
        },
        id: String,
        identifiant: String,
        nom: String,
        status: String,
        // updatedAt: String,
        user_id: String,
      },
      emission: Number,
      fdcaisse: Number,
      // fin: String,
      mtcaisse: Number,
      numtickets: Number,
      paramfdcaisse: Number,
      remboursements: Number,
      ticket_moyen: Number,
      vendeurs: [],
      ventes: Number,
      ventilation: {
        moyen: {},
        tva: {},
        vendeur: {},
      },
    },
    prelevement: Number,
    createdAt: Number,
    updatedAt: Number,
    id: String,
    localsync: Array,
  },
  { strict: false }
);

module.exports = mongoose.model("clotures", ClotureSchema);
