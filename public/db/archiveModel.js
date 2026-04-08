const mongoose = require("mongoose");

const ArchiveSchema = mongoose.Schema(
  {
    'TAG-ARC-HOR-GDH': String,
    'TAG-ARC-DOC': String,
    'TAG-ARC-OPS-NID': String,
    'TAG-ARC-CAI-NID': String,
    'TAG-ARC-OPE-TYP': String,
    'TAG-ARC-HASH': String,
    'TAG-ARC-ID-KEY': String,
    'TAG-ARC-SIG': String,
    'periode': String
  },
  { strict: false }
);

module.exports = mongoose.model("archives", ArchiveSchema);
