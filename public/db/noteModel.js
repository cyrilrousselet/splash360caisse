const mongoose = require("mongoose");

const NoteSchema = mongoose.Schema(
  {
    'ENC-TIK-NUM': String,
    'ENC-TIK-CDE': String,
    'ENC-TIK-TAG-VER': String,
    'ENC-TIK-PRN-NBR': Number,
    'ENC-TIK-SOC-ETS': String,
    'ENC-TIK-SOC-ID': String,
    'ENC-TIK-SOC-ADR': String,
    'ENC-TIK-SOC-CCP': String,
    'ENC-TIK-SOC-VIL': String,
    'ENC-TIK-SOC-PAY': String,
    'ENC-TIK-SOC-SIR': String,
    'ENC-TIK-SOC-NAF': String,
    'ENC-TIK-SOC-TVA': String,
    'ENC-TIK-VEN-NID': String,
    'ENC-TIK-VEN-NOM': String,
    'ENC-TIK-OPS-NID': String,
    'ENC-TIK-OPS-NOM': String,
    'ENC-TIK-CAI-NID': String,
    'ENC-TIK-HOR-GDH': String,
    'ENC-OPE-TYP': String,
    'ENC-TIK-DOC-TYP': String,
    'ENC-TIK-LIG-NBR': Number,
    'ENC-TIK-TAG-SIG': String,
    'ENC-TIK-ID-KEY': String,
    'ENC-TIK-TAG-RET': String,
    'ENC-TIK-HASH': String,
    'ENC-TIK-ARG': String,
    'ENC-TIK-LOG': String,
    'ENC-TIK-TOT-MHT': Number,
    'ENC-TIK-TOT-TTC': Number,
    'FAC-TOT-TVA': Number,
    'ENC-TIK-REM-MTN': Number,
    'LIGNES':[{
      'ENC-NID': String,
      'ENC-TIK-ORI-NUM': String,
      'ENC-TIK-LIG-NUM': Number,
      'ENC-TIK-LIG-PRO-NID': String,
      'ENC-TIK-LIG-PRO-LIB': String,
      'ENC-TIK-LIG-PRO-QTE': Number,
      'ENC-TIK-LIG-TAX-NID': String,
      'ENC-TIK-LIG-TAX-TXX': Number,
      'ENC-TIK-LIG-PRO-MTH': Number,
      'ENC-TIK-LIG-PRO-TTC': Number,
      'ENC-TIK-LIG-REM-TXX': Number,
      'ENC-TIK-LIG-REM-TOT': Number,
      'ENC-TIK-LIG-TOT-MHT': Number,
      'ENC-TIK-LIG-TOT-TTC': Number,
      'ENC-TIK-LIG-OPE-TYP': String,
      'ENC-TIK-LIG-CAI-NID': String,
      'ENC-TIK-LIG-VEN-NID': String,
      'ENC-TIK-LIG-OPS-NID': String,
      'ENC-TIK-LIG-HOR-GDH': String
    }],
    'TVA': [{
      'ENC-NID': String,
      'ENC-TIK-TOT-MHT': Number,
      'ENC-TIK-TVA-NID': String,
      'ENC-TIK-TVA-TXX': Number,
      'ENC-TIK-TVA-MTN': Number
    }]
  },
  { strict: false }
);

module.exports = mongoose.model("notes", NoteSchema);
