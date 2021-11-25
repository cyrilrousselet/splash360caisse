const mongoose = require("mongoose");

const NumerotationSchema = mongoose.Schema(
  {
    cle: String,
    valeur: Number
  },
  { strict: false }
);

module.exports = mongoose.model("numerotation", NumerotationSchema);
