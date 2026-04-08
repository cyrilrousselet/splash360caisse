const mongoose = require("mongoose");

const TicketrestauSchema = mongoose.Schema(
  {
    id: String,
    valeur: Number,
    valid: Number,
    localsync: Array,
    createdAt: Number,
    updatedAt: Number
  },
  { strict: false }
);

module.exports = mongoose.model("ticketsrestau", TicketrestauSchema);
