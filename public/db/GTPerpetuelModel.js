const mongoose = require("mongoose");

const GTPerpetuelSchema = mongoose.Schema(
  {
    id: Number,
    calculAlgebrique: Number,
    valeurAbsolue: Number,
    updatedAt: Number
  },
  { strict: false }
);

module.exports = mongoose.model("gtperpetuel", GTPerpetuelSchema);
