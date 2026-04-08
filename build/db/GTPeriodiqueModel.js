const mongoose = require("mongoose");

const GTPeriodiqueSchema = mongoose.Schema(
  {
    gttype: String,
    // gttype: String,
    'ENC-GTP-ORI-NID': String,       // grandtotal_id: String,
    'ENC-GTP-ORI-NUM': String,       // periode: String,
    'ENC-GTP-MTN-TVA-TTC': String,   // tva_ttc: String,
    'ENC-GTP-MTN-TVA-HT': String,    // tva_ht: String,
    'ENC-GTP-MTN-TVA-TAUX': String,  // tva_taxe: String,
    'ENC-GTP-TTC': Number,           // total_ttc: Number,
    'ENC-GTP-HT': Number,            // total_ht: Number,
    'ENC-GTP-PER-TTC': Number,       // gtpca: Number,
    'ENC-GTP-PER-TTC-ABS': Number,   // gtpva: Number,
    'ENC-GTP-HOR-GDH': String,       // createdAt: String,
    'ENC-GTP-ARG': String,           // source_hash: String,
    'ENC-GTP-HASH': String,          // hash: String,
    'ENV-GTP-ID-KEY': String,        // trousseauId: String,
    'ENV-GTP-TAG-SIG': String        // signature: String
  },
  { strict: false }
);

module.exports = mongoose.model("grandstotauxperiodiques", GTPeriodiqueSchema);
