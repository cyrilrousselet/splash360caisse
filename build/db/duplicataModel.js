const mongoose = require("mongoose");

const DuplicataSchema = mongoose.Schema(
  {
    'ENC-DUP-NID': String,
    'ENC-DUP-ORI-NUM': String,
    'ENC-DUP-TYP': String,
    'ENC-DUP-PRN-NUM': Number,
    'ENC-DUP-OPS-NID': String,
    'ENC-DUP-HOR-GDH': String,
    'ENC-DUP-HASH': String,
    'ENC-TIK-ARG': String,
    'ENC-DUP-TAG-SIG': String,
    'ENC-DUP-RES': String,
    'ENC-TIK-ID-KEY': String,
    'ENC-DUP-VER': String,
    'ENC-SIG-RES': String,
    'ENC-SIG-MOTIF': String  
  },
  { strict: false }
);

module.exports = mongoose.model("duplicatas", DuplicataSchema);
