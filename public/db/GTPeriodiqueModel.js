const mongoose = require("mongoose");

const GTPeriodiqueSchema = mongoose.Schema(
  {
    grandtotal_id: String,
    periode: String,
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
    signatureTicket: String
  },
  { strict: false }
);

module.exports = mongoose.model("grandstotauxperiodiques", GTPeriodiqueSchema);
