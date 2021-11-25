const mongoose = require("mongoose");

const SignatureSchema = mongoose.Schema(
  {
    cle: String,
    liste: Array
  },
  { strict: false }
);

module.exports = mongoose.model("signatures", SignatureSchema);
