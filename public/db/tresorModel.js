const mongoose = require('mongoose');

const TresorSchema = mongoose.Schema(
  {
    id: String,
    tresorId: String,
    createdAt: Number,
    updatedAt: Number,
    user: String,
    caisse: {
      id: String,
      nom: String
    },
    origine: String,
    destination: String,
    credit: Number,
    debit: Number,
    solde: Number,
    type: String,
    detail: String,
    localsync: Array,
  },
  { strict: false}
);

module.exports = mongoose.model("tresorerie", TresorSchema);