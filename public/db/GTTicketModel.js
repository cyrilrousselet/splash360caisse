const mongoose = require("mongoose");

const GTTicketSchema = mongoose.Schema(
  {
    'ENC-GTT-ORI-NUM': String,       // numeroTicket: String,
    'ENC-GTT-MTN-TVA-TTC': String,   // tva_ttc: String,
    'ENC-GTT-MTN-TVA-HT': String,    // tva_ht: String,
    'ENC-GTT-MTN-TVA-TAUX': String,  // tva_taxe: String,
    'ENC-GTT-TTC': Number,           // total_ttc: Number,
    'ENC-GTT-HT': Number,            // total_ht: Number,
    'ENC-GTT-PER-TTC': Number,       // gtpca: Number,
    'ENC-GTT-PER-TTC-ABS': Number,   // gtpva: Number,
    'ENC-GTT-HOR-GDH': String,       // createdAt: String,
    'ENC-GTT-ARG': String,           // source_hash: String,
    'ENC-GTT-HASH': String,          // hash_ticket: String,
    'ENC-GTT-ID-KEY': String,        // trousseauId: String,
    'ENC-GTT-TAG-SIG': String        // signature_ticket: String
  },
  { strict: false }
);

module.exports = mongoose.model("grandstotauxtickets", GTTicketSchema);
