const mongoose = require("mongoose");

const CommandeSchema = mongoose.Schema(
  {
    id: String,
    ticketId: String,
    status: String,
    total: Number,
    createdAt: Number,
    updatedAt: Number,
    archived: String,
  },
  { strict: false }
);

module.exports = mongoose.model("commandes", CommandeSchema);
