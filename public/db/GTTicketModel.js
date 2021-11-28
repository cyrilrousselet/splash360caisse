const mongoose = require("mongoose");

const GTTicketSchema = mongoose.Schema(
  {
    // grandtotal_id: String,
    numeroTicket: String,
    tva_ttc: String,
    tva_ht: String,
    tva_taux: String,
    total_ttc: Number,
    total_ht: Number,
    gtpca: Number,
    gtpva: Number,
    createdAt: String,
    source_hash: String,
    hash_ticket: String,
    trousseauId: String,
    signature_ticket: String
  },
  { strict: false }
);

module.exports = mongoose.model("grandstotauxtickets", GTTicketSchema);
