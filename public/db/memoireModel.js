const mongoose = require("mongoose");

const MemoireSchema = mongoose.Schema(
  {
    cle: String,
    valeur: Object
  },
  { strict: false }
);

module.exports = mongoose.model("memoires", MemoireSchema);
