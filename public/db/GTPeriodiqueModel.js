const mongoose = require("mongoose");

const GTPeriodiqueSchema = mongoose.Schema(
  {
    gttype: String,
    grandtotal_id: String,
    periode: String,
    tva_ttc: String,
    tva_ht: String,
    tva_taxe: String,
    total_ttc: Number,
    total_ht: Number,
    gtpca: Number,
    gtpva: Number,
    createdAt: String,
    source_hash: String,
    hash: String,
    trousseauId: String,
    signature: String
  },
  { strict: false }
);

module.exports = mongoose.model("grandstotauxperiodiques", GTPeriodiqueSchema);
