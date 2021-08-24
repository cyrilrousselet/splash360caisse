const mongoose = require("mongoose");

const CommandeSchema = mongoose.Schema(
  {
    id: String,
    ticketId: { type: [String], index: true },
    status: String,
    total: Number,
    createdAt: Number,
    updatedAt: Number,
    archived: String,
    localsync: Array,
    type: String,
  },
  { strict: false }
);

module.exports = mongoose.model("commandes", CommandeSchema);
